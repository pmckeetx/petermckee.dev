import { useEffect, useState } from "react";

// Minimal client-side router. The site is otherwise a single-page scroller,
// so rather than pull in react-router we track window.location.pathname and
// re-render on history changes.

export const navigate = (to: string) => {
    if (window.location.pathname === to) return;
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo(0, 0);
};

export const useRoute = (): string => {
    const [path, setPath] = useState(window.location.pathname);

    useEffect(() => {
        const onPop = () => setPath(window.location.pathname);
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, []);

    return path;
};
