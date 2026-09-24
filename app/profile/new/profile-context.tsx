"use client";

import { createContext, useContext, useState } from "react";

// Client-side only, on purpose: nothing here touches a server, a database or
// localStorage. It lives in the /profile/new layout, which stays mounted as the
// candidate moves between steps, so Back/Next keep what they typed.

export type Basics = {
  displayName: string;
  location: string;
  openToRemote: boolean;
  headline: string;
};

const EMPTY: Basics = {
  displayName: "",
  location: "",
  openToRemote: false,
  headline: "",
};

type ProfileDraft = {
  basics: Basics;
  saveBasics: (basics: Basics) => void;
};

const ProfileContext = createContext<ProfileDraft | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [basics, saveBasics] = useState<Basics>(EMPTY);
  return (
    <ProfileContext.Provider value={{ basics, saveBasics }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileDraft() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfileDraft must be used inside ProfileProvider");
  return ctx;
}
