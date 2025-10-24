import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '../contexts/SocketContext'
import { toast } from 'react-hot-toast'

export const useRealTimeUpdates = (options = {}) => {
  const { socket } = useSocket()
  const queryClient = useQueryClient()
  
  const {
    enableOrderUpdates = false,
    enableRestaurantUpdates = false,
    enableSystemStatsUpdates = false,
    enableRatingUpdates = false,
    restaurantId = null,
    userId = null
  } = options

  useEffect(() => {
    if (!socket) return

    // Order status updates for customers
    if (enableOrderUpdates && userId) {
      const handleOrderStatusUpdate = (data) => {
        console.log('📦 Order status updated:', data)
        
        // Invalidate order-related queries
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['order', data.orderId] })
        
        // Show toast notification
        toast.success(`Order status updated to ${data.newStatus}`)
      }

      socket.on('order_status_updated', handleOrderStatusUpdate)
      
      return () => {
        socket.off('order_status_updated', handleOrderStatusUpdate)
      }
    }

    // New orders for restaurant admins
    if (enableOrderUpdates && restaurantId) {
      const handleNewOrder = (data) => {
        if (data.restaurantId === restaurantId) {
          console.log('🛒 New order received:', data)
          
          // Invalidate restaurant orders and stats
          queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] })
          queryClient.invalidateQueries({ queryKey: ['my-restaurant'] })
          
          // Show toast notification
          toast.success(`New order from ${data.customerName}! ₹${data.totalAmount}`)
        }
      }

      const handleOrderStatusChange = (data) => {
        if (data.restaurantId === restaurantId) {
          console.log('📦 Order status changed:', data)
          
          // Invalidate restaurant orders
          queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] })
          
          // Show toast notification for important status changes
          if (data.newStatus === 'Delivered') {
            toast.success(`Order delivered to ${data.customerName}!`)
          }
        }
      }

      socket.on('new_order_for_admin', handleNewOrder)
      socket.on('order_status_changed', handleOrderStatusChange)
      
      return () => {
        socket.off('new_order_for_admin', handleNewOrder)
        socket.off('order_status_changed', handleOrderStatusChange)
      }
    }

    // Restaurant status updates for super admin
    if (enableRestaurantUpdates) {
      const handleRestaurantStatusUpdate = (data) => {
        console.log('🏪 Restaurant status updated:', data)
        
        // Invalidate restaurant-related queries
        queryClient.invalidateQueries({ queryKey: ['pending-restaurants'] })
        queryClient.invalidateQueries({ queryKey: ['all-restaurants'] })
        queryClient.invalidateQueries({ queryKey: ['system-stats'] })
        
        // Toast is already handled in SocketContext
      }

      socket.on('restaurant_status_updated', handleRestaurantStatusUpdate)
      
      return () => {
        socket.off('restaurant_status_updated', handleRestaurantStatusUpdate)
      }
    }

    // System stats updates for super admin
    if (enableSystemStatsUpdates) {
      const handleSystemStatsUpdate = (data) => {
        console.log('📊 System stats updated:', data)
        
        // Invalidate system stats queries
        queryClient.invalidateQueries({ queryKey: ['system-stats'] })
        queryClient.invalidateQueries({ queryKey: ['all-orders'] })
        
        // Show toast for important updates
        if (data.type === 'new_order') {
          // Don't show toast for every new order in super admin
        } else if (data.type === 'order_delivered') {
          // Could show a subtle notification for delivered orders
        }
      }

      socket.on('system_stats_update', handleSystemStatsUpdate)
      
      return () => {
        socket.off('system_stats_update', handleSystemStatsUpdate)
      }
    }

    // Rating updates for restaurant detail pages
    if (enableRatingUpdates) {
      const handleRatingUpdate = (data) => {
        console.log('⭐ Rating updated:', data)
        
        // Invalidate restaurant and review queries
        queryClient.invalidateQueries({ queryKey: ['restaurant', data.restaurantId] })
        queryClient.invalidateQueries({ queryKey: ['restaurants'] })
        queryClient.invalidateQueries({ queryKey: ['reviews', data.restaurantId] })
        
        // Toast is already handled in SocketContext
      }

      socket.on('restaurant_rating_updated', handleRatingUpdate)
      
      return () => {
        socket.off('restaurant_rating_updated', handleRatingUpdate)
      }
    }

  }, [socket, queryClient, enableOrderUpdates, enableRestaurantUpdates, enableSystemStatsUpdates, enableRatingUpdates, restaurantId, userId])
}

// Specific hooks for different dashboard types
export const useAdminDashboardUpdates = (restaurantId) => {
  return useRealTimeUpdates({
    enableOrderUpdates: true,
    restaurantId
  })
}

export const useSuperAdminDashboardUpdates = () => {
  return useRealTimeUpdates({
    enableRestaurantUpdates: true,
    enableSystemStatsUpdates: true
  })
}

export const useCustomerOrderUpdates = (userId) => {
  return useRealTimeUpdates({
    enableOrderUpdates: true,
    userId
  })
}

export const useRestaurantDetailUpdates = () => {
  return useRealTimeUpdates({
    enableRatingUpdates: true
  })
}