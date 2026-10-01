# Library Management System (LMS)

A full-stack Library Management System built with React (IBM Carbon Design System) frontend and Cloudflare Workers (TypeScript) serverless backend with Cloudflare D1 Database.

## Features

### Admin/Staff Panel
- **Dashboard**: View key statistics (total books, issued books, overdue books, members, fines)
- **Books Management**: CRUD operations with ISBN lookup support
- **Members Management**: Manage library members
- **Operations**: 
  - Issue and return books
  - View overdue books
  - Collect fines
- **User Management** (Admin only): Manage system users and permissions

### Student/Faculty Panel
- **Book Catalog**: Search and browse available books
- **My Account**: View member information, borrowed books, and outstanding fines

## Technology Stack

### Frontend
- React 18 with TypeScript
- Carbon Design System (IBM)
- Vite (build tool)
- React Router for navigation
- Axios for API calls

### Backend
- Cloudflare Workers (Serverless)
- TypeScript
- D1 Database (SQLite-based)
- JWT authentication

## Project Structure

```
LMS/
├── backend/
│   ├── src/
│   │   ├── handlers/       # API route handlers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── utils/          # Utility functions
│   │   ├── index.ts        # Main entry point
│   │   └── types.ts        # TypeScript types
│   ├── migrations/         # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml       # Cloudflare configuration
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API service
    │   ├── context/        # React context (auth, theme)
    │   ├── types/          # TypeScript types
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Cloudflare account (for backend deployment)
- Wrangler CLI (`npm install -g wrangler`)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create local D1 database or set up Cloudflare D1:
```bash
wrangler d1 create lms-db
```

4. Update `wrangler.toml` with your database ID

5. Run migrations:
```bash
npm run db:migrate:local  # For local development
npm run db:migrate        # For production
```

6. Start development server:
```bash
npm run dev
```

The backend will run on `http://localhost:8787`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Default Credentials

- **Username**: `admin`
- **Password**: `change-me-strong-password`

> **Note**: Change the default administrator password immediately after first login.

## Deployment

Detailed instructions for deploying both backend and frontend can be found in [DEPLOYMENT.md](DEPLOYMENT.md).

### Backend (Cloudflare Workers)
```bash
cd backend
npm run deploy
```

### Frontend (Vercel / Cloudflare Pages)
```bash
cd frontend
npm run build
```

Then deploy the `dist` folder to Vercel, Cloudflare Pages, or any static hosting service.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Books
- `GET /api/books` - List books
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book (staff/admin)
- `PUT /api/books/:id` - Update book (staff/admin)
- `DELETE /api/books/:id` - Delete book (staff/admin)

### Members
- `GET /api/members` - List members
- `GET /api/members/:id` - Get member details
- `POST /api/members` - Create member (staff/admin)
- `PUT /api/members/:id` - Update member (staff/admin)
- `DELETE /api/members/:id` - Delete member (staff/admin)

### Transactions
- `POST /api/transactions/issue` - Issue book (staff/admin)
- `POST /api/transactions/:id/return` - Return book (staff/admin)
- `GET /api/transactions` - List transactions (staff/admin)
- `GET /api/transactions/overdue` - List overdue books (staff/admin)

### Fines
- `GET /api/fines` - List fines (staff/admin)
- `POST /api/fines/:id/collect` - Collect fine (staff/admin)

### Users
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Reports
- `GET /api/reports` - Get dashboard statistics

## Database Schema

- **users**: System users with authentication
- **members**: Library members who can borrow books
- **books**: Book catalog
- **transactions**: Book issue/return records
- **fines**: Late return fines
- **settings**: System configuration (borrowing periods, fine rates)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policies and best practices.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
