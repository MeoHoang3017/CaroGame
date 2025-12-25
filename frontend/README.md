# Caro Game Frontend

A modern frontend for the Caro Game built with Next.js, TypeScript, Zustand, TanStack Query, Framer Motion, and Socket.io.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Zustand** - State management
- **TanStack Query** - Data fetching and caching
- **Framer Motion** - Animations
- **Socket.io Client** - Real-time communication
- **Tailwind CSS** - Styling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # React components
│   └── providers/    # Context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility libraries
├── stores/           # Zustand stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

## Features

- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Zustand stores for game and auth state
- ✅ TanStack Query for API calls
- ✅ Socket.io client setup
- ✅ Framer Motion ready
- ✅ Tailwind CSS configured

## Next Steps

1. Connect to your backend API
2. Implement game logic components
3. Add authentication flow
4. Create game board UI
5. Implement real-time game updates via Socket.io

