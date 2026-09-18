"use client";
import { useState } from "react";
export default function NonSmsDeliveryFields() {
  const [method, setMethod] = useState("share_link");
  return <>
    <label className="mb-3 block text-sm">
      Delivery
      <select name="delivery_method" value={method} onChange={event => setMethod(event.target.value)}
        className="mt-1 block w-full rounded border border-white/30 bg-black p-2 text-white">
        <option value="share_link">Private link — share by DM or your own message</option>
        <option value="email">Email to recipient</option>
      </select>
    </label>
    {method === "email" ? <label className="mb-4 block text-sm">
      Recipient email
      <input type="email" name="recipient_email" required maxLength={254}
        className="mt-1 block w-full rounded border border-white/30 bg-black p-2 text-white" />
    </label> : <p className="mb-4 text-sm text-white/70">You will share the private gift link yourself when it is ready.</p>}
  </>;
}
