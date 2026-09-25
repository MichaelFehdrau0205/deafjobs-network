import type { Metadata } from "next";
import { VideoStep } from "./video-step";

export const metadata: Metadata = {
  title: "Step 3 of 4: Video — DEAFJOBS",
};

export default function Page() {
  return <VideoStep />;
}
