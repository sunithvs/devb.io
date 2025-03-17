# CONTRIBUTING.md

Thank you for your interest in contributing to devb.io! This guide will help you understand how to contribute to both the frontend and backend components of our project.

## 🌟 Project Overview

devb.io is a platform that automatically generates professional developer portfolios from GitHub profiles, using AI to enhance professional representations. The project consists of:

- **Frontend**: NextJS application (in the `/www` directory)
- **Backend**: FastAPI application (in the `/api` directory)
- **Caching**: Redis for performance optimization

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+ and npm/pnpm
- Redis (for local development)
- Git

### Setting Up the Development Environment

1. **Fork the Repository:**
   Click the Fork button on GitHub to create your own copy.

2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/your-username/devb.io.git
   cd devb.io
   ```

3. **Create a New Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔧 Backend Setup (FastAPI)

1. **Install Python Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables:**
   - Copy the example environment file and modify as needed
   - Required variables include API keys and configuration settings

3. **Run the Backend Server:**
   ```bash
   uvicorn api.main:app --reload --port 8000
   ```

4. **Access the API Documentation:**
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Backend Development Guidelines

1. **Code Structure:**
   - Place new API endpoints in the appropriate modules
   - Follow the existing pattern for route definitions
   - Use dependency injection for shared resources

2. **Error Handling:**
   - Use FastAPI's HTTPException for API errors
   - Include descriptive error messages
   - Implement proper status codes

3. **Testing:**
   - Write tests using pytest
   - Run tests with `pytest` command
   - Ensure test coverage for new features

4. **Performance Considerations:**
   - Use caching where appropriate
   - Implement async functions for I/O bound operations
   - Consider rate limiting for external API calls

## 💻 Frontend Setup (NextJS)

1. **Install Node Dependencies:**
   ```bash
   cd www
   pnpm install
   ```

2. **Environment Variables:**
   - Copy `www/example.env` to `www/.env.local`
   - Update the API endpoint and other required variables

3. **Run the Development Server:**
   ```bash
   pnpm dev
   ```

4. **Access the Frontend:**
   - Open http://localhost:3000 in your browser

### Frontend Development Guidelines

1. **Code Structure:**
   - Follow the Next.js app router structure
   - Place components in the appropriate directories
   - Use client and server components appropriately

2. **Styling:**
   - Use Tailwind CSS for styling
   - Follow the existing design system
   - Ensure responsive design

3. **State Management:**
   - Use Zustand for client state management (Only if necessary)
   - Follow existing patterns for data fetching

4. **Error Handling:**
   - Implement proper error boundaries
   - Use the retry mechanism for API calls (especially for LinkedIn data)
   - Display user-friendly error messages

5. **Performance:**
   - Optimize images and assets
   - Use proper loading states and skeletons
   - Implement proper caching strategies

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=api
```

### Frontend Testing

```bash
# Run linting
cd www
pnpm lint
```

## 📝 Making Changes

- Keep your code clean and follow the existing code style
- Write clear and concise commit messages
- Follow the conventional commit format: `type(scope): message`
- Types include: feat, fix, docs, style, refactor, test, chore

## 🔄 Pull Request Process

1. **Update Documentation:**
   - Update the README.md if needed
   - Add comments to your code
   - Update API documentation if applicable

2. **Test Your Changes:**
   - Ensure all tests pass
   - Add new tests for new features
   - Verify your changes work as expected

3. **Create a Pull Request:**
   - Use the PR template provided
   - Link to any related issues
   - Provide a clear description of your changes

4. **Code Review:**
   - Address reviewer comments
   - Make requested changes
   - Respond to feedback constructively

### ✅ Pull Request Template

When submitting a Pull Request, please follow this template:

```markdown
## Summary
<!--- Provide a general summary of your changes -->

## Description
<!--- Describe your changes in detail -->

## Motivation and Context
<!--- Why is this change required? What problem does it solve? -->
<!--- If it fixes an open issue, please link to the issue here. -->

## How has this been tested?
<!--- Please describe in detail how you tested your changes. -->
<!--- Include details of your testing environment, tests ran, etc. -->

## Screenshots (if appropriate):

## Types of changes
<!--- What types of changes does your code introduce? -->
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Checklist
<!--- Ensure the following points are checked -->
- [ ] My code follows the project's code style.
- [ ] I have updated the documentation as needed.
- [ ] I have added tests to cover my changes.
- [ ] All new and existing tests passed.
- [ ] My changes generate no new warnings.
```

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Follow the golden rule: treat others as you would like to be treated

## 🔍 Code Review Guidelines

When reviewing code, please:

1. Be respectful and constructive
2. Focus on the code, not the person
3. Explain your reasoning
4. Suggest improvements, not just point out issues
5. Approve PRs that meet the requirements

## 💡 Need Help?

If you have any questions, feel free to:
- Open an issue on GitHub
- Join our [Discord community](https://discord.gg/W364NEY6)
- Reach out via [support@devb.io](mailto:support@devb.io)

Happy contributing! 🎉
