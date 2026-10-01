# Deployment Guide

This guide will help you deploy the Library Management System to production.

## Prerequisites

- Node.js 18+ and npm
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`
- Vercel account (or any static hosting service for frontend)

## Backend Deployment (Cloudflare Workers)

### 1. Setup Cloudflare Account

1. Sign up at [Cloudflare](https://dash.cloudflare.com/sign-up)
2. Navigate to Workers & Pages section
3. Note your Account ID

### 2. Authenticate Wrangler

```bash
wrangler login
```

This will open a browser window to authenticate.

### 3. Create D1 Database

```bash
cd backend
wrangler d1 create lms-db
```

This will output a database ID. Copy it.

### 4. Update wrangler.toml

Edit `backend/wrangler.toml` and replace the database_id:

```toml
[[ d1_databases ]]
binding = "DB"
database_name = "lms-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Replace with actual ID
```

### 5. Run Database Migrations

```bash
wrangler d1 migrations apply lms-db
```

### 6. Set Environment Variables

Set the JWT secret and optional expiry in Cloudflare dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Go to Settings > Environment Variables
4. Add `JWT_SECRET` with a secure random string
5. (Optional) Add `JWT_EXPIRY_HOURS` to customize token expiration (default: 24 hours)

Or use wrangler secrets:

```bash
wrangler secret put JWT_SECRET
# Optionally set token expiry (default is 24 hours)
# wrangler secret put JWT_EXPIRY_HOURS
```

### 7. Deploy Backend

```bash
npm run deploy
```

Your API will be available at `https://lms-backend.YOUR_SUBDOMAIN.workers.dev`

## Frontend Deployment (Vercel)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Configure Environment

Create `frontend/.env.production`:

```
VITE_API_URL=https://lms-backend.YOUR_SUBDOMAIN.workers.dev/api
```

Replace with your actual Cloudflare Workers URL.

### 3. Build Frontend

```bash
cd frontend
npm run build
```

### 4. Deploy to Vercel

```bash
vercel --prod
```

Follow the prompts to deploy.

### Alternative: Deploy to Cloudflare Pages

You can also deploy the frontend to Cloudflare Pages:

1. Go to Cloudflare Dashboard > Workers & Pages
2. Click "Create Application" > "Pages" > "Connect to Git"
3. Select your repository
4. Set build settings:
   - Framework preset: Vite
   - Build command: `cd frontend && npm install && npm run build`
   - Build output directory: `frontend/dist`
   - Environment variables: `VITE_API_URL=https://lms-backend.YOUR_SUBDOMAIN.workers.dev/api`

## Post-Deployment Setup

### 1. Default Admin User

The default admin credentials are:
- **Username**: admin
- **Password**: change-me-strong-password

**Important**: Change this password immediately after first login!

### 2. Update Admin Password

You can update the admin password through the User Management section (Admin only):

1. Login as admin
2. Go to User Management
3. Edit the admin user
4. Enter a new secure password
5. Save

### 3. Create Additional Users

Through the Admin panel, you can:
1. Create members (people who can borrow books)
2. Create staff users (for library operations)
3. Create student/faculty users (linked to members)

## Testing the Deployment

### Backend Health Check

Test if your backend is running:

```bash
curl https://lms-backend.YOUR_SUBDOMAIN.workers.dev/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"change-me-strong-password"}'
```

You should receive a JSON response with a token.

### Frontend Access

1. Open your frontend URL in a browser
2. You should see the login page
3. Login with default credentials
4. Verify all features are working

## Monitoring and Logs

### Cloudflare Workers

View logs and metrics:
```bash
wrangler tail
```

Or check the Cloudflare Dashboard > Workers & Pages > Your Worker > Logs

### Vercel

Check deployment logs in the Vercel dashboard.

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Verify the backend is deployed correctly
2. Check that the frontend is using the correct API URL
3. Ensure CORS headers are set in the backend (already configured)

### Database Connection

If database queries fail:
1. Verify D1 database is created: `wrangler d1 list`
2. Check migrations are applied: `wrangler d1 migrations list lms-db`
3. Re-run migrations if needed: `wrangler d1 migrations apply lms-db`

### Authentication Issues

If login fails:
1. Check JWT_SECRET is set correctly
2. Verify the database has the admin user (check migrations)
3. Test backend directly with curl

If tokens expire too quickly or slowly:
1. Check JWT_EXPIRY_HOURS environment variable (default: 24 hours)
2. Update the environment variable in Cloudflare dashboard
3. Redeploy the worker for changes to take effect

## Updating the Application

### Backend Updates

```bash
cd backend
# Make your changes
npm run deploy
```

### Frontend Updates

```bash
cd frontend
# Make your changes
npm run build
vercel --prod  # or your hosting platform's deploy command
```

## Backup and Restore

### Database Backup

```bash
wrangler d1 export lms-db --output=backup.sql
```

### Database Restore

```bash
wrangler d1 execute lms-db --file=backup.sql
```

## Security Best Practices

1. **Change Default Password**: Immediately change the default admin password
2. **Use Strong JWT Secret**: Generate a secure random string for JWT_SECRET
3. **Configure Token Expiry**: Set JWT_EXPIRY_HOURS appropriately (default: 24 hours)
   - Shorter expiry (e.g., 1-8 hours) for high-security environments
   - Longer expiry (e.g., 24-72 hours) for convenience in trusted environments
4. **HTTPS Only**: Ensure both frontend and backend use HTTPS
5. **Regular Updates**: Keep dependencies up to date
6. **Monitor Access**: Regularly review user access and permissions
7. **Database Backups**: Perform regular database backups

## Support

For issues or questions:
- Check the main README.md for documentation
- Review Cloudflare Workers documentation
- Review Vercel/hosting platform documentation
