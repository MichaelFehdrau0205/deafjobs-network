import { useSyncExternalStore } from "react";

// "I can't record a video right now": remembers that this candidate still owes
// a video so the applications page can remind them. Client-side only, like
// auth-store.ts, kept in localStorage so it survives leaving the builder.

const KEY = "deafjobs-video-later";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

// Storage that can't be written still lets this tab work for the session.
let memory: boolean | null = null;

function getSnapshot(): boolean {
  return memory ?? read();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setVideoLater(value: boolean) {
  try {
    if (value) window.localStorage.setItem(KEY, "1");
    else window.localStorage.removeItem(KEY);
    memory = null;
  } catch {
    memory = value;
  }
  listeners.forEach((l) => l());
}

export function useVideoLater(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
