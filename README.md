# Hifz Companion

A production-grade Quran memorization application for Huffaz.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start development servers
npm run dev
```

## Project Structure

```
hifz-companion/
├── frontend/          # Next.js application
├── backend/           # Node.js API server
├── database/          # Migrations and seeds
├── docs/              # Documentation
├── shared/            # Shared types and utilities
├── PRD.md             # Product requirements
└── package.json       # Root workspace config
```

## Documentation

- [Product Requirements (PRD.md)](./PRD.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)

## License

MIT
