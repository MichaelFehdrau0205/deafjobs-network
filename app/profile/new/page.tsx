import type { Metadata } from "next";
import { BasicsForm } from "./basics-form";

export const metadata: Metadata = {
  title: "Step 1 of 3: The basics — DEAFJOBS",
};

export default function Page() {
  return <BasicsForm />;
}
