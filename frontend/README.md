# LMS Frontend

Frontend application for the Library Management System built with React and Carbon Design System.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend API URL

4. Start development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Features

### Admin/Staff Features
- Dashboard with statistics
- Books management (CRUD operations)
- Members management (CRUD operations)
- Issue/return books
- View overdue books
- Collect fines
- User management (Admin only)

### Student/Faculty Features
- Browse book catalog
- View account information
- View borrowed books
- View outstanding fines

## Project Structure

- `src/pages/`: Page components
- `src/components/`: Reusable components
- `src/services/`: API service layer
- `src/context/`: React context providers
- `src/types/`: TypeScript type definitions

## Technologies

- React 18
- TypeScript
- Carbon Design System
- React Router
- Axios
- Vite
