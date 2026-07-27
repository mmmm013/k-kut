export type InternalItemType =
  | "pix"
  | "kk"
  | "hug"
  | "mk"
  | "mkut"
  | "sk"
  | "sblk"
  | "kkKombo"
  | "track"
  | "kut";

const MYK_RECEIPT_TYPES = new Set(["mk", "mkut", "sk", "sblk"]);

export function customerFacingItemType(
  type: InternalItemType | string,
): "tracks" | "kuts" {
  return type === "pix" || type === "track" ? "tracks" : "kuts";
}

export function customerFacingReceiptLabel(
  type: InternalItemType | string,
): "MyK" | "tracks" | "kuts" {
  return MYK_RECEIPT_TYPES.has(String(type).toLowerCase())
    ? "MyK"
    : customerFacingItemType(type);
}

export function customerFacingReceiptLine(input: {
  title: string;
  type: InternalItemType | string;
  quantity?: number;
  priceCents: number;
}) {
  const quantity = input.quantity ?? 1;
  const receiptLabel = customerFacingReceiptLabel(input.type);

  return {
    // Receipt label is a separate naming layer. Quantity remains its own field.
    name:
      receiptLabel === "MyK"
        ? "MyK"
        : `${quantity > 1 ? `${quantity} ` : ""}${receiptLabel}`,
    description: input.title,
    quantity,
    priceCents: input.priceCents,
  };
}

export function publicItemCopy(type: InternalItemType | string): string {
  // Storefront wording remains independent from receipt-label law.
  return customerFacingItemType(type);
}
