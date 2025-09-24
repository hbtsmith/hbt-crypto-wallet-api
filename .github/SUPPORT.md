# Support

## Getting Help

We're here to help! Here are the best ways to get support for HBT Crypto Wallet API.

## 📚 Documentation

Before asking for help, please check our documentation:

- [README.md](README.md) - Getting started and basic usage
- [API Documentation](http://localhost:3000/api-docs) - Interactive API docs
- [Contributing Guide](.github/CONTRIBUTING.md) - Development guidelines

## 🐛 Bug Reports

If you've found a bug, please:

1. Check if it's already reported in [Issues](https://github.com/yourusername/hbt-crypto-wallet-api/issues)
2. If not, create a new issue using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
3. Include as much detail as possible:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages/logs

## 💡 Feature Requests

Have an idea for a new feature? We'd love to hear it!

1. Check if it's already requested in [Issues](https://github.com/yourusername/hbt-crypto-wallet-api/issues)
2. Create a new issue using our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
3. Describe the feature and its benefits

## 💬 Community Support

### GitHub Discussions

For general questions, discussions, and community support:
- [GitHub Discussions](https://github.com/yourusername/hbt-crypto-wallet-api/discussions)
- Use appropriate categories (Q&A, Ideas, General, etc.)

### Issues

For specific problems or bugs:
- [GitHub Issues](https://github.com/yourusername/hbt-crypto-wallet-api/issues)

## 🔧 Technical Support

### Common Issues

#### Installation Problems
- Ensure you have Node.js >= 18.0.0
- Check that Yarn is properly installed
- Verify Docker is running (if using Docker)

#### Database Issues
- Check PostgreSQL connection
- Verify Prisma migrations are up to date
- Ensure database permissions are correct

#### Redis Issues
- Verify Redis is running
- Check connection settings
- Ensure proper Redis configuration

#### API Issues
- Check environment variables
- Verify JWT configuration
- Ensure proper API key setup

### Debugging

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=*
yarn dev
```

#### Check Logs
```bash
# Docker logs
docker-compose -f docker-compose.dev.yml logs -f

# Application logs
yarn dev 2>&1 | tee app.log
```

#### Test Connections
```bash
# Test database connection
yarn prisma:studio

# Test Redis connection
redis-cli ping

# Test API endpoints
curl http://localhost:3000/health
```

## 📞 Contact

### Email Support
For urgent issues or private matters:
- **General Support**: hbt.vieira@gmail.com
- **Security Issues**: hbt.vieira@gmail.com
- **Business Inquiries**: hbt.vieira@gmail.com

### Response Times
- **Critical Issues**: Within 24 hours
- **General Support**: Within 48 hours
- **Feature Requests**: Within 1 week

## 🤝 Contributing

Want to help improve the project? Check out our [Contributing Guide](.github/CONTRIBUTING.md)!

### Ways to Contribute
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation
- Help other users

## 📖 Resources

### External Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [BullMQ Documentation](https://bullmq.io/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Community
- [GitHub Discussions](https://github.com/yourusername/hbt-crypto-wallet-api/discussions)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/hbt-crypto-wallet-api)
- [Discord Community](https://discord.gg/your-invite) (if applicable)

## 🆘 Emergency Support

For critical production issues:
1. Create an issue with the "urgent" label
2. Email hbt.vieira@gmail.com
3. Include:
   - Description of the issue
   - Impact on users
   - Steps to reproduce
   - Any error messages

## 📝 Feedback

We value your feedback! Please let us know:
- What's working well
- What could be improved
- How we can better serve the community

Thank you for using HBT Crypto Wallet API! 🚀
