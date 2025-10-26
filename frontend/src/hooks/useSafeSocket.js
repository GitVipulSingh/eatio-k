// Hook for safely using socket connections
import { useSocket } from '../contexts/SocketContext'

export const useSafeSocket = () => {
  try {
    const socketContext = useSocket()
    
    // Check if we're on an auth page
    const isAuthPage = window.location.pathname.includes('/auth/')
    
    if (isAuthPage) {
      // Return a mock socket context for auth pages
      return {
        socket: null,
        isConnected: false,
        joinOrderRoom: () => {},
        leaveOrderRoom: () => {}
      }
    }
    
    return socketContext
  } catch (error) {
    // If socket context is not available, return mock
    console.warn('Socket context not available, returning mock')
    return {
      socket: null,
      isConnected: false,
      joinOrderRoom: () => {},
      leaveOrderRoom: () => {}
    }
  }
}