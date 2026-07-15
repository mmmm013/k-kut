import {
  inventoryCapacityForecast as forecast,
} from "../data/4pe/inventory-capacity-forecast-v001.mjs";

function stop(message) {
  console.error(`STOP: ${message}`);
  process.exit(1);
}

const assumptions = forecast.accepted_base_assumptions;
const base = forecast.accepted_base_forecast;

const kk = assumptions.lt_pix_parents * assumptions.average_kk_per_lt_pix;
const sk = assumptions.lt_pix_parents * assumptions.average_sk_per_lt_pix;
const mk = assumptions.lt_pix_parents * assumptions.average_mk_per_lt_pix;
const derivatives = kk + sk + mk;
const withParents = assumptions.lt_pix_parents + derivatives;

if (forecast.visibility !== "INTERNAL_ONLY" ||
    forecast.status !== "GD_ACCEPTED_WORKING_FORECAST") {
  stop("forecast must remain an internal GD-accepted working forecast");
}
if (kk !== 2480 || sk !== 12000 || mk !== 40000) {
  stop("base class calculations mismatch");
}
if (derivatives !== 54480 || withParents !== 54880) {
  stop("base derivative or controlled-object total mismatch");
}
if (base.kk_candidates !== kk ||
    base.sk_candidates !== sk ||
    base.mk_candidates !== mk ||
    base.gross_derivative_candidates !== derivatives ||
    base.controlled_objects_including_lt_pix !== withParents) {
  stop("recorded base forecast does not match assumptions");
}
if (Math.abs(base.average_sk_per_kk_portfolio_balance - 30 / 6.2) > 1e-12 ||
    Math.abs(base.average_mk_per_kk_portfolio_balance - 100 / 6.2) > 1e-12) {
  stop("KK portfolio-balance ratios mismatch");
}

const expectedBands = {
  conservative: {
    kk: 2480,
    sk: 8000,
    mk: 20000,
    derivatives: 30480,
    withParents: 30880,
  },
  base: {
    kk: 2480,
    sk: 12000,
    mk: 40000,
    derivatives: 54480,
    withParents: 54880,
  },
  high_yield: {
    kk: 2480,
    sk: 16000,
    mk: 80000,
    derivatives: 98480,
    withParents: 98880,
  },
};

for (const [name, expected] of Object.entries(expectedBands)) {
  const band = forecast.capacity_bands[name];
  if (!band ||
      band.kk_candidates !== expected.kk ||
      band.sk_candidates !== expected.sk ||
      band.mk_candidates !== expected.mk ||
      band.gross_derivative_candidates !== expected.derivatives ||
      band.controlled_objects_including_lt_pix !== expected.withParents) {
    stop(`${name} capacity band mismatch`);
  }
}

const ready = forecast.customer_ready_planning_range;
if (Math.round(54480 * ready.low_yield_assumption) !==
      ready.low_projected_customer_ready_iis ||
    Math.round(54480 * ready.high_yield_assumption) !==
      ready.high_projected_customer_ready_iis ||
    ready.status !== "PLANNING_ASSUMPTION_NOT_MEASURED_KPI") {
  stop("customer-ready planning range mismatch or overclaim");
}

const relationships = forecast.private_match_relationship_capacity;
if (relationships.base_audio_candidates *
      relationships.example_customer_need_profiles !==
      relationships.potential_pairwise_match_evidence_relationships ||
    relationships.classification !==
      "PRIVATE_MATCH_EVIDENCE_RELATIONSHIPS_NOT_UNIQUE_AUDIO_INVENTORY") {
  stop("private Match Evidence relationship capacity mismatch");
}

if (forecast.rejected_interpretation.result !== 7440000 ||
    !forecast.rejected_interpretation.rejection_reason.includes(
      "each defined per LT-PIX")) {
  stop("7.44 million dimensional rejection is missing");
}
if (forecast.claim_controls.public_claim_allowed !== false ||
    forecast.claim_controls.valuation_claim_allowed !== false ||
    forecast.claim_controls.deployed_inventory_claim_allowed !== false ||
    forecast.claim_controls.gd_approval_required_for_external_use !== true ||
    forecast.claim_controls.mial_measured_actuals_supersede_forecast !== true) {
  stop("external-claim or MIAL supersession controls failed");
}
if (!forecast.planning_law.mk_rule.includes(
      "exactly one clear audible term") ||
    !forecast.planning_law.release_rule.includes(
      "canonical Twinkle package proof")) {
  stop("mK or final-II doctrine missing");
}

console.log("INVENTORY CAPACITY FORECAST AUDIT PASS");
console.log("LT-PIX PARENTS: 400");
console.log("KK CANDIDATES: 2480");
console.log("sK CANDIDATES: 12000");
console.log("mK CANDIDATES: 40000");
console.log("GROSS DERIVATIVE CANDIDATES: 54480");
console.log("CONTROLLED OBJECTS INCLUDING LT-PIX: 54880");
console.log("CUSTOMER-READY PLANNING RANGE: 19449-27458");
console.log("PRIVATE MATCH RELATIONSHIPS AT 100 NEEDS: 5448000");
console.log("7440000 UNIQUE INVENTORY CLAIM: REJECTED");
console.log("PUBLIC CLAIM ALLOWED: 0");
