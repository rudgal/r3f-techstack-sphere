import { useState, useEffect } from 'react';

// Tailwind 4 breakpoint names
const BREAKPOINT_NAMES = ['sm', 'md', 'lg', 'xl', '2xl'] as const;

// Tailwind 4 default breakpoints - fallback when CSS variables aren't available
// Source: https://tailwindcss.com/docs/responsive-design
const TAILWIND_DEFAULTS: Record<string, number> = {
  sm: 640, // Small devices (landscape phones, 640px and up)
  md: 768, // Medium devices (tablets, 768px and up)
  lg: 1024, // Large devices (desktops, 1024px and up)
  xl: 1280, // Extra large devices (large desktops, 1280px and up)
  '2xl': 1536, // 2X-Large devices (larger desktops, 1536px and up)
};

export type TailwindBreakpoint = (typeof BREAKPOINT_NAMES)[number];

type TailwindBreakpointStates = {
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
};

export function useTailwindBreakpoint(): TailwindBreakpointStates {
  const [breakpoints, setBreakpoints] = useState<TailwindBreakpointStates>(
    () => {
      // Initialize with current window size if available
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        return {
          isSm: width >= TAILWIND_DEFAULTS.sm,
          isMd: width >= TAILWIND_DEFAULTS.md,
          isLg: width >= TAILWIND_DEFAULTS.lg,
          isXl: width >= TAILWIND_DEFAULTS.xl,
          is2xl: width >= TAILWIND_DEFAULTS['2xl'],
        };
      }
      // SSR fallback
      return {
        isSm: false,
        isMd: false,
        isLg: false,
        isXl: false,
        is2xl: false,
      };
    }
  );

  const [tailwindBreakpoints, setTailwindBreakpoints] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    // Read breakpoints from Tailwind CSS variables
    const readTailwindBreakpoints = () => {
      if (typeof window === 'undefined') return {};

      const rootStyles = getComputedStyle(document.documentElement);
      const breakpointValues: Record<string, number> = {};

      BREAKPOINT_NAMES.forEach((name) => {
        const cssVar = `--breakpoint-${name}`;
        const value = rootStyles.getPropertyValue(cssVar).trim();

        if (value) {
          // Parse value (could be in px, rem, etc.)
          const numericValue = parseFloat(value);
          breakpointValues[name] = value.includes('rem')
            ? numericValue * 16
            : numericValue;
        } else {
          // Fallback to Tailwind defaults if CSS variables aren't available
          breakpointValues[name] = TAILWIND_DEFAULTS[name] || 0;
        }
      });

      return breakpointValues;
    };

    setTailwindBreakpoints(readTailwindBreakpoints());
  }, []);

  useEffect(() => {
    if (Object.keys(tailwindBreakpoints).length === 0) return;

    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        isSm: width >= tailwindBreakpoints.sm,
        isMd: width >= tailwindBreakpoints.md,
        isLg: width >= tailwindBreakpoints.lg,
        isXl: width >= tailwindBreakpoints.xl,
        is2xl: width >= tailwindBreakpoints['2xl'],
      });
    };

    updateBreakpoints();
    window.addEventListener('resize', updateBreakpoints);
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, [tailwindBreakpoints]);

  return breakpoints;
}

export default useTailwindBreakpoint;
