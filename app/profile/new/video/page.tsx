import type { Metadata } from "next";
import { VideoStep } from "./video-step";

export const metadata: Metadata = {
  title: "Step 2 of 3: Video — DEAFJOBS",
};

export default function Page() {
  return <VideoStep />;
}
