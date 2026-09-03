type ApprovedLyricHighlightProps = {
  lines: string[];
  className?: string;
};

export default function ApprovedLyricHighlight({
  lines,
  className = "",
}: ApprovedLyricHighlightProps) {
  if (lines.length === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-[#FFD54F]/20 bg-[#FFD54F]/8 p-3 ${className}`.trim()}
      data-approved-lyric-highlight="true"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#FFD54F]">
        Highlighted lines
      </p>
      <div className="mt-3 space-y-2">
        {lines.map((line, index) =>
          line === "…" ? (
            <p
              key={`${line}-${index}`}
              className="px-1 text-center text-xs font-black uppercase tracking-[0.3em] text-[#FFD54F]/70"
            >
              {line}
            </p>
          ) : (
            <p
              key={`${line}-${index}`}
              className="rounded-xl bg-[#FFD54F]/14 px-3 py-2 text-sm font-black leading-6 text-[#FFF8E1]"
            >
              {line}
            </p>
          ),
        )}
      </div>
    </div>
  );
}
