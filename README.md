# ShopEase E-commerce Platform

A modern e-commerce application with advanced payment integration and Google services support.

## Project Structure

```
/ShopEase
├── /frontend                # Vite / React app
│   ├── package.json
│   └── src/
├── /backend                # Node.js + Express
│   ├── package.json
│   └── src/
│       ├── routes/
│       ├── controllers/
│       └── models/
├── /database               # Schema files, seeders
└── README.md
```

## Key Features

- UPI QR code payment system
- Screenshot upload for order verification  
- Google Drive and Google Sheets integration
- Automated order and payment tracking

## Tech Stack

**Frontend:**
- React with TypeScript
- Vite for build tooling
- Tailwind CSS + shadcn/ui
- TanStack Query for state management

**Backend:**
- Node.js + Express.js
- PostgreSQL with Drizzle ORM
- Google APIs integration
- JWT authentication

## Development Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend  
```bash
cd backend
npm install
npm run dev
```

### Database
```bash
cd database
npm run db:push
```

## Deployment

The application is configured for Vercel deployment with proper serverless function setup.