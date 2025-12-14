/**
 * Theme-aware utility classes for consistent styling across dark and light modes
 * Use these instead of hard-coded colors to ensure proper theme support
 */

export const themeClasses = {
  // Backgrounds
  bgApp: 'bg-black dark:bg-black light:bg-gray-50',
  bgPanel: 'bg-black/40 dark:bg-black/40 light:bg-white',
  bgSurface: 'bg-black/60 dark:bg-black/60 light:bg-gray-100',
  bgInput: 'bg-black/50 dark:bg-black/50 light:bg-white',
  
  // Text colors
  textPrimary: 'text-green-400 dark:text-green-400 light:text-gray-900',
  textSecondary: 'text-green-300 dark:text-green-300 light:text-gray-700',
  textMuted: 'text-green-400/60 dark:text-green-400/60 light:text-gray-500',
  textAccent: 'text-green-400 dark:text-green-400 light:text-green-600',
  
  // Borders
  borderAccent: 'border-green-400 dark:border-green-400 light:border-green-600',
  borderSubtle: 'border-green-400/30 dark:border-green-400/30 light:border-gray-300',
  borderMuted: 'border-green-400/20 dark:border-green-400/20 light:border-gray-200',
  
  // Buttons
  btnPrimary: 'bg-green-400 dark:bg-green-400 light:bg-green-600 text-black hover:bg-green-300 dark:hover:bg-green-300 light:hover:bg-green-500',
  btnSecondary: 'bg-transparent border-2 border-green-400 dark:border-green-400 light:border-green-600 text-green-400 dark:text-green-400 light:text-green-600 hover:bg-green-400/10',
  btnDanger: 'bg-transparent border-2 border-red-400 text-red-400 hover:bg-red-400/10',
  
  // Cards
  cardBorder: 'border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300',
  cardHover: 'hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600',
  
  // Inputs
  input: 'bg-black/50 dark:bg-black/50 light:bg-white border-2 border-green-400/50 dark:border-green-400/50 light:border-gray-300 text-green-400 dark:text-green-400 light:text-gray-900 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-500 light:focus:ring-green-600',
  
  // Special effects (only in dark mode)
  glow: 'dark:shadow-[0_0_15px_rgba(0,255,65,0.3)] light:shadow-md',
  glowHover: 'dark:hover:shadow-[0_0_20px_rgba(0,255,65,0.5)] light:hover:shadow-lg',
}

/**
 * Get theme-aware class string
 * @param baseClass - Base classes that apply to both themes
 * @param darkClass - Classes for dark mode
 * @param lightClass - Classes for light mode
 */
export function getThemeClass(baseClass: string, darkClass?: string, lightClass?: string): string {
  const classes = [baseClass]
  if (darkClass) classes.push(`dark:${darkClass}`)
  if (lightClass) classes.push(`light:${lightClass}`)
  return classes.join(' ')
}

/**
 * Common component theme classes
 */
export const componentThemes = {
  page: 'min-h-screen bg-black dark:bg-black light:bg-gray-50 text-green-400 dark:text-green-400 light:text-gray-900',
  container: 'max-w-7xl mx-auto p-8',
  heading: 'text-4xl font-bold font-mono text-green-400 dark:text-green-400 light:text-gray-900',
  subheading: 'text-xl font-mono text-green-400/70 dark:text-green-400/70 light:text-gray-700',
  label: 'text-sm font-mono text-green-400/70 dark:text-green-400/70 light:text-gray-600',
  link: 'text-green-400 dark:text-green-400 light:text-green-600 hover:text-green-300 dark:hover:text-green-300 light:hover:text-green-500 underline',
}
