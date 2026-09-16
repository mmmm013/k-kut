#!/usr/bin/env python3
"""Private, offline FullMix copy-capture worker; never publishes or approves audio.

Inputs are a pinned current inventory snapshot and reviewed evidence files.
The worker checks their identities and hashes; it does not establish musical,
rights, or URL authority. See docs/operations/FULLMIX_BATCH_WORKER.md.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import tempfile
import wave


class Hold(ValueError):
    pass


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def checked_file(root, reference):
    if not isinstance(reference, dict):
        raise Hold('MISSING_FILE_EVIDENCE')
    file = (root / reference.get('path', '')).resolve()
    if not file.is_relative_to(root.resolve()) or not file.is_file():
        raise Hold('EVIDENCE_FILE_UNAVAILABLE')
    if digest(file) != reference.get('sha256'):
        raise Hold('EVIDENCE_HASH_CONFLICT')
    return file


def install_immutable(temp, target):
    """Atomic create, never replace; identical replay is the only permitted reuse."""
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        os.link(temp, target)
    except FileExistsError:
        if digest(temp) != digest(target):
            raise Hold('EXISTING_OUTPUT_CONFLICT')
    finally:
        temp.unlink(missing_ok=True)


def capture(source, target, start, end):
    if type(start) is not int or type(end) is not int:
        raise Hold('BOUNDARIES_MUST_BE_SAMPLE_FRAMES')
    target.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(dir=target.parent, suffix='.part')
    os.close(fd)
    temp = Path(name)
    try:
        expected = hashlib.sha256()
        with wave.open(str(source), 'rb') as src:
            if start < 0 or end <= start or end > src.getnframes():
                raise Hold('BOUNDARIES_OUTSIDE_SOURCE')
            if src.getcomptype() != 'NONE':
                raise Hold('UNSUPPORTED_WAV_ENCODING')
            params = src.getparams()
            width = src.getsampwidth() * src.getnchannels()
            src.setpos(start)
            remaining = end - start
            with wave.open(str(temp), 'wb') as dst:
                dst.setparams(params)
                while remaining:
                    frames = min(remaining, 65536)
                    data = src.readframes(frames)
                    if len(data) != frames * width:
                        raise Hold('TRUNCATED_SOURCE')
                    expected.update(data)
                    dst.writeframesraw(data)
                    remaining -= frames
        observed = hashlib.sha256()
        with wave.open(str(temp), 'rb') as output:
            if output.getnframes() != end - start:
                raise Hold('CAPTURE_LENGTH_MISMATCH')
            for data in iter(lambda: output.readframes(65536), b''):
                observed.update(data)
        if observed.digest() != expected.digest():
            raise Hold('CAPTURE_SAMPLE_MISMATCH')
        install_immutable(temp, target)
        return {'audio_sha256': digest(target), 'pcm_sha256': observed.hexdigest(),
                'start_frame': start, 'end_frame': end, 'sample_rate': params.framerate}
    finally:
        temp.unlink(missing_ok=True)


def validate_inventory(inventory, expected_count):
    members = inventory.get('members', [])
    if inventory.get('schema') != 'FULLMIX_PRIVATE_BUILD_V1':
        raise Hold('UNKNOWN_INVENTORY_SCHEMA')
    if len(members) != expected_count:
        raise Hold('CURRENT_INVENTORY_COUNT_MISMATCH')
    ids = [m.get('source_track_id') for m in members]
    fm_ids = [m.get('fm_id') for m in members]
    if len(set(ids)) != len(ids) or len(set(fm_ids)) != len(fm_ids):
        raise Hold('DUPLICATE_SOURCE_IDENTITY')
    if set(ids) != set(inventory.get('current_fullmix_track_ids', [])):
        raise Hold('CURRENT_FULLMIX_MEMBERSHIP_MISMATCH')
    for m in members:
        if m.get('inventory_lane') != 'FULLMIX':
            raise Hold('INSTRO_ONLY_IS_NOT_A_KUT_SOURCE')
        if not all(isinstance(m.get(k), str) and m[k] for k in ('source_track_id', 'fm_id')):
            raise Hold('MISSING_SOURCE_IDENTITY')
    return members


def plan_captures(bundle, member, source):
    if bundle.get('source_track_id') != member['source_track_id'] or bundle.get('fm_id') != member['fm_id']:
        raise Hold('BOUNDARY_SOURCE_IDENTITY_CONFLICT')
    if bundle.get('source_sha256') != digest(source):
        raise Hold('BOUNDARY_SOURCE_HASH_CONFLICT')
    if bundle.get('state') != 'LOCKED':
        raise Hold('BLK_MAP_NOT_LOCKED')
    with wave.open(str(source), 'rb') as audio:
        rate, length = audio.getframerate(), audio.getnframes()
    if bundle.get('sample_rate') != rate:
        raise Hold('BOUNDARY_SAMPLE_RATE_CONFLICT')
    blocks = bundle.get('blocks', [])
    if not blocks:
        raise Hold('MISSING_PROVEN_BLKS')
    captures, by_id, last_end = [], {}, -1
    for b in blocks:
        key, start, end = b.get('id'), b.get('start_frame'), b.get('end_frame')
        if not isinstance(key, str) or not key or key in by_id:
            raise Hold('INVALID_BLK_IDENTITY')
        if type(start) is not int or type(end) is not int or start < 0 or start < last_end or end <= start or end > length:
            raise Hold('INVALID_SEQUENTIAL_BLK_MAP')
        by_id[key] = len(captures)
        captures.append({'kind': 'KK', 'blk_ids': [key], 'start': start, 'end': end})
        last_end = end
    for group in bundle.get('kombos', []):
        if not isinstance(group, list) or len(group) < 2 or any(k not in by_id for k in group):
            raise Hold('INVALID_KOMBO')
        indices = [by_id[k] for k in group]
        if indices != list(range(indices[0], indices[0] + len(indices))):
            raise Hold('NONCONTIGUOUS_KOMBO')
        captures.append({'kind': 'KK-KOMBO', 'blk_ids': group,
                         'start': blocks[indices[0]]['start_frame'], 'end': blocks[indices[-1]]['end_frame']})
    return captures


def validate_proof_files(files, member, source_sha256, root):
    for kind, path in files.items():
        if kind == 'locked_blk_map':
            continue
        record = json.loads(path.read_text())
        if record.get('verification_state') != 'VERIFIED' or not record.get('verification_record_ref'):
            raise Hold('UNVERIFIED_' + kind.upper())
        if any(record.get(key) != value for key, value in
               (('source_track_id', member['source_track_id']), ('fm_id', member['fm_id']),
                ('source_sha256', source_sha256))):
            raise Hold('CROSS_SOURCE_' + kind.upper())
        if kind == 'complete_transcript':
            transcript = checked_file(root, record.get('transcript'))
            if not transcript.read_text().strip():
                raise Hold('EMPTY_TRANSCRIPT')


def build(inventory, root, output, expected_count=324):
    members = validate_inventory(inventory, expected_count)
    output = output.resolve()
    output.mkdir(parents=True, exist_ok=True)
    # A private output tree is required; never write into public application audio.
    if 'public' in output.parts:
        raise Hold('PUBLIC_OUTPUT_FORBIDDEN')
    results = []
    for member in members:
        result = {'source_track_id': member['source_track_id'], 'fm_id': member['fm_id'],
                  'inventory_active': True, 'captures': [], 'product_ready': False}
        try:
            if not member.get('local_source'):
                raise Hold('SOURCE_COPY_NOT_AVAILABLE')
            source = checked_file(root, member['local_source'])
            sha = digest(source)
            # Content-addressed paths cannot overwrite another source or revision.
            target = output / 'sources' / sha / 'source.wav'
            target.parent.mkdir(parents=True, exist_ok=True)
            fd, name = tempfile.mkstemp(dir=target.parent, suffix='.part')
            os.close(fd)
            temp = Path(name)
            try:
                shutil.copyfile(source, temp)
                if digest(temp) != sha:
                    raise Hold('SOURCE_CHANGED_DURING_COPY')
                install_immutable(temp, target)
            finally:
                temp.unlink(missing_ok=True)
            result.update(source_sha256=sha, source_copy=str(target), source_copy_state='HASH_VERIFIED')
            proof = member.get('proof', {})
            verified = {kind: checked_file(root, proof.get(kind)) for kind in
                        ('source_authority', 'rights_lineage', 'complete_transcript', 'full_source_listening', 'locked_blk_map')}
            validate_proof_files(verified, member, sha, root)
            bundle = json.loads(verified['locked_blk_map'].read_text())
            captures = plan_captures(bundle, member, target)
            for item in captures:
                identity = {**item, 'source_track_id': member['source_track_id'], 'fm_id': member['fm_id'],
                            'source_sha256': sha, 'proof_sha256': digest(verified['locked_blk_map'])}
                key = hashlib.sha256(json.dumps(identity, sort_keys=True).encode()).hexdigest()
                audio = output / 'captures' / key / 'capture.wav'
                check = capture(target, audio, item['start'], item['end'])
                result['captures'].append({**identity, **check, 'path': str(audio),
                                          'state': 'PCM_VERIFIED_PENDING_MUSICAL_REVIEW'})
            result['state'] = 'CAPTURED_PENDING_MUSICAL_REVIEW'
        except (Hold, wave.Error, OSError, ValueError, KeyError, TypeError) as error:
            result['state'] = 'TRIAGE'
            result['reason'] = str(error) if isinstance(error, Hold) else type(error).__name__
        results.append(result)
    receipt = {'schema': 'FULLMIX_PRIVATE_BUILD_RECEIPT_V1', 'inventory_count': len(results),
               'source_copy_count': sum(r.get('source_copy_state') == 'HASH_VERIFIED' for r in results),
               'capture_count': sum(len(r['captures']) for r in results), 'finished_ii_count': 0,
               'members': results}
    raw = (json.dumps(receipt, indent=2) + '\n').encode()
    name = hashlib.sha256(raw).hexdigest() + '.json'
    fd, tmp = tempfile.mkstemp(dir=output, suffix='.part')
    with os.fdopen(fd, 'wb') as stream:
        stream.write(raw)
    install_immutable(Path(tmp), output / name)
    return receipt, output / name


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inventory', type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    receipt, file = build(json.loads(args.inventory.read_text()), args.inventory.parent, args.output)
    print(json.dumps({k: receipt[k] for k in ('inventory_count', 'source_copy_count', 'capture_count', 'finished_ii_count')}))
    print(f'Receipt: {file}')


if __name__ == '__main__':
    main()
