"use client";

import { useEffect, useRef } from "react";

// After moving to a new step, put keyboard and screen-reader focus on the
// page heading so people start at the top of the new step, not on the old
// "Next" button that no longer exists.
export function FocusHeading({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={className}>
      {children}
    </h1>
  );
}
