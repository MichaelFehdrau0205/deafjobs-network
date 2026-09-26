import type { Metadata } from "next";
import { SimplePage } from "../simple-page";
import simple from "../simple-page.module.css";
import { HowItWorksTabs } from "./how-it-works-tabs";

export const metadata: Metadata = {
  title: "How it works — DEAFJOBS",
};

// Both "How it works" links on the landing page come here: the green half
// opens the candidate tab, the blue half opens the employer tab.
export default async function HowItWorksPage({ searchParams }: PageProps<"/how-it-works">) {
  const params = await searchParams;
  const initial = params.for === "employers" ? "employers" : "candidates";

  return (
    <SimplePage
      links={[
        { href: "/jobs", label: "Browse jobs" },
        { href: "/resources", label: "Resources" },
        { href: "/privacy", label: "Privacy" },
      ]}
    >
      <h1 className={simple.title}>How it works</h1>
      <p className={simple.intro}>
        DEAFJOBS is a job platform where Deaf and hard of hearing candidates get first access,
        and employers commit to what supporting a Deaf hire takes before they can post. Pick
        your side below.
      </p>
      <HowItWorksTabs initial={initial} />
    </SimplePage>
  );
}
