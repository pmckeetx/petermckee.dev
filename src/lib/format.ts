// Pure helpers shared by the build-time data layer and client components.
// No Node/`fs` imports here.

export const SITE_URL = "https://petermckee.dev";

/** Format an ISO date (YYYY-MM-DD) as e.g. "May 20, 2026". */
export const formatDate = (iso: string): string => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
};

/** Absolute URL for a path, e.g. absoluteUrl("/blog/foo") -> "https://petermckee.dev/blog/foo". */
export const absoluteUrl = (path: string): string => {
    if (path.startsWith("http")) return path;
    return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
