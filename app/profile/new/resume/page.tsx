import type { Metadata } from "next";
import { ResumeStep } from "./resume-step";

export const metadata: Metadata = {
  title: "Step 4 of 4: Resume — DEAFJOBS",
};

export default function Page() {
  return <ResumeStep />;
}
