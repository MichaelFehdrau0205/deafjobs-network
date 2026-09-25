"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AuthDialog } from "./auth-dialog";
import { signIn, signOut, useSignedInRole, type Role } from "./auth-store";

// Where each kind of person lands after signing in.
const DESTINATION: Record<Role, string> = {
  candidate: "/applications",
  employer: "/employer",
};

// The SIGN IN link in one of the two nav rows. It is a button, because it
// opens a dialog rather than going to a page. Once someone is signed in on
// this side, the same button becomes SIGN OUT.
export function SignInLink({ role }: { role: Role }) {
  const router = useRouter();
  const signedInAs = useSignedInRole();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  // After a successful sign-in we navigate away, so don't pull focus back to
  // a link on the page we're leaving.
  const leavingRef = useRef(false);

  const signedIn = signedInAs === role;

  function handleClose() {
    setOpen(false);
    if (!leavingRef.current) triggerRef.current?.focus();
    leavingRef.current = false;
  }

  function handleVerified() {
    leavingRef.current = true;
    signIn(role);
    setOpen(false);
    router.push(DESTINATION[role]);
  }

  function handleSignOut() {
    signOut();
    setMessage("You are signed out.");
    router.push("/");
  }

  return (
    <>
      {signedIn ? (
        <button ref={triggerRef} type="button" onClick={handleSignOut}>
          Sign out
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            setMessage("");
            setOpen(true);
          }}
        >
          Sign in
        </button>
      )}
      <span role="status" style={SR_ONLY}>
        {message}
      </span>
      <AuthDialog role={role} open={open} onClose={handleClose} onVerified={handleVerified} />
    </>
  );
}

// Visually hidden, still read by screen readers.
const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  whiteSpace: "nowrap",
  border: 0,
};
