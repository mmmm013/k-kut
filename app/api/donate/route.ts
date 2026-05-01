import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    url: "mailto:hello@gputnammusic.com?subject=MS Donation&body=I want to make an MS Donation for Michael Scherer."
  });
}
