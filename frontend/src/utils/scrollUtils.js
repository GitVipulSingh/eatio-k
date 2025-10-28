/**
 * Scroll utilities for manual scroll control
 */

/**
 * Force scroll to top using multiple methods for maximum compatibility
 */
export const forceScrollToTop = () => {
  console.log('🔝 forceScrollToTop: Manually scrolling to top')
  
  // Method 1: Standard scrollTo with instant behavior
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  })
  
  // Method 2: Direct property setting
  window.scrollTo(0, 0)
  
  // Method 3: Set scroll position on document elements
  if (document.documentElement) {
    document.documentElement.scrollTop = 0
  }
  if (document.body) {
    document.body.scrollTop = 0
  }
  
  // Method 4: Force using requestAnimationFrame
  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  })
}

/**
 * Scroll to top with smooth animation
 */
export const smoothScrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  })
}

/**
 * Get current scroll position
 */
export const getCurrentScrollPosition = () => {
  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
}

/**
 * Check if page is scrolled
 */
export const isPageScrolled = () => {
  return getCurrentScrollPosition() > 0
}

export default {
  forceScrollToTop,
  smoothScrollToTop,
  getCurrentScrollPosition,
  isPageScrolled
}