/**
 * Scroll utilities for manual scroll control
 */

/**
 * Force scroll to top using optimized method for smooth performance
 */
export const forceScrollToTop = () => {
  // Use requestAnimationFrame for smooth, non-blocking scroll
  requestAnimationFrame(() => {
    window.scrollTo(0, 0)
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

/**
 * Throttle scroll events for better performance
 */
export const throttleScroll = (callback, delay = 16) => {
  let timeoutId
  let lastExecTime = 0
  
  return function (...args) {
    const currentTime = Date.now()
    
    if (currentTime - lastExecTime > delay) {
      callback.apply(this, args)
      lastExecTime = currentTime
    } else {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        callback.apply(this, args)
        lastExecTime = Date.now()
      }, delay - (currentTime - lastExecTime))
    }
  }
}

/**
 * Debounce scroll events
 */
export const debounceScroll = (callback, delay = 100) => {
  let timeoutId
  
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => callback.apply(this, args), delay)
  }
}

export default {
  forceScrollToTop,
  smoothScrollToTop,
  getCurrentScrollPosition,
  isPageScrolled,
  throttleScroll,
  debounceScroll
}