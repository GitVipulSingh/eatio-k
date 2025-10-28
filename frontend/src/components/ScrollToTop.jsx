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
    // Log for debugging
    console.log('🔝 ScrollToTop: Route changed to:', pathname)
    
    // Multiple approaches to ensure scroll to top works reliably
    const scrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop
      console.log('🔝 ScrollToTop: Current scroll position:', currentScroll)
      
      // Method 1: Standard scrollTo
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      })
      
      // Method 2: Fallback for older browsers
      window.scrollTo(0, 0)
      
      // Method 3: Set scroll position on document elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0
      }
      if (document.body) {
        document.body.scrollTop = 0
      }
      
      // Verify scroll position after setting
      setTimeout(() => {
        const newScroll = window.pageYOffset || document.documentElement.scrollTop
        console.log('🔝 ScrollToTop: New scroll position:', newScroll)
      }, 10)
    }

    // Execute immediately
    scrollToTop()
    
    // Also execute after a small delay to handle any async rendering
    const timeoutId = setTimeout(scrollToTop, 100)
    
    return () => clearTimeout(timeoutId)
  }, [pathname])

  return null
}

export default ScrollToTop