import { useEffect } from 'react';

/**
 * ClickRipple provides an organic, tactile ripple effect on buttons, cards,
 * and interactive controls throughout the application on click.
 */
export default function ClickRipple() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Find the closest interactive element clicked
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        'button, a, [role="button"], input[type="submit"], input[type="checkbox"], .cursor-pointer, .interactive-click'
      );
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = `${diameter}px`;
      circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.className = 'global-ripple-effect';

      const computedPosition = window.getComputedStyle(target).position;
      if (computedPosition === 'static') {
        target.style.position = 'relative';
      }

      // Ensure overflow is hidden on the element so ripple doesn't leak out,
      // but do not clip elements with external badges or popovers
      const shouldHideOverflow =
        !target.classList.contains('overflow-hidden') &&
        !target.hasAttribute('data-no-overflow') &&
        !target.classList.contains('overflow-visible') &&
        !target.style.overflow;

      if (shouldHideOverflow) {
        target.style.overflow = 'hidden';
      }

      target.appendChild(circle);

      // Remove after animation completes and restore original overflow
      setTimeout(() => {
        circle.remove();
        if (shouldHideOverflow && target.style.overflow === 'hidden') {
          target.style.overflow = '';
        }
      }, 550);
    };

    window.addEventListener('click', handleClick, { passive: true });
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return null;
}
