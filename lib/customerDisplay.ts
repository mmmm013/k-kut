export type InternalItemType = "pix" | "kk" | "hug" | "mk" | "kkKombo" | "track" | "kut";

export function customerFacingItemType(type: InternalItemType | string): "tracks" | "kuts" {
  return type === "pix" || type === "track" ? "tracks" : "kuts";
}

export function customerFacingReceiptLine(input: {
  title: string;
  type: InternalItemType | string;
  quantity?: number;
  priceCents: number;
}) {
  const quantity = input.quantity ?? 1;
  const displayType = customerFacingItemType(input.type);

  return {
    name: `${quantity > 1 ? `${quantity} ` : ""}${displayType}`,
    description: input.title,
    quantity,
    priceCents: input.priceCents,
  };
}

export function publicItemCopy(type: InternalItemType | string): string {
  return customerFacingItemType(type);
}
