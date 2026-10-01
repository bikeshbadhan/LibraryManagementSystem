# Contributing to Library Management System (LMS)

Thank you for considering contributing to the Library Management System! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Git
- Basic knowledge of TypeScript, React, and Cloudflare Workers

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/LMS.git
   cd LMS
   ```
3. Install dependencies:
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Backend Development

```bash
cd backend
npm run dev  # Start development server
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start development server
```

### Testing Your Changes

1. Test backend:
   ```bash
   cd backend
   npx tsc --noEmit  # Type check
   ```

2. Test frontend:
   ```bash
   cd frontend
   npm run lint      # Lint code
   npm run build     # Build for production
   ```

## Making Changes

### Code Style

- Use TypeScript for all new code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear and descriptive commit messages:

```
feat: Add book reservation feature
fix: Resolve ISBN lookup timeout issue
docs: Update deployment guide
style: Format code with prettier
refactor: Simplify authentication logic
test: Add unit tests for book service
```

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

## Pull Request Process

1. **Update Documentation**: If your changes affect usage, update relevant docs
2. **Test Thoroughly**: Ensure all changes work as expected
3. **Clean Commits**: Squash commits if necessary
4. **Descriptive PR**: Explain what, why, and how
5. **Link Issues**: Reference related issues

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed the code
- [ ] Updated documentation
- [ ] No breaking changes (or documented)
```

## What to Contribute

### High Priority

- Bug fixes
- Performance improvements
- Security enhancements
- Documentation improvements
- Test coverage

### Feature Ideas

- Advanced search filters
- Book recommendations
- Email notifications
- Mobile app
- Analytics dashboard
- Barcode scanning
- Multi-language support

### Good First Issues

Look for issues tagged with `good-first-issue` for beginner-friendly tasks.

## Architecture Overview

### Backend Structure

```
backend/
├── src/
│   ├── handlers/      # API route handlers
│   ├── middleware/    # Auth and other middleware
│   ├── utils/         # Helper functions
│   ├── types.ts       # TypeScript types
│   └── index.ts       # Main router
└── migrations/        # Database migrations
```

### Frontend Structure

```
frontend/
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── services/      # API service layer
│   ├── context/       # React context
│   └── types/         # TypeScript types
```

## API Guidelines

### Adding New Endpoints

1. Define handler in `backend/src/handlers/`
2. Add route in `backend/src/index.ts`
3. Implement authentication/authorization
4. Add TypeScript types
5. Update API documentation

### Example Handler

```typescript
export async function getBooks(request: Request, env: Env): Promise<Response> {
  try {
    const books = await env.DB.prepare('SELECT * FROM books').all();
    return successResponse(books.results);
  } catch (error) {
    return errorResponse('Failed to fetch books');
  }
}
```

## Database Changes

### Creating Migrations

```bash
cd backend
npm run db:generate -- migration_name
```

Edit the generated SQL file in `migrations/` folder.

### Migration Guidelines

- Use descriptive names
- Add both UP and DOWN migrations
- Test migrations locally first
- Document schema changes

## UI/UX Guidelines

### Using Carbon Design System

- Use Carbon components from `@carbon/react`
- Follow Carbon design patterns
- Maintain consistent spacing
- Use Carbon icons from `@carbon/icons-react`

### Responsive Design

- Test on mobile, tablet, and desktop
- Use Carbon's Grid system
- Consider accessibility

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Include usage examples

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying API endpoints
- Updating dependencies

## Testing

### Manual Testing Checklist

- [ ] Login/logout works
- [ ] All CRUD operations function
- [ ] Search and filters work
- [ ] Pagination works correctly
- [ ] Error handling is appropriate
- [ ] Mobile responsive
- [ ] Cross-browser compatible

## Security

### Reporting Security Issues

Please report security vulnerabilities privately to the maintainers.

### Security Best Practices

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries
- Implement proper authentication
- Follow OWASP guidelines

## Questions?

- Open an issue for questions
- Check existing issues first
- Be specific and provide context
- Include code examples if relevant

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Thank You!

Your contributions make this project better. We appreciate your time and effort! 🎉
