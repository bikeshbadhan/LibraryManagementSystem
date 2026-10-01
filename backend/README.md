# LMS Backend

Backend API for the Library Management System built with Cloudflare Workers and D1 Database.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create D1 database:
```bash
wrangler d1 create lms-db
```

3. Update `wrangler.toml` with your database ID from the previous command

4. Run migrations locally:
```bash
npm run db:migrate:local
```

5. Start development server:
```bash
npm run dev
```

## Database Migrations

To create a new migration:
```bash
npm run db:generate -- migration_name
```

To apply migrations:
```bash
npm run db:migrate:local  # Local
npm run db:migrate        # Production
```

## Deployment

Deploy to Cloudflare Workers:
```bash
npm run deploy
```

## Environment Variables

Set in Cloudflare Workers dashboard or `wrangler.toml`:
- `JWT_SECRET`: Secret key for JWT token generation

## API Structure

- `src/handlers/`: API route handlers
- `src/middleware/`: Authentication middleware
- `src/utils/`: Utility functions (auth, ISBN lookup, helpers)
- `src/index.ts`: Main router and entry point
- `src/types.ts`: TypeScript type definitions
