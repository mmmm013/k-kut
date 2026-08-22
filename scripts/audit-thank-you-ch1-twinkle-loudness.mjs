import { spawnSync } from "node:child_process";
import fs from "node:fs";

const packet = JSON.parse(fs.readFileSync("data/kkr/canary/thank-you-ch1-medium75-release-packet.json", "utf8"));
const transition = packet.transition;
const audioPath = "public" + packet.customer_audio_url;

function stop(message) {
  throw new Error(message);
}

function command(name, args) {
  const result = spawnSync(name, args, { encoding: "utf8" });
  if (result.error) stop(`${name} unavailable: ${result.error.message}`);
  if (result.status !== 0) stop(`${name} failed: ${String(result.stderr).trim()}`);
  return { stdout: String(result.stdout), stderr: String(result.stderr) };
}

function measurement(start, end) {
  const result = command("ffmpeg", [
    "-hide_banner", "-nostats", "-ss", String(start), "-t", String(end - start),
    "-i", audioPath, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"
  ]);
  const match = result.stderr.match(/\{[\s\S]*\}\s*$/);
  if (!match) stop("ffmpeg did not emit loudnorm JSON");
  const value = JSON.parse(match[0]);
  const lufs = Number(value.input_i);
  if (!Number.isFinite(lufs)) stop("loudnorm measurement is not numeric");
  return lufs;
}

if (!transition || transition.tail_padding_before_twinkle_seconds !== 1.0) stop("expected 1.0-second Twinkle transition");
if (!fs.existsSync(audioPath)) stop(`missing canary audio: ${audioPath}`);
const duration = Number(command("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audioPath]).stdout.trim());
if (!Number.isFinite(duration) || duration <= transition.twinkle_tail_seconds + transition.preceding_window_seconds) stop("audio is too short for loudness windows");
const twinkleStart = duration - transition.twinkle_tail_seconds;
const payloadEnd = twinkleStart - transition.tail_padding_before_twinkle_seconds;
const payloadStart = payloadEnd - transition.preceding_window_seconds;
const payloadLufs = measurement(payloadStart, payloadEnd);
const twinkleLufs = measurement(twinkleStart, duration);
const delta = Math.abs(payloadLufs - twinkleLufs);
if (delta > transition.max_integrated_lufs_delta) stop(`Twinkle loudness delta ${delta.toFixed(2)} LU exceeds ${transition.max_integrated_lufs_delta} LU`);
console.log(`THANK YOU CH1 TWINKLE LOUDNESS PASS: payload ${payloadLufs.toFixed(2)} LUFS, Twinkle ${twinkleLufs.toFixed(2)} LUFS, delta ${delta.toFixed(2)} LU`);
