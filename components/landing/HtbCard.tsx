import type { TierMode } from "@/lib/landing/htbMachine";
import BugMascot from "./mascots/BugMascot";
import HugMascot from "./mascots/HugMascot";
import TugMascot from "./mascots/TugMascot";

const MODE_LABEL: Record<TierMode, string> = {
  HUG: "HUG — flash animation",
  TUG: "TUG — mouse pulling elephant",
  BUG: "BUG — fun bouncing BUGs",
};

const MODE_KEY_HINT: Record<TierMode, string> = {
  HUG: "1",
  TUG: "2",
  BUG: "3",
};

function Mascot({ mode, isPreview }: { mode: TierMode; isPreview: boolean }) {
  if (mode === "HUG") return <HugMascot isPreview={isPreview} />;
  if (mode === "TUG") return <TugMascot isPreview={isPreview} />;
  return <BugMascot isPreview={isPreview} />;
}

export default function HtbCard({
  mode,
  isPreview,
  isFocused,
  onSelect,
  onPreview,
  onPreviewEnd,
}: {
  mode: TierMode;
  isPreview: boolean;
  isFocused: boolean;
  onSelect: (mode: TierMode) => void;
  onPreview: (mode: TierMode) => void;
  onPreviewEnd: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-label={`${mode} tier option`}
      aria-selected={isFocused}
      onMouseEnter={() => onPreview(mode)}
      onMouseLeave={onPreviewEnd}
      onFocus={() => onPreview(mode)}
      onBlur={onPreviewEnd}
      onClick={() => onSelect(mode)}
      className="group flex min-h-[14rem] w-full flex-col items-center justify-between rounded-3xl border border-[#FFD54F]/45 bg-[#120A06] p-5 text-left text-[#FFF8E1] transition duration-200 hover:border-[#FFD54F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD54F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09070B]"
    >
      <p className="w-full text-xs font-black uppercase tracking-[0.22em] text-[#FFD54F]">
        Press {MODE_KEY_HINT[mode]}
      </p>
      <Mascot mode={mode} isPreview={isPreview} />
      <p className="w-full text-sm font-black leading-6 text-[#FFF8E1]">{MODE_LABEL[mode]}</p>
    </button>
  );
}
