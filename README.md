# NiceKom Oils

Modern e-commerce app for selling industrial machine oils and greases. Built with Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, Auth.js (NextAuth), Cloudinary, and Nodemailer.

## Project URL

Production deployment:

`https://nice-kom.vercel.app`

## Access to the Application

### User Access

A standard user account can be created from the public registration page:

`https://nice-kom.vercel.app/signup`

After registration, the user must verify the email address before logging in. The login page is available at:

`https://nice-kom.vercel.app/login`

### Admin Access

The project does not store hardcoded public admin credentials in the repository.

Admin access is role-based. To create an administrator account:

1. Register a normal user account from the application.
2. Verify the email address.
3. Update the user role in the database to `ADMIN`.

Example SQL:

```sql
update "User"
set role = 'ADMIN'
where email = 'admin@nicekom.com';
```

After the role is updated, the administrator can access the admin panel from:

`https://nice-kom.vercel.app/admin`

## Core Functionality

- Email/password authentication with email verification
- Role-based access control for `USER` and `ADMIN`
- Product catalog with filtering and product variants
- Cart and checkout flow
- Order creation and order status tracking
- Admin panel for product and order management
- Cloudinary image upload and storage
- Email notifications for verification, password reset, and order status changes

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env.local
```

3. Configure the environment variables in `.env.local`.

4. Run the database migrations:

```bash
npx prisma migrate dev --name init
```

5. Start the development server:

```bash
npm run dev
```

6. Open:

`http://localhost:3000`

## Required Environment Variables

### Database

- `DATABASE_URL`
- `DIRECT_URL`

### Authentication

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Email / SMTP

- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### Cloudinary

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## External Services Used

- `Cloudinary` for product image storage and delivery
- `Nodemailer` with SMTP transport for email sending
- `PostgreSQL` / `Neon` for the database layer
- `Vercel` for deployment

## Notes

- A newly registered account has role `USER` by default.
- Email verification is required before login.
- Administrator access is protected by the `ADMIN` role in the database.
