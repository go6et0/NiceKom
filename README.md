# NiceKom Oils

Modern e-commerce app for selling industrial machine oils and greases. Built with Next.js App Router, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL, NextAuth (Auth.js), and Cloudinary.

## Features
- Email/password auth with email verification and roles (USER/ADMIN)
- Responsive product catalog and detailed product pages
- Cart with quantity controls and checkout
- Admin panel with product CRUD, inventory updates, and order list
- Cloudinary multi-image uploads

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Configure environment
```bash
cp .env.example .env.local
```

3) Configure the database
```bash
npx prisma migrate dev --name init
```

4) Start the dev server
```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin Access
- Set a user to ADMIN in the database after registration:
```sql
update "User" set role = 'ADMIN' where email = 'admin@nicekom.com';
```

## Cloudinary
Create an unsigned upload preset in Cloudinary and place the details in `.env.local`:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Email Verification
Configure SMTP settings in `.env.local` to send verification emails:
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`




