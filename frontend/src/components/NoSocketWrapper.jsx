// Wrapper component that ensures no socket connections for auth pages
import { useEffect } from 'react'

const NoSocketWrapper = ({ children }) => {
  useEffect(() => {
    // Disable any socket connections on mount
    console.log('🔒 NoSocketWrapper: Ensuring no socket connections on auth page')
    
    // Clear any existing socket connections
    if (window.io && window.io.sockets) {
      Object.values(window.io.sockets).forEach(socket => {
        if (socket.connected) {
          console.log('🔌 Disconnecting existing socket connection')
          socket.disconnect()
        }
      })
    }
    
    return () => {
      console.log('🔒 NoSocketWrapper: Cleanup completed')
    }
  }, [])
  
  return children
}

export default NoSocketWrapper