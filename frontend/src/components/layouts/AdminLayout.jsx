import React from 'react'
import { motion } from 'framer-motion'
import AdminHeader from './AdminHeader'
import Footer from '../../client/components/layout/Footer'

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader />
      
      <motion.main 
        className="flex-1"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      
      <Footer />
    </div>
  )
}

export default AdminLayout