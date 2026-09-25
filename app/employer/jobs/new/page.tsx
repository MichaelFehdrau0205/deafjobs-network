"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useEmployer } from "../../employer-context";
import { PostRoleForm } from "../../post-role-form";
import styles from "../../employer.module.css";

export default function NewJobPage() {
  const router = useRouter();
  const { commitment } = useEmployer();
  const signed = Boolean(commitment.signedAt);

  // Posting is gated behind the commitment, same as the product spec: no
  // commitment, no posting.
  useEffect(() => {
    if (!signed) router.replace("/employer/commitment");
  }, [signed, router]);

  if (!signed) return null;

  return (
    <div className={styles.narrow}>
      <h1 className={styles.title}>Post a role</h1>
      <p className={styles.intro}>
        This posting carries your commitment automatically — candidates see it before they apply.
      </p>
      <PostRoleForm onPublished={() => router.push("/employer")} onCancel={() => router.push("/employer")} />
    </div>
  );
}
