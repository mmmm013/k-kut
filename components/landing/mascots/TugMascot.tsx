export default function TugMascot({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center gap-1 rounded-full bg-amber-300/20 px-2">
      <span
        aria-hidden="true"
        className={`text-xl ${
          isPreview
            ? "-translate-x-1 translate-y-1 motion-reduce:translate-x-0 motion-reduce:translate-y-0"
            : "translate-y-1"
        }`}
      >
        🐭
      </span>
      <span
        aria-hidden="true"
        className={`text-2xl transition-transform duration-200 ${
          isPreview
            ? "translate-x-1 -translate-y-1 motion-reduce:translate-x-0 motion-reduce:translate-y-0"
            : "-translate-y-0.5"
        }`}
      >
        🐘
      </span>
    </div>
  );
}
