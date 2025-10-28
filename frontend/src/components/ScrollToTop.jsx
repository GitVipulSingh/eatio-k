import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop component that automatically scrolls to top on route changes
 * 
 * This component solves the common issue where navigating between pages
 * retains the previous page's scroll position instead of starting from the top.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    // Single, optimized scroll to top operation
    const scrollToTop = () => {
      // Use requestAnimationFrame for smooth, non-blocking scroll
      requestAnimationFrame(() => {
        // Single scroll operation to prevent conflicts
        window.scrollTo(0, 0)
      })
    }

    // Execute with minimal delay to avoid conflicts with page transitions
    const timeoutId = setTimeout(scrollToTop, 50)
    
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}

export default ScrollToTop