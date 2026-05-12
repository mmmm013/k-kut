import hugLanguages from "../../../data/localization/hug-languages.json";
import hugCopy from "../../../data/localization/hug-copy.en.json";
import pricingTiers from "../../../data/pricing/global-pricing-tiers.json";

export const metadata = {
  title: "K-KUT Localization Preview",
  robots: {
    index: false,
    follow: false,
  },
};

type LanguageRecord = {
  language_code: string;
  language_name_english: string;
  language_name_native: string;
  direction: string;
  public_enabled: boolean;
  review_required: boolean;
  notes: string;
};

type PricingTier = {
  tier_id: string;
  public_label: string;
  internal_label: string;
  checkout_enabled: boolean;
  manual_review_required: boolean;
  suggested_multiplier: number | null;
  description: string;
  allowed_product_families: string[];
};

export default function LocalizationPreviewPage() {
  const languages = hugLanguages.languages as LanguageRecord[];
  const tiers = pricingTiers.tiers as PricingTier[];
  const enabledLanguages = languages.filter((language) => language.public_enabled);
  const reviewLanguages = languages.filter((language) => language.review_required);
  const rtlLanguages = languages.filter((language) => language.direction === "rtl");

  return (
    <main className="min-h-screen bg-stone-950 px-6 py-10 text-stone-100">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-2xl border border-amber-300/30 bg-stone-900 p-6 shadow-xl">
          <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
            Internal Admin Preview
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            K-KUT HUG Localization Preview
          </h1>
          <p className="mt-4 max-w-3xl text-stone-300">
            This page previews controlled localization, review, and fair-access pricing data.
            It is not a buyer-facing multilingual launch page and does not change checkout.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl bg-stone-900 p-5">
            <p className="text-sm text-stone-400">Language count</p>
            <p className="mt-2 text-3xl font-semibold">{languages.length}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5">
            <p className="text-sm text-stone-400">Public-enabled</p>
            <p className="mt-2 text-3xl font-semibold">{enabledLanguages.length}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5">
            <p className="text-sm text-stone-400">Review-required</p>
            <p className="mt-2 text-3xl font-semibold">{reviewLanguages.length}</p>
          </div>
          <div className="rounded-2xl bg-stone-900 p-5">
            <p className="text-sm text-stone-400">RTL languages</p>
            <p className="mt-2 text-3xl font-semibold">{rtlLanguages.length}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Locked Rules</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-stone-700 p-4">
              <p className="text-sm text-stone-400">Localization rule</p>
              <p className="mt-2 text-stone-100">{hugLanguages.rule}</p>
            </div>
            <div className="rounded-xl border border-stone-700 p-4">
              <p className="text-sm text-stone-400">Pricing rule</p>
              <p className="mt-2 text-stone-100">{pricingTiers.rule}</p>
            </div>
            <div className="rounded-xl border border-stone-700 p-4">
              <p className="text-sm text-stone-400">Audio review message</p>
              <p className="mt-2 text-stone-100">{hugCopy.review_messages.audio}</p>
            </div>
            <div className="rounded-xl border border-stone-700 p-4">
              <p className="text-sm text-stone-400">Checkout rule</p>
              <p className="mt-2 text-stone-100">{pricingTiers.first_version_checkout_rule}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">English Source Copy</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {Object.entries(hugCopy.public_promises).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-stone-700 p-4">
                <p className="text-sm text-amber-300">{key}</p>
                <p className="mt-2">{String(value)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Language Rollout</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-stone-700 text-stone-300">
                  <th className="py-3 pr-4">Code</th>
                  <th className="py-3 pr-4">English</th>
                  <th className="py-3 pr-4">Native</th>
                  <th className="py-3 pr-4">Direction</th>
                  <th className="py-3 pr-4">Public</th>
                  <th className="py-3 pr-4">Review</th>
                  <th className="py-3 pr-4">Notes</th>
                </tr>
              </thead>
              <tbody>
                {languages.map((language) => (
                  <tr key={language.language_code} className="border-b border-stone-800">
                    <td className="py-3 pr-4 font-mono text-amber-300">{language.language_code}</td>
                    <td className="py-3 pr-4">{language.language_name_english}</td>
                    <td className="py-3 pr-4">{language.language_name_native}</td>
                    <td className="py-3 pr-4">{language.direction}</td>
                    <td className="py-3 pr-4">{language.public_enabled ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4">{language.review_required ? "Yes" : "No"}</td>
                    <td className="py-3 pr-4 text-stone-300">{language.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-stone-900 p-6">
          <h2 className="text-2xl font-semibold">Fair-Access Pricing Tiers</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {tiers.map((tier) => (
              <div key={tier.tier_id} className="rounded-xl border border-stone-700 p-4">
                <p className="text-sm text-amber-300">{tier.internal_label}</p>
                <h3 className="mt-1 text-xl font-semibold">{tier.public_label}</h3>
                <p className="mt-2 text-stone-300">{tier.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-stone-300">
                  <p>Checkout enabled: {tier.checkout_enabled ? "Yes" : "No"}</p>
                  <p>Manual review: {tier.manual_review_required ? "Yes" : "No"}</p>
                  <p>Multiplier: {tier.suggested_multiplier ?? "Manual"}</p>
                  <p>Families: {tier.allowed_product_families.join(", ")}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
