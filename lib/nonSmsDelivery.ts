export type NonSmsDelivery = { method: "email" | "share_link"; recipientEmail: string };
export function parseNonSmsDelivery(method: unknown, email: unknown): NonSmsDelivery | null {
  const selected = method == null || method === "" ? "share_link" : method;
  if (selected !== "email" && selected !== "share_link") return null;
  if (selected === "share_link") return { method: selected, recipientEmail: "" };
  const address = typeof email === "string" ? email.trim() : "";
  if (address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null;
  return { method: selected, recipientEmail: address };
}
