// Demo data only, illustrating a future "considering for later" list.
// DEAFJOBS v1 is intentionally not a candidate-sourcing database (PRD §4) —
// employers only see people who actually applied to a posting. This is a
// mockup of what holding a few strong applicants for a future opening could
// look like once real applications exist, not a working feature yet.
export type HoldCandidate = {
  id: string;
  name: string;
  headline: string;
  consideringFor: string;
  note: string;
};

export const HOLD_CANDIDATES: HoldCandidate[] = [
  {
    id: "1",
    name: "Priya Nair",
    headline: "Warehouse team lead, 6 years",
    consideringFor: "Fulfillment Team Lead",
    note: "Strong interview, no opening at the time.",
  },
  {
    id: "2",
    name: "Marcus Thompson",
    headline: "Front-desk & scheduling",
    consideringFor: "Front Desk Coordinator",
    note: "Asked to be considered when a second shift opens up.",
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    headline: "QA tester, mobile & web",
    consideringFor: "Quality Assurance Tester",
    note: "Great technical round — keep in mind for next hiring cycle.",
  },
];
