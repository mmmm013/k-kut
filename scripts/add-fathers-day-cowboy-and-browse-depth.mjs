import fs from "node:fs";

const routerPath = "data/fathers-day/fathers-day-more-router.json";

if (!fs.existsSync(routerPath)) {
  console.error("Missing router:", routerPath);
  process.exit(1);
}

const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));

router.navigation_doctrine = {
  stable_home_rule:
    "Stable HOME / landing remains above seasonal pages. Holiday and calendar-season pages rotate underneath stable entry points.",
  buyer_location_rule:
    "Buyer must always know where they are, what layer they are browsing, and how to return.",
  return_paths: [
    "Header nav",
    "Breadcrumb",
    "Back to Holiday HUGs",
    "Back to Father's Day",
    "More like this",
    "Start over"
  ],
  route_shape: [
    "/personal",
    "/holiday",
    "/holiday/fathers-day",
    "/holiday/fathers-day?layer=cowboy",
    "/holiday/fathers-day?intent=missing-dad"
  ]
};

router.browse_layers = [
  {
    id: "featured",
    public_label: "Featured Father’s Day HUGs",
    role: "Strongest 3-5 options only."
  },
  {
    id: "more",
    public_label: "More Father’s Day options",
    role: "Qualified deeper options, not raw inventory."
  },
  {
    id: "more-like-this",
    public_label: "More like this",
    role: "Route-specific expansion after a buyer chooses a feeling."
  },
  {
    id: "under-layers",
    public_label: "Under-layers",
    role: "Special dad identities / angles that strengthen browse appeal without cluttering the top layer."
  }
];

const groups = router.buyer_groups || [];

function addGroup(group) {
  const i = groups.findIndex((g) => g.id === group.id);
  if (i >= 0) groups[i] = { ...groups[i], ...group };
  else groups.push(group);
}

addGroup({
  id: "dad-cowboy",
  public_label: "Cowboy / Western Dad",
  parent_layer: "under-layers",
  buyer_trigger:
    "For dads who see themselves as cowboys, western, rugged, plain-spoken, loyal, road-tested, outdoor, ranch, truck, boots, grit, honor, or old-school.",
  top_layer_goal: 2,
  more_layer_goal: 10,
  status: "needs_concrete_kk_audio",
  buyer_terms: [
    "cowboy",
    "western dad",
    "boots",
    "hat",
    "horse",
    "ranch",
    "road",
    "grit",
    "plain-spoken",
    "old-school",
    "rugged",
    "honor",
    "truck",
    "trail",
    "ride",
    "dust",
    "hard miles",
    "stand tall"
  ],
  public_copy_options: [
    "For the dad who still thinks like a cowboy.",
    "For the road-tested, plain-spoken, old-school dad.",
    "For boots, grit, loyalty, and hard miles.",
    "A Father’s Day HUG with western backbone.",
    "For the dad who does not say much, but means all of it."
  ]
});

addGroup({
  id: "dad-funny",
  public_label: "Funny / Dad Energy",
  parent_layer: "under-layers",
  top_layer_goal: 2,
  more_layer_goal: 10,
  status: "needs_concrete_kk_audio",
  buyer_terms: [
    "funny dad",
    "dad joke",
    "goofy",
    "playful",
    "teasing",
    "lighthearted",
    "laugh"
  ]
});

addGroup({
  id: "dad-hardworking",
  public_label: "Hardworking Dad",
  parent_layer: "under-layers",
  top_layer_goal: 3,
  more_layer_goal: 12,
  status: "needs_concrete_kk_audio",
  buyer_terms: [
    "work",
    "working man",
    "hardworking",
    "provider",
    "long days",
    "hands",
    "tools",
    "factory",
    "farm",
    "labor",
    "sacrifice"
  ]
});

addGroup({
  id: "dad-quiet",
  public_label: "Quiet Dad / Hard to Say",
  parent_layer: "under-layers",
  top_layer_goal: 2,
  more_layer_goal: 8,
  status: "needs_concrete_kk_audio",
  buyer_terms: [
    "quiet dad",
    "doesn't say much",
    "hard to say",
    "few words",
    "understood",
    "unspoken",
    "silent love"
  ]
});

addGroup({
  id: "dad-bonus",
  public_label: "Bonus Dad / Stepdad",
  parent_layer: "under-layers",
  top_layer_goal: 2,
  more_layer_goal: 8,
  status: "needs_concrete_kk_audio",
  buyer_terms: [
    "stepdad",
    "bonus dad",
    "chosen dad",
    "father figure",
    "like a dad",
    "showed up"
  ]
});

router.buyer_groups = groups;

router.next_required_step =
  "Find concrete KK/audio candidates for Featured and More layers, including Cowboy / Western Dad under-layer, then materialize selected Father’s Day delivery IIs with padding + Twinkle.";

fs.writeFileSync(routerPath, JSON.stringify(router, null, 2) + "\n");

console.log("Added Cowboy / Western Dad under-layer and browse-return doctrine.");
console.log("Buyer groups:", router.buyer_groups.length);
