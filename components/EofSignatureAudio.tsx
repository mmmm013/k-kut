type EofSignatureAudioProps = {
  src: string;
  className?: string;
  directLabel?: string;
};

export default function EofSignatureAudio({
  src,
  className = "",
  directLabel = "Open audio directly",
}: EofSignatureAudioProps) {
  const audioSrc = src?.trim();

  if (!audioSrc) {
    return (
      <div className={`rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-200 ${className}`}>
        Audio source unavailable.
      </div>
    );
  }

  return (
    <div className={className}>
      <audio key={audioSrc} controls preload="auto" className="w-full rounded">
        <source src={audioSrc} type="audio/mpeg" />
        Your browser does not support audio playback.
      </audio>
      <a
        href={audioSrc}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-xs font-black text-[#FFD36A] underline"
      >
        {directLabel}
      </a>
    </div>
  );
}
