import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './apiService'

// Query Keys
export const QUERY_KEYS = {
  restaurants: 'restaurants',
  restaurant: 'restaurant',
  user: 'user',
  orders: 'orders',
  order: 'order',
  search: 'search',
}

// Restaurant Queries
export const useRestaurants = (filters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.restaurants, filters],
    queryFn: async () => {
      const { data } = await api.get('/restaurants', { params: filters })
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useRestaurant = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.restaurant, id],
    queryFn: async () => {
      const { data } = await api.get(`/restaurants/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Search Query
export const useSearch = (query, filters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.search, query, filters],
    queryFn: async () => {
      const { data } = await api.get('/search', { 
        params: { q: query, ...filters } 
      })
      return data
    },
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// User Queries
export const useUserProfile = (options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.user],
    queryFn: async () => {
      const { data } = await api.get('/users/profile')
      return data
    },
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error?.response?.status === 401) return false
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options, // Allow overriding default options
  })
}

// Order Queries
export const useOrderHistory = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.orders],
    queryFn: async () => {
      const { data } = await api.get('/orders/history')
      return data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useOrder = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.order, id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`)
      return data
    },
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds for real-time updates
  })
}

// Auth Mutations
export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post('/auth/login', {
        loginIdentifier: credentials.email, // Backend expects loginIdentifier
        password: credentials.password
      })
      return data
    },
    onSuccess: (data) => {
      // Store user data with proper structure
      const userInfo = {
        user: data,
        token: 'cookie-based' // Since backend uses cookies
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      queryClient.setQueryData([QUERY_KEYS.user], data)
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData) => {
      const { data } = await api.post('/auth/register', userData)
      return data
    },
    onSuccess: (data) => {
      // Auto-login after registration
      const userInfo = {
        user: data,
        token: 'cookie-based'
      }
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      queryClient.setQueryData([QUERY_KEYS.user], data)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      localStorage.removeItem('userInfo')
      queryClient.clear()
      // Redirect to home page
      window.location.href = '/'
    },
  })
}

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (phone) => {
      const { data } = await api.post('/auth/forgot-password', { phone })
      return data
    },
  })
}

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (resetData) => {
      const { data } = await api.post('/auth/reset-password', resetData)
      return data
    },
  })
}

// Order Mutations
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await api.post('/orders', orderData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.orders])
      queryClient.invalidateQueries([QUERY_KEYS.user]) // Update user orders
    },
  })
}

// Payment Mutations
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (paymentData) => {
      const { data } = await api.post('/payment/create-order', paymentData)
      return data
    },
  })
}

export const useVerifyPayment = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (verificationData) => {
      const { data } = await api.post('/payment/verify-payment', verificationData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.orders])
    },
  })
}

// Restaurant Admin Queries
export const useRestaurantOrders = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.orders, 'restaurant'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders')
      return data
    },
    staleTime: 30 * 1000, // 30 seconds for real-time updates
  })
}

export const useMyRestaurant = () => {
  return useQuery({
    queryKey: ['myRestaurant'],
    queryFn: async () => {
      console.log(`🏪 [API] Fetching my restaurant data`);
      const { data } = await api.get('/restaurants/my-restaurant')
      console.log(`🏪 [API] Restaurant data received:`, {
        name: data.name,
        menuItemsCount: data.menuItems?.length || 0
      });
      
      // Log menu items with images
      data.menuItems?.forEach((item, index) => {
        console.log(`🏪 [API] Menu item ${index}: ${item.name}, Image: ${item.image}`);
      });
      
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Menu Management Mutations
export const useAddMenuItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (menuItem) => {
      const { data } = await api.post('/restaurants/menu', menuItem)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRestaurant'])
    },
  })
}

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ menuItemId, ...updateData }) => {
      const { data } = await api.put(`/restaurants/menu/${menuItemId}`, updateData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRestaurant'])
    },
  })
}

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (menuItemId) => {
      const { data } = await api.delete(`/restaurants/menu/${menuItemId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRestaurant'])
    },
  })
}

// Order Status Update
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ orderId, status }) => {
      const { data } = await api.put(`/admin/orders/${orderId}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.orders])
    },
  })
}

// Super Admin Queries
export const usePendingRestaurants = () => {
  return useQuery({
    queryKey: ['pendingRestaurants'],
    queryFn: async () => {
      const { data } = await api.get('/admin/restaurants/pending')
      return data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useApproveRestaurant = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (restaurantId) => {
      const { data } = await api.put(`/admin/restaurants/${restaurantId}/status`, { 
        status: 'approved'
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRestaurants'])
    },
  })
}

export const useRejectRestaurant = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ restaurantId, reason }) => {
      const { data } = await api.put(`/admin/restaurants/${restaurantId}/status`, { 
        status: 'rejected',
        remarks: reason
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRestaurants'])
    },
  })
}

export const useUpdateRestaurantStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ restaurantId, status, remarks }) => {
      const { data } = await api.put(`/admin/restaurants/${restaurantId}/status`, { 
        status, 
        remarks 
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingRestaurants'])
    },
  })
}

// Super Admin Dashboard Queries
export const useSystemStats = () => {
  return useQuery({
    queryKey: ['systemStats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats')
      return data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useAllRestaurants = () => {
  return useQuery({
    queryKey: ['allRestaurants'],
    queryFn: async () => {
      const { data } = await api.get('/admin/restaurants')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users')
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useAllOrders = () => {
  return useQuery({
    queryKey: ['allOrders'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders/all')
      return data
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Restaurant Open/Closed Status
export const useUpdateRestaurantOpenStatus = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ isOpen, operatingHours }) => {
      const { data } = await api.put('/admin/restaurant/status', { 
        isOpen, 
        operatingHours 
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myRestaurant'])
    },
  })
}

// Menu Item Image Upload
export const useUploadMenuImage = () => {
  return useMutation({
    mutationFn: async (file) => {
      console.log(`📤 [API] Starting image upload for file:`, {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      const formData = new FormData()
      formData.append('image', file)
      
      console.log(`📤 [API] Sending POST request to /menu-images/upload`);
      const { data } = await api.post('/menu-images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      console.log(`✅ [API] Upload response received:`, data);
      return data
    },
  })
}

// Delete Menu Item Image
export const useDeleteMenuImage = () => {
  return useMutation({
    mutationFn: async (filename) => {
      const { data } = await api.delete(`/menu-images/${filename}`)
      return data
    },
  })
}