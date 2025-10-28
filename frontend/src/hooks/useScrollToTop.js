import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook to scroll to top on route change
 * @param {Object} options - Configuration options
 * @param {boolean} options.smooth - Whether to use smooth scrolling (default: false)
 * @param {number} options.delay - Delay before scrolling in milliseconds (default: 0)
 */
export const useScrollToTop = (options = {}) => {
  const { pathname } = useLocation()
  const { 
    smooth = false, 
    delay = 0
  } = options

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'instant'
      })
    }

    if (delay > 0) {
      const timeoutId = setTimeout(scrollToTop, delay)
      return () => clearTimeout(timeoutId)
    } else {
      scrollToTop()
    }
  }, [pathname, smooth, delay])
}

export default useScrollToTop