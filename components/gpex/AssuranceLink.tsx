import Link from "next/link";
import { GPEX_ASSURANCE_STI } from "@/lib/gpex/assuranceSti";

export function AssuranceLink({
  className = "",
  label = GPEX_ASSURANCE_STI.label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Link
      href={GPEX_ASSURANCE_STI.canonicalRoute}
      className={className || "text-sm font-black text-amber-300 underline underline-offset-4"}
    >
      {label}
    </Link>
  );
}

export function AssurancePermissionBlock() {
  return (
    <section className="mb-5 rounded-3xl bg-amber-300 p-5 text-[#211004]">
      <p className="text-xs font-black uppercase tracking-[0.3em]">Permission promise</p>
      <p className="mt-3 text-lg font-black leading-snug">
        {GPEX_ASSURANCE_STI.hugPermissionLine}
      </p>
      <AssuranceLink className="mt-3 inline-block text-sm font-black underline underline-offset-4" />
    </section>
  );
}
