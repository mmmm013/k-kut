export default function BugMascot({ isPreview }: { isPreview: boolean }) {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-lime-300/20">
      <span
        aria-hidden="true"
        className={`text-3xl ${isPreview ? "animate-bounce motion-reduce:animate-none" : ""}`}
      >
        🐞
      </span>
    </div>
  );
}
