export default function HugMascot({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose-300/20">
      <span
        aria-hidden="true"
        className={`absolute h-full w-full rounded-full bg-rose-300/35 ${
          isPreview ? "animate-ping motion-reduce:animate-none" : "animate-pulse motion-reduce:animate-none"
        }`}
      />
      <span className="relative text-3xl" aria-hidden="true">
        💗
      </span>
    </div>
  );
}
