# NiceKom Oils

Уеб приложение за електронна търговия със смазочни масла и греси за машини и автомобили. Проектът е разработен с `Next.js`, `TypeScript`, `Tailwind CSS`, `shadcn/ui`, `Prisma`, `PostgreSQL`, `Auth.js (NextAuth)`, `Cloudinary` и `Nodemailer`.

## URL адрес на проекта

Работещата версия на приложението е достъпна на:

`https://nice-kom.vercel.app`

## Достъп до приложението

### Потребителски акаунт

- Имейл: `demo.user@nicekom.com`
- Парола: `NiceKomUser2026!`

Вход в системата:

`https://nice-kom.vercel.app/login`

Страница за регистрация:

`https://nice-kom.vercel.app/signup`

### Администраторски акаунт

- Имейл: `g.genchev39@gmail.com`
- Парола: `6649Georgi`

Административен панел:

`https://nice-kom.vercel.app/admin`

## Основни функционалности

- Регистрация и вход с имейл и парола
- Потвърждение на имейл при създаване на акаунт
- Разделение на роли `USER` и `ADMIN`
- Продуктов каталог с филтриране и варианти на продуктите
- Количка и създаване на поръчка
- Преглед на поръчки от потребителския профил
- Административен панел за управление на продукти и поръчки
- Качване и съхранение на изображения чрез `Cloudinary`
- Изпращане на системни имейли чрез `Nodemailer` и SMTP

## Локално стартиране

1. Инсталиране на зависимостите:

```bash
npm install
```

2. Копиране на примерния env файл:

```bash
cp .env.example .env.local
```

3. Попълване на необходимите променливи в `.env.local`.

4. Изпълнение на миграциите:

```bash
npx prisma migrate dev --name init
```

5. Стартиране на development сървъра:

```bash
npm run dev
```

6. Отваряне на:

`http://localhost:3000`

## Необходими environment променливи

### База данни

- `DATABASE_URL`
- `DIRECT_URL`

### Автентикация

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Имейл / SMTP

- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### Cloudinary

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`

## Използвани външни услуги

- `Cloudinary` за съхранение и зареждане на продуктови изображения
- `Nodemailer` със SMTP транспорт за изпращане на имейли
- `PostgreSQL` / `Neon` за базата данни
- `Vercel` за deployment на приложението

## Бележки

- Новорегистрираният акаунт по подразбиране е с роля `USER`.
- Достъпът до административния панел е ограничен само за акаунти с роля `ADMIN`.
- Приложението изисква коректно конфигурирани база данни, SMTP и `Cloudinary`, за да работят всички функционалности.
