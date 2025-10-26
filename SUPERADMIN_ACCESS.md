# Super Admin Access Guide

## Issue: 403 Forbidden Error on Super Admin Dashboard

If you're seeing "Not authorized as a superadmin" errors when trying to access the Super Admin dashboard, it means you need to log in with the correct Super Admin credentials.

## Solution

### 1. **Use Existing Super Admin Account**
There's already a Super Admin user in the database:
- **Email**: `superadmin@gmail.com`
- **Password**: Contact the system administrator for the password

### 2. **Login Process**
1. Go to `/auth/login`
2. Enter the Super Admin credentials
3. After successful login, navigate to `/super-admin/dashboard`

### 3. **Verify Super Admin Access**
You can verify the Super Admin user exists by running:
```bash
cd eatio-backend/server
node scripts/create-superadmin.js
```

This will show existing Super Admin users and their details.

### 4. **Create New Super Admin (if needed)**
If you need to create a new Super Admin user, you can modify the script:
```bash
cd eatio-backend/server
# Edit scripts/create-superadmin.js to change credentials
node scripts/create-superadmin.js
```

## How Authentication Works

The system uses role-based authentication with JWT cookies:
- **Customer**: `jwt_customer` cookie
- **Restaurant Admin**: `jwt_admin` cookie  
- **Super Admin**: `jwt_superadmin` cookie

Each role has different access permissions:
- **Customer**: Can place orders, view restaurants
- **Restaurant Admin**: Can manage their restaurant, view orders
- **Super Admin**: Can approve restaurants, view all data, manage system

## Troubleshooting

### Error: "Not authorized as a superadmin"
- **Cause**: User is not logged in as Super Admin
- **Solution**: Login with Super Admin credentials

### Error: "Not authorized, no token provided"
- **Cause**: User is not logged in at all
- **Solution**: Login with any valid account first

### Error: "Invalid credentials"
- **Cause**: Wrong email/password combination
- **Solution**: Verify Super Admin credentials

## Security Notes

- Super Admin credentials should be kept secure
- Change default passwords after first login
- Only trusted administrators should have Super Admin access
- Super Admin can approve/reject restaurant applications
- Super Admin can view all system data and statistics

## Quick Access

1. **Login URL**: `http://localhost:3000/auth/login`
2. **Super Admin Dashboard**: `http://localhost:3000/super-admin/dashboard`
3. **Existing Super Admin**: `superadmin@gmail.com`

---

**Status**: ✅ Super Admin system is working correctly - just need to login with the right credentials!