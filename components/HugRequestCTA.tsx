type HugRequestCTAProps = {
  category?: string;
  href?: string;
};

export default function HugRequestCTA({
  category = "this HUG",
  href = "/find",
}: HugRequestCTAProps) {
  return (
    <section className="mt-8 rounded-2xl border p-6 text-center">
      <p className="text-sm uppercase tracking-[0.25em]">
        Curated HUG path
      </p>

      <h2 className="mt-3 text-2xl font-semibold">
        Request {category}
      </h2>

      <p className="mx-auto mt-3 max-w-xl">
        Curated HUG samples are being reviewed before public release.
      </p>

      <a
        href={href}
        className="mt-5 inline-flex rounded-full border px-6 py-3 font-semibold"
      >
        Request this HUG
      </a>
    </section>
  );
}
