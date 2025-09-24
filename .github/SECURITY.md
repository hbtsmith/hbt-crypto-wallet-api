# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public issue
2. Email us at: hbt.vieira@gmail.com
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- We will acknowledge receipt within 48 hours
- We will provide a detailed response within 7 days
- We will keep you informed of our progress

## Security Best Practices

### For Users
- Keep your dependencies updated
- Use strong passwords and enable 2FA
- Regularly rotate API keys
- Monitor your account for suspicious activity

### For Developers
- Follow secure coding practices
- Use environment variables for sensitive data
- Implement proper input validation
- Use HTTPS in production
- Regular security audits

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Input validation with Zod schemas
- Rate limiting on API endpoints
- CORS configuration
- Environment variable protection

## Contact

For security-related questions, please contact: hbt.vieira@gmail.com
