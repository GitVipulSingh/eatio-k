// Conditional Socket Provider that only initializes on non-auth pages
import { useLocation } from 'react-router-dom'
import { SocketProvider } from '../contexts/SocketContext'

const ConditionalSocketProvider = ({ children }) => {
  const location = useLocation()
  
  // Check if current path is an auth page
  const isAuthPage = location.pathname.includes('/auth/')
  
  if (isAuthPage) {
    console.log('🔒 Auth page detected - rendering without socket provider')
    // Render children without SocketProvider on auth pages
    return children
  }
  
  // Render with SocketProvider on non-auth pages
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  )
}

export default ConditionalSocketProvider