import type { Metadata } from "next";
import { CaptionsStep } from "./captions-step";

export const metadata: Metadata = {
  title: "Step 3 of 3: Captions — DEAFJOBS",
};

export default function Page() {
  return <CaptionsStep />;
}
