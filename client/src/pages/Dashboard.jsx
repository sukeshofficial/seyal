import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const DASHBOARD_CONFIG = {
  STRINGS: {
    GREETING_PREFIX: "Welcome back,",
    DEFAULT_USER: "User",
    METADATA_SEPARATOR: "•",
  },

  DEFAULT_STATS: [
    { label: "Projects", value: 12 },
    { label: "Tasks", value: 28 },
    { label: "Notifications", value: 3 },
    { label: "Activity", value: "84%" },
  ],

  RECENT_ACTIVITY: [
    "Logged in successfully",
    "Updated profile settings",
    "Created a new workspace",
  ],
};

/* -------------------------------------------------------------------------- */
/*                                   Styles                                   */
/* -------------------------------------------------------------------------- */

const STYLES = {
  pageWrapper: cn("p-8 max-w-full overflow-hidden"),
  header: cn("mb-8"),
  heading: cn(
    "text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 truncate"
  ),
  metaText: cn(
    "text-zinc-500 dark:text-zinc-400 mt-2 italic"
  ),
  statsContainer: cn(
    "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8"
  ),
  statCard: cn(
    "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md",
    "dark:border-zinc-800 dark:bg-zinc-900/50 dark:backdrop-blur-sm"
  ),
  statLabel: cn(
    "text-sm font-medium text-zinc-500 dark:text-zinc-400"
  ),
  statValue: cn(
    "text-2xl font-bold mt-2 text-zinc-900 dark:text-zinc-50"
  ),
  sectionGrid: cn(
    "grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8"
  ),
  sectionCard: cn(
    "rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm",
    "dark:border-zinc-800 dark:bg-zinc-900/50"
  ),
  sectionTitle: cn(
    "text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4"
  ),
  activityItem: cn(
    "text-sm text-zinc-600 dark:text-zinc-400 py-3 border-b border-zinc-200 dark:border-zinc-800 last:border-none"
  ),
  emptyText: cn(
    "text-zinc-500 dark:text-zinc-400"
  ),
  button: cn(
    "mt-4 px-4 py-2 rounded-lg bg-zinc-900 text-white hover:opacity-90 transition",
    "dark:bg-zinc-100 dark:text-black"
  ),
};

/* -------------------------------------------------------------------------- */
/*                               Helper Functions                             */
/* -------------------------------------------------------------------------- */

const formatFullName = (user) => {
  const { STRINGS } = DASHBOARD_CONFIG;

  if (!user?.name?.first) {
    return STRINGS.DEFAULT_USER;
  }

  const first = user.name.first;
  const last = user.name.last || "";

  return `${first} ${last}`.trim();
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const { user } = useAuth();

  /* ---------------------------------------------------------------------- */
  /*                              User Data                                 */
  /* ---------------------------------------------------------------------- */

  const displayName = formatFullName(user);

  const username = user?.username
    ? `@${user.username}`
    : "";

  const email = user?.email || "";

  const showMetadata = username || email;

  return (
    <DashboardLayout>
      <section
        className={STYLES.pageWrapper}
        aria-labelledby="dashboard-heading"
      >
        <header
          className={STYLES.header}
          aria-label="Welcome greeting"
        >
          <h1
            id="dashboard-heading"
            className={STYLES.heading}
          >
            {DASHBOARD_CONFIG.STRINGS.GREETING_PREFIX}{" "}
            {displayName}!
          </h1>

          {showMetadata && (
            <p className={STYLES.metaText}>
              {username}{" "}
              {username && email
                ? DASHBOARD_CONFIG.STRINGS
                  .METADATA_SEPARATOR
                : ""}
              {" "}
              {email}
            </p>
          )}
        </header>

        <section aria-label="Quick Stats">
          <dl className={STYLES.statsContainer}>
            {DASHBOARD_CONFIG.DEFAULT_STATS.map(
              (item) => (
                <div
                  key={item.label}
                  className={STYLES.statCard}
                >
                  <dt className={STYLES.statLabel}>
                    {item.label}
                  </dt>

                  <dd className={STYLES.statValue}>
                    {item.value}
                  </dd>
                </div>
              )
            )}
          </dl>
        </section>

        <section className={STYLES.sectionGrid}>
          {/* Recent Activity */}
          <div className={STYLES.sectionCard}>
            <h2 className={STYLES.sectionTitle}>
              Recent Activity
            </h2>

            <div>
              {DASHBOARD_CONFIG.RECENT_ACTIVITY.map(
                (activity, index) => (
                  <div
                    key={index}
                    className={STYLES.activityItem}
                  >
                    {activity}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Workspace */}
          <div className={STYLES.sectionCard}>
            <h2 className={STYLES.sectionTitle}>
              Workspace
            </h2>

            <p className={STYLES.emptyText}>
              No projects created yet.
            </p>

            <button className={STYLES.button}>
              Create Project
            </button>
          </div>
        </section>
      </section>
    </DashboardLayout>
  );
}
