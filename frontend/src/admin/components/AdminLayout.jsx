import React from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
} from '@mui/material'

const AdminLayout = ({ children }) => {
  const { user } = useSelector(state => state.auth)

  const getTitle = () => {
    if (user?.role === 'superadmin') {
      return 'Super Admin Panel'
    } else if (user?.role === 'admin') {
      return 'Restaurant Dashboard'
    }
    return 'Admin Panel'
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {getTitle()}
          </Typography>
          <Typography variant="body2">
            Welcome, {user?.name}
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Paper sx={{ p: 3, minHeight: '70vh' }}>
          {children}
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminLayout