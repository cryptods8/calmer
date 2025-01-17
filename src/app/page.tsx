import { Bg } from "@/app/ui/bg";
import { App } from "@/app/ui/app";
import { Metadata } from "next";
import { externalBaseUrl } from "./constants";
import { FrameEmbedNext } from "@farcaster/frame-node";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { sid: string };
}): Promise<Metadata> {
  const { sid } = await searchParams;

  const imageUrl = sid
    ? `${externalBaseUrl}/frames/image?sid=${sid}`
    : `${externalBaseUrl}/og-final.png`;
  return {
    title: "Calmer",
    description: "Breath and relax",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl,
        button: {
          title: "Let's go",
          action: {
            type: "launch_frame",
            name: "Calmer",
            url: `${externalBaseUrl}`,
            splashImageUrl: `${externalBaseUrl}/splash.png`,
            splashBackgroundColor: "#166534",
          },
        },
      } satisfies FrameEmbedNext),
    },
  };
}

export default function Home() {
  return (
    <Bg>
      <App />
    </Bg>
  );
}
