# Security Guidelines

This document outlines security best practices for the Eatio project.

## Environment Variables

### ⚠️ NEVER commit credentials to Git

- All sensitive information (passwords, API keys, secrets) must be stored in environment variables
- Use `.env` files for local development
- Use `.env.example` to document required variables without exposing actual values
- The `.gitignore` file ensures `.env` files are never committed

### Required Environment Variables

See `eatio-backend/server/.env.example` for a complete list of required environment variables.

### Super Admin Setup

The super admin credentials are configured via environment variables:

```bash
SUPERADMIN_NAME=Super Admin
SUPERADMIN_EMAIL=superadmin@yourdomain.com
SUPERADMIN_PHONE=1234567890
SUPERADMIN_PASSWORD=YourSecurePassword123
```

**Security Requirements:**
- Use a strong password (minimum 12 characters, mix of letters, numbers, symbols)
- Use a real email address you control
- Change default credentials immediately after setup
- Never share these credentials in code, documentation, or chat

### Password Security

- All passwords are automatically hashed using bcrypt before storage
- JWT tokens are used for authentication with secure secrets
- Passwords are never logged or exposed in API responses

## API Security

- CORS is configured to only allow requests from authorized origins
- Rate limiting is implemented to prevent abuse
- Helmet.js provides security headers
- Input validation and sanitization on all endpoints

## File Upload Security

- File uploads are handled through Cloudinary (secure cloud storage)
- File type validation prevents malicious uploads
- File size limits prevent abuse
- No local file storage to prevent security vulnerabilities

## Database Security

- MongoDB connection uses secure connection strings
- User roles and permissions are enforced
- Input sanitization prevents injection attacks
- Sensitive data is properly indexed and secured

## Deployment Security

### Production Environment Variables

For production deployment:

1. **Never use default credentials**
2. **Use strong, unique passwords**
3. **Enable 2FA where possible**
4. **Use HTTPS only**
5. **Set NODE_ENV=production**
6. **Use secure JWT secrets (64+ characters)**

### Environment Variable Management

- Use your hosting platform's environment variable system
- For Docker: use secrets or environment files
- For cloud platforms: use their secure environment variable systems
- Never hardcode credentials in Docker files or deployment scripts

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public GitHub issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Allow time for the issue to be fixed before public disclosure

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set securely
- [ ] Default credentials have been changed
- [ ] HTTPS is enabled
- [ ] Database connections are secure
- [ ] API keys are rotated and secure
- [ ] File uploads are properly validated
- [ ] Rate limiting is configured
- [ ] Security headers are enabled
- [ ] Logs don't contain sensitive information
- [ ] Dependencies are up to date and secure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)