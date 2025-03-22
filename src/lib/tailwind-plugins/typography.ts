/**
 * Custom Tailwind plugin for typography and font handling
 */
import plugin from 'tailwindcss/plugin';

// Using 'any' type for Tailwind v4 compatibility
export const typographyPlugin = plugin(
  // @ts-ignore - Tailwind v4 types are different
  function({ addUtilities, matchUtilities, theme }) {
    // Font families
    addUtilities({
      '.font-main': {
        fontFamily: 'var(--font-sans)',
      },
      '.font-fancy': {
        fontFamily: 'var(--font-fancy)',
      },
      '.font-code': {
        fontFamily: 'var(--font-mono)',
      },
    });

    // Text presets for common combinations
    addUtilities({
      '.text-heading-1': {
        fontFamily: 'var(--font-fancy)',
        fontSize: theme('fontSize.4xl'),
        fontWeight: theme('fontWeight.bold'),
        letterSpacing: theme('letterSpacing.tight'),
        lineHeight: theme('lineHeight.tight'),
      },
      '.text-heading-2': {
        fontFamily: 'var(--font-fancy)',
        fontSize: theme('fontSize.3xl'),
        fontWeight: theme('fontWeight.semibold'),
        letterSpacing: theme('letterSpacing.tight'),
        lineHeight: theme('lineHeight.tight'),
      },
      '.text-heading-3': {
        fontFamily: 'var(--font-fancy)',
        fontSize: theme('fontSize.2xl'),
        fontWeight: theme('fontWeight.medium'),
        letterSpacing: theme('letterSpacing.tight'),
        lineHeight: theme('lineHeight.snug'),
      },
      '.text-heading-4': {
        fontFamily: 'var(--font-fancy)',
        fontSize: theme('fontSize.xl'),
        fontWeight: theme('fontWeight.medium'),
        letterSpacing: theme('letterSpacing.tight'),
        lineHeight: theme('lineHeight.snug'),
      },
      '.text-body': {
        fontFamily: 'var(--font-sans)',
        fontSize: theme('fontSize.base'),
        fontWeight: theme('fontWeight.normal'),
        lineHeight: theme('lineHeight.relaxed'),
      },
      '.text-body-small': {
        fontFamily: 'var(--font-sans)',
        fontSize: theme('fontSize.sm'),
        fontWeight: theme('fontWeight.normal'),
        lineHeight: theme('lineHeight.relaxed'),
      },
      '.text-caption': {
        fontFamily: 'var(--font-sans)',
        fontSize: theme('fontSize.xs'),
        fontWeight: theme('fontWeight.medium'),
        letterSpacing: theme('letterSpacing.wide'),
        lineHeight: theme('lineHeight.normal'),
      },
      '.text-code': {
        fontFamily: 'var(--font-mono)',
        fontSize: theme('fontSize.sm'),
        fontWeight: theme('fontWeight.normal'),
        lineHeight: theme('lineHeight.normal'),
      },
    });
  }
);
