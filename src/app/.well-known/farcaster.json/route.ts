import { NextResponse } from "next/server";

// @ts-expect-error - TODO: fix this
import { externalBaseUrl, isProduction } from "@/app/constants";

const accountAssociation = isProduction
  ? {
      header:
        "eyJmaWQiOjExMTI0LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4ZENjODlEZjVGYzhENDJDNTQ0MzM4ODUzMWFGMTU1MUUwRmJkNUNBZCJ9",
      payload: "eyJkb21haW4iOiJjYWxtZXIub25mYy54eXoifQ",
      signature:
        "MHgyMTFiZmZkOGQwNGFmZWEwMzI0ZWQwMDRlMzM3NjY4MTVjMTVhMDUzZmY1MDc3NjY4Njg3MmMyMjQwMjBiNTlhMjQ2ZmMwYzU0OGI5MzE4NGYyMWZjYjY3YjViN2Q5NzdmYWUwYzFmNmRjMWM5OGQxYzJmNmVlODAzY2YxYTA2NjFj",
    }
  : {
      header:
        "eyJmaWQiOjExMTI0LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4ZENjODlEZjVGYzhENDJDNTQ0MzM4ODUzMWFGMTU1MUUwRmJkNUNBZCJ9",
      payload: "eyJkb21haW4iOiJjYWxtZXIudHVubi5kZXYifQ",
      signature:
        "MHhlNzBlOTZlYjM1MTFlZDQ3YTY4NTY4YThjMGJjNTdmMTE3MDhkZmEyMmJlOWJlYzU2MDYyZjQ1ZTYyNWRkMjRkMDFlYTk3MDllZGQzZmI4MzJjZjVjYzlmOTRiYTliZTFmM2ZlN2UwNDRlYWZlNjdiNjZiZWM3M2I4NjEzZDk5OTFi",
    };

export async function GET() {
  const manifest = {
    accountAssociation,
    frame: {
      version: "1",
      name: "Calmer",
      imageUrl: `${externalBaseUrl}/og.png`,
      buttonTitle: "Let's go",
      iconUrl: `${externalBaseUrl}/icon.png`,
      splashImageUrl: `${externalBaseUrl}/splash.png`,
      splashBackgroundColor: "#166534",
      homeUrl: `${externalBaseUrl}`,
      webhookUrl: `${externalBaseUrl}/api/frames/webhook`,
    },
  };
  return NextResponse.json(manifest);
}
