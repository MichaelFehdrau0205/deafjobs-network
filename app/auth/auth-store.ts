import { useSyncExternalStore } from "react";

// Who is signed in, if anyone. Client-side only: there is no server, no real
// account and no password. It is kept in localStorage so a page reload does
// not sign you out, and every component reading it updates together.

export type Role = "candidate" | "employer";

const KEY = "deafjobs-signed-in-as";
const listeners = new Set<() => void>();

function read(): Role | null {
  try {
    const value = window.localStorage.getItem(KEY);
    return value === "candidate" || value === "employer" ? value : null;
  } catch {
    // Storage can be blocked (private windows, strict settings): behave as
    // signed out rather than crash.
    return null;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

// Storage that can't be written still lets this tab work for the session.
let fallback: Role | null = null;
let useFallback = false;

function getSnapshot(): Role | null {
  return useFallback ? fallback : read();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange); // other tabs
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function signIn(role: Role) {
  try {
    window.localStorage.setItem(KEY, role);
    useFallback = false;
  } catch {
    fallback = role;
    useFallback = true;
  }
  emit();
}

export function signOut() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing stored to clear */
  }
  fallback = null;
  useFallback = false;
  emit();
}

// The server (and the first client render) always see "signed out", so the
// page HTML matches; the real value arrives right after hydration.
export function useSignedInRole(): Role | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
