# Zoryn Shop

E-commerce platform for computer hardware built with **Next.js**, **TypeScript**, **Prisma**, and **Tailwind CSS**.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma migrate dev --name init
npx prisma db seed

# Run the app
npm run dev
```

Visit **http://localhost:3000**

## 🏗️ Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL 8 + Prisma ORM
- **Auth**: JWT + Cookies

## 📁 Project Structure

```
src/
├── app/          # Pages & API routes
├── components/   # Reusable UI components
└── lib/          # Core business logic
```

## 📚 For Development

See `README.local.md` for a detailed breakdown of the architecture and how everything works.

## 🛠️ Useful Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Code linting
npx prisma studio # Database explorer
```

## 📄 License

Academic & Portfolio Project
