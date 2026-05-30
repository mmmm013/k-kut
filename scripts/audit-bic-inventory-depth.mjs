import fs from "node:fs";

const routeConfigPath = "data/bic-routes/routes.json";
const outJson = "reports/bic-inventory-depth/core-buyer-route-inventory-depth.json";
const outMd = "reports/bic-inventory-depth/core-buyer-route-inventory-depth.md";

if (!fs.existsSync(routeConfigPath)) {
  console.error("Missing", routeConfigPath);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(routeConfigPath, "utf8"));
const routes = data.routes || [];

const audioToRoutes = new Map();

for (const route of routes) {
  for (const audio of route.expectedAudio || []) {
    if (!audioToRoutes.has(audio)) audioToRoutes.set(audio, []);
    audioToRoutes.get(audio).push(route.route);
  }
}

const routeSummaries = routes.map((route) => {
  const audioCount = (route.expectedAudio || []).length;

  let depthStatus = "NO_AUDIO";
  if (audioCount >= 8) depthStatus = "STRONG";
  else if (audioCount >= 5) depthStatus = "GOOD";
  else if (audioCount >= 3) depthStatus = "STARTER";
  else if (audioCount >= 1) depthStatus = "MINIMUM";

  return {
    route: route.route,
    name: route.name,
    requiredTextCount: (route.requiredText || []).length,
    expectedAudioCount: audioCount,
    expectedStripeCount: (route.expectedStripe || []).length,
    depthStatus,
    expectedAudio: route.expectedAudio || [],
    expectedStripe: route.expectedStripe || [],
  };
});

const reusedAudio = [...audioToRoutes.entries()]
  .filter(([, routeList]) => routeList.length > 1)
  .map(([audio, routes]) => ({
    audio,
    routes,
    reuseCount: routes.length,
  }));

const report = {
  date: "2026-05-30",
  status: "inventory_depth_baseline",
  coreRule: "BIC release proves customer flow. Inventory depth proves buyer choice.",
  configuredRoutes: routes.length,
  uniqueCustomerReadyAudio: audioToRoutes.size,
  totalRouteAudioReferences: [...audioToRoutes.values()].reduce(
    (sum, routes) => sum + routes.length,
    0
  ),
  routeSummaries,
  reusedAudio,
  revenueConcern: [
    "Current core routes work, but many use cases reuse the same few IIs.",
    "Reuse is allowed when intentional, but buyer choice must deepen.",
    "Next work is seeding more pre-made KK/II candidates per live route."
  ],
  nextTargets: [
    {
      route: "/personal",
      priority: 1,
      needs: [
        "birthday",
        "thank-you",
        "apology",
        "encouragement",
        "comfort",
        "grief",
        "hope",
        "friendship",
        "family",
        "graduation",
        "retirement"
      ]
    },
    {
      route: "/holiday",
      priority: 2,
      needs: [
        "warmth",
        "gratitude",
        "support",
        "repair",
        "missing family",
        "care",
        "memory"
      ]
    },
    {
      route: "/romance",
      priority: 3,
      needs: [
        "Gentle Affection",
        "New Love",
        "Committed Love",
        "Longtime Love",
        "Missing You",
        "Repair",
        "Desire / Passion",
        "Anniversary",
        "Wedding / Vow-Level",
        "Private Intimate"
      ]
    },
    {
      route: "/kupid",
      priority: 4,
      needs: [
        "physical spark",
        "desire",
        "private intimate",
        "bold romance",
        "adult playful"
      ]
    },
    {
      route: "/wedding",
      priority: 5,
      needs: [
        "vow-level",
        "first dance",
        "forever",
        "ceremony-safe",
        "thank-you to wedding party",
        "anniversary bridge"
      ]
    }
  ]
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

let md = "# Core Buyer Route Inventory Depth\n\n";
md += `Status: ${report.status}\n\n`;
md += `${report.coreRule}\n\n`;

md += "## Summary\n\n";
md += `- Configured routes: ${report.configuredRoutes}\n`;
md += `- Unique customer-ready audio files: ${report.uniqueCustomerReadyAudio}\n`;
md += `- Total route audio references: ${report.totalRouteAudioReferences}\n\n`;

md += "## Route Depth\n\n";
for (const route of routeSummaries) {
  md += `### ${route.route}\n\n`;
  md += `- Depth status: ${route.depthStatus}\n`;
  md += `- Customer-ready audio count: ${route.expectedAudioCount}\n`;
  md += `- Stripe link count: ${route.expectedStripeCount}\n`;
  md += `- Required text terms: ${route.requiredTextCount}\n\n`;
}

md += "## Reused Audio\n\n";
for (const item of reusedAudio) {
  md += `- ${item.audio}\n`;
  md += `  - Routes: ${item.routes.join(", ")}\n`;
  md += `  - Reuse count: ${item.reuseCount}\n\n`;
}

md += "## Revenue Concern\n\n";
for (const line of report.revenueConcern) md += `- ${line}\n`;

md += "\n## Next Inventory Targets\n\n";
for (const target of report.nextTargets) {
  md += `### ${target.route}\n\n`;
  md += `Priority: ${target.priority}\n\n`;
  for (const need of target.needs) md += `- ${need}\n`;
  md += "\n";
}

fs.writeFileSync(outMd, md);

console.log("Inventory depth report written.");
console.log("JSON:", outJson);
console.log("MD:", outMd);
console.log("Routes:", report.configuredRoutes);
console.log("Unique audio:", report.uniqueCustomerReadyAudio);
console.log("Total refs:", report.totalRouteAudioReferences);
