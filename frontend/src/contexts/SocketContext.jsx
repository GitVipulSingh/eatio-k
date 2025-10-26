import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [shouldConnect, setShouldConnect] = useState(false)

  // Check if we should connect based on current path
  useEffect(() => {
    const checkPath = () => {
      const isAuthPage = window.location.pathname.includes('/auth/')
      setShouldConnect(!isAuthPage)
      
      if (isAuthPage) {
        console.log('🔒 Auth page detected - socket connection disabled')
      }
    }
    
    checkPath()
    
    // Listen for route changes
    const handlePopState = () => checkPath()
    window.addEventListener('popstate', handlePopState)
    
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!shouldConnect) {
      console.log('🔒 Skipping socket connection on auth page')
      return
    }

    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: false,
      autoConnect: true
    })

    socketInstance.on('connect', () => {
      console.log('✅ Connected to server via WebSocket')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from server')
      setIsConnected(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
      setIsConnected(false)
      // Don't show error toast for connection issues during registration/auth flows
      if (!window.location.pathname.includes('/auth/')) {
        console.warn('Socket connection failed, but continuing without real-time features')
      }
    })

    // Global event listeners for system-wide updates
    socketInstance.on('restaurant_rating_updated', (data) => {
      console.log('⭐ Restaurant rating updated:', data)
      toast.success(`${data.restaurantName} rating updated to ${data.newRating.toFixed(1)}⭐`)
    })

    socketInstance.on('restaurant_status_updated', (data) => {
      console.log('🏪 Restaurant status updated:', data)
      if (data.newStatus === 'approved') {
        toast.success(`${data.restaurantName} has been approved!`)
      } else if (data.newStatus === 'rejected') {
        toast.error(`${data.restaurantName} has been rejected`)
      }
    })

    socketInstance.on('new_order_for_admin', (data) => {
      console.log('🛒 New order for admin:', data)
      // This will be handled by specific dashboard components
    })

    socketInstance.on('order_status_changed', (data) => {
      console.log('📦 Order status changed:', data)
      // This will be handled by specific dashboard components
    })

    socketInstance.on('system_stats_update', (data) => {
      console.log('📊 System stats update:', data)
      // This will be handled by Super Admin dashboard
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [shouldConnect])

  const joinOrderRoom = (orderId) => {
    if (socket && isConnected && shouldConnect) {
      socket.emit('join_order_room', orderId)
      console.log(`🏠 Joined order room: ${orderId}`)
    }
  }

  const leaveOrderRoom = (orderId) => {
    if (socket && isConnected && shouldConnect) {
      socket.emit('leave_order_room', orderId)
      console.log(`🚪 Left order room: ${orderId}`)
    }
  }

  const value = {
    socket,
    isConnected,
    joinOrderRoom,
    leaveOrderRoom
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}