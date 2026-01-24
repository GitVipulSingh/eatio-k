// Centralized role-based redirect configuration
// Single frontend deployment with route-based user access

import { CLIENT_URL } from '../config/api'

// Define role-based redirect paths (all within same domain)
export const ROLE_REDIRECTS = {
  customer: '/',
  admin: '/admin/dashboard',
  superadmin: '/super-admin/dashboard'
}

/**
 * Get the redirect path for a user role
 * @param {string} role - User role (customer, admin, superadmin)
 * @returns {string} Redirect path
 */
export const getRoleRedirect = (role) => {
  if (!role) return '/'
  return ROLE_REDIRECTS[role] || '/'
}

/**
 * Perform role-based navigation (within same app)
 * @param {string} role - User role
 * @param {function} navigate - React Router navigate function
 * @param {object} options - Navigation options
 */
export const navigateByRole = (role, navigate, options = {}) => {
  const path = getRoleRedirect(role)
  const { replace = true, ...otherOptions } = options
  
  console.log('🧭 Role-based navigation:', { 
    role, 
    path, 
    replace,
    currentLocation: window.location.pathname 
  })
  
  navigate(path, { replace, ...otherOptions })
}

/**
 * Get the full URL for a role (for external links)
 * @param {string} role - User role
 * @returns {string} Full URL
 */
export const getRoleUrl = (role) => {
  const path = getRoleRedirect(role)
  const baseUrl = CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  return `${baseUrl}${path}`
}

/**
 * Check if user has access to current route based on role
 * @param {string} userRole - User's role
 * @param {string} currentPath - Current route path
 * @returns {boolean} True if user has access
 */
export const hasRouteAccess = (userRole, currentPath) => {
  if (!userRole) return false
  
  // Customer access
  if (userRole === 'customer') {
    return !currentPath.startsWith('/admin') && !currentPath.startsWith('/super-admin')
  }
  
  // Admin access
  if (userRole === 'admin') {
    return currentPath.startsWith('/admin') || currentPath === '/' || currentPath.startsWith('/profile')
  }
  
  // SuperAdmin access (can access everything)
  if (userRole === 'superadmin') {
    return true
  }
  
  return false
}

export default {
  ROLE_REDIRECTS,
  getRoleRedirect,
  navigateByRole,
  getRoleUrl,
  hasRouteAccess
}