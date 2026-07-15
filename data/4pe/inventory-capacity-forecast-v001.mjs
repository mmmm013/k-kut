// Internal 4PE / MIAL planning forecast for GPMx / K-KUT derivative capacity.
// This is a manufacturing-capacity model, not a count of deployed, approved, or customer-ready inventory.

export const INVENTORY_CAPACITY_FORECAST_ID =
  "gpmx-4pe-inventory-capacity-forecast-v001";

export const inventoryCapacityForecast = {
  forecast_id: INVENTORY_CAPACITY_FORECAST_ID,
  record_date: "2026-07-15",
  authority: "GPMx / 4PE / KKr / MIAL",
  visibility: "INTERNAL_ONLY",
  status: "GD_ACCEPTED_WORKING_FORECAST",

  planning_law: {
    primary_rule:
      "Calculate LT-PIX, KK, sK, and mK classes separately, then add them. Do not multiply yields that share the same LT-PIX denominator.",
    inventory_rule:
      "A candidate, folder, report, CSV row, timestamp, or theoretical derivative is not customer-ready inventory.",
    yield_rule:
      "Portfolio averages are planning guides, never per-LT-PIX or per-KK production quotas.",
    lineage_rule:
      "Every derivative must retain its LT-PIX and KK lineage; an sK parent is included only when materially relevant.",
    audio_rule:
      "No outside or unauthorized audio. WAV/lossless remains the parent authority; MP3 cannot replace the parent.",
    mk_rule:
      "An mK is exactly one clear audible term. Multi-word audible expression is not an mK.",
    release_rule:
      "Customer-ready II status requires source, rights, exact expression, natural boundaries, identity, meaning, performance, contraindication, GD approval/status, playable audio, and final canonical Twinkle package proof."
  },

  accepted_base_assumptions: {
    lt_pix_parents: 400,
    average_kk_per_lt_pix: 6.2,
    average_sk_per_lt_pix: 30,
    average_mk_per_lt_pix: 100
  },

  accepted_base_forecast: {
    lt_pix_parents: 400,
    kk_candidates: 2480,
    sk_candidates: 12000,
    mk_candidates: 40000,
    gross_derivative_candidates: 54480,
    controlled_objects_including_lt_pix: 54880,
    average_sk_per_kk_portfolio_balance: 4.838709677419355,
    average_mk_per_kk_portfolio_balance: 16.129032258064516
  },

  capacity_bands: {
    conservative: {
      assumptions: {
        average_kk_per_lt_pix: 6.2,
        average_sk_per_lt_pix: 20,
        average_mk_per_lt_pix: 50
      },
      kk_candidates: 2480,
      sk_candidates: 8000,
      mk_candidates: 20000,
      gross_derivative_candidates: 30480,
      controlled_objects_including_lt_pix: 30880
    },
    base: {
      assumptions: {
        average_kk_per_lt_pix: 6.2,
        average_sk_per_lt_pix: 30,
        average_mk_per_lt_pix: 100
      },
      kk_candidates: 2480,
      sk_candidates: 12000,
      mk_candidates: 40000,
      gross_derivative_candidates: 54480,
      controlled_objects_including_lt_pix: 54880
    },
    high_yield: {
      assumptions: {
        average_kk_per_lt_pix: 6.2,
        average_sk_per_lt_pix: 40,
        average_mk_per_lt_pix: 200
      },
      kk_candidates: 2480,
      sk_candidates: 16000,
      mk_candidates: 80000,
      gross_derivative_candidates: 98480,
      controlled_objects_including_lt_pix: 98880
    }
  },

  customer_ready_planning_range: {
    basis: "BASE_GROSS_DERIVATIVE_CANDIDATES_ONLY",
    low_yield_assumption: 0.357,
    high_yield_assumption: 0.504,
    low_projected_customer_ready_iis: 19449,
    high_projected_customer_ready_iis: 27458,
    executive_round_range: "APPROXIMATELY_19000_TO_27000",
    status: "PLANNING_ASSUMPTION_NOT_MEASURED_KPI",
    rule:
      "Replace these conversion assumptions with measured MIAL manufacturing yield as sufficient production evidence accumulates."
  },

  private_match_relationship_capacity: {
    example_customer_need_profiles: 100,
    base_audio_candidates: 54480,
    potential_pairwise_match_evidence_relationships: 5448000,
    classification:
      "PRIVATE_MATCH_EVIDENCE_RELATIONSHIPS_NOT_UNIQUE_AUDIO_INVENTORY"
  },

  rejected_interpretation: {
    expression: "400 x 6.2 x 30 x 100",
    result: 7440000,
    rejection_reason:
      "The 6.2 KK, 30 sK, and 100 mK yields were each defined per LT-PIX. Multiplying them falsely converts the model into 30 sKs per KK and 100 mKs per sK.",
    permitted_use_of_7440000:
      "Only as a separately defined combinatorial relationship metric with explicit dimensions; never as unique audio inventory."
  },

  executive_statement:
    "Four hundred controlled LT-PIXs may support approximately 55,000 gross audio derivatives, approximately 19,000-27,000 mature customer-ready IIs under provisional conversion assumptions, and millions of private Personal-Sentiment matching relationships.",

  claim_controls: {
    public_claim_allowed: false,
    valuation_claim_allowed: false,
    funding_claim_allowed_without_context: false,
    deployed_inventory_claim_allowed: false,
    gd_approval_required_for_external_use: true,
    mial_measured_actuals_supersede_forecast: true
  }
};
