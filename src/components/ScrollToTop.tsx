import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically scrolls the window to the top (0, 0) whenever the route pathname or search parameters change.
 * This fixes the SPA issue where navigating from the bottom of one page leaves the new page scrolled to the bottom.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Disable smooth scroll temporarily if set on html to prevent sluggish upward animation
    const html = document.documentElement;
    const prevScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' as ScrollBehavior,
    });

    html.scrollTop = 0;
    document.body.scrollTop = 0;

    // Restore previous scroll behavior on the next frame so layout finishes at top
    const timer = setTimeout(() => {
      html.style.scrollBehavior = prevScrollBehavior;
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
