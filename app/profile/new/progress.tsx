import styles from "./profile.module.css";

const STEPS = ["Basics", "Video", "Captions"] as const;

// "Step N of 3" is the real indicator (plain text); the bar is a visual echo of
// it, so nothing depends on colour alone.
export function Progress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className={styles.progress}>
      <p className={styles.stepText}>
        Step {current} of {STEPS.length}
        <span className={styles.stepName}> &middot; {STEPS[current - 1]}</span>
      </p>
      <ol className={styles.steps}>
        {STEPS.map((name, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "todo";
          return (
            <li
              key={name}
              className={`${styles.step} ${styles[state]}`}
              aria-current={state === "current" ? "step" : undefined}
            >
              <span className={styles.bar} aria-hidden="true" />
              <span className={styles.stepLabel}>
                {name}
                <span className={styles.srOnly}>
                  {state === "done" ? " (done)" : state === "current" ? " (you are here)" : ""}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
