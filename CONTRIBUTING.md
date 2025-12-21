# Contributing to SEMMA-AI

Thank you for your interest in contributing to SEMMA-AI! 🌾

## How to Contribute

### Reporting Issues

- Use GitHub Issues to report bugs
- Include steps to reproduce
- Specify your environment (OS, Python/Node version, etc.)
- Add screenshots if applicable

### Suggesting Features

- Open a GitHub Issue with the `enhancement` label
- Describe the feature and its benefits
- Explain use cases
- Consider implementation details

### Code Contributions

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/AgriBOT.git
   cd AgriBOT/ghana-agri-bot
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up development environment**
   ```bash
   # Run setup script
   ./setup.sh  # or setup.ps1 on Windows
   ```

4. **Make your changes**
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

5. **Test your changes**
   ```bash
   # Backend tests
   pytest tests/
   
   # Mobile linting
   cd mobile-new && npm run lint
   
   # Web linting
   cd agribot-landing && npm run lint
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   Use conventional commits:
   - `feat:` new feature
   - `fix:` bug fix
   - `docs:` documentation changes
   - `style:` formatting, missing semi colons, etc.
   - `refactor:` code restructuring
   - `test:` adding tests
   - `chore:` maintenance

7. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```
   
   Then open a PR on GitHub with:
   - Clear description of changes
   - Link to related issues
   - Screenshots if UI changes
   - Test results

## Code Style

### Python
- Follow PEP 8
- Use Black for formatting
- Use type hints
- Write docstrings

### TypeScript/JavaScript
- Follow ESLint configuration
- Use TypeScript types
- Write JSDoc comments
- Use meaningful variable names

## Testing

- Write unit tests for new features
- Maintain test coverage above 80%
- Test edge cases
- Include integration tests where applicable

## Documentation

- Update README.md for feature changes
- Add comments for complex logic
- Update API documentation
- Include examples where helpful

## Community

- Be respectful and inclusive
- Help others in discussions
- Share knowledge and learnings
- Provide constructive feedback

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making SEMMA-AI better!** 🙏
