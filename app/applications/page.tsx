import type { Metadata } from "next";
import { SimplePage } from "../simple-page";
import simple from "../simple-page.module.css";
import { ApplicationsDashboard } from "./applications-dashboard";

export const metadata: Metadata = {
  title: "Your applications — DEAFJOBS",
};

export default function ApplicationsPage() {
  return (
    <SimplePage
      links={[
        { href: "/jobs", label: "Browse jobs" },
        { href: "/profile/new", label: "Your profile" },
        { href: "/resources", label: "Resources" },
      ]}
    >
      <h1 className={simple.title}>Your applications</h1>
      <p className={simple.intro}>
        Every job you&rsquo;ve applied to, and where it stands. When an employer looks at your
        application, writes to you, asks for an interview or says it&rsquo;s not a match, it shows up here.
      </p>
      <ApplicationsDashboard />
    </SimplePage>
  );
}
