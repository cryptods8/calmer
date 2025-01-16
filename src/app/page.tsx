import Image from "next/image";

import { Bg } from "@/app/ui/bg";
import { App } from "@/app/ui/app";

export default function Home() {
  return (
    <Bg>
      <App />
    </Bg>
  );
}
