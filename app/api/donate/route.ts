import { NextResponse } from "next/server";

const MS_DONATION_LINK = "https://buy.stripe.com/6oUcN47kq8Mybu43tc4ow0g";

export async function POST() {
  return NextResponse.json({
    url: MS_DONATION_LINK,
  });
}
