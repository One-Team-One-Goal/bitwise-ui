# Bitwise UI

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Modern frontend application for the Bitwise learning platform, built with React 19, TypeScript, and Vite.

## Overview

Bitwise UI is a high-performance, type-safe web application that provides an interactive learning experience for computer science education. The application features a modern design system, responsive layouts, and advanced state management to deliver seamless educational content, assessments, and progress tracking.

## Core Features

- **Interactive Learning Interface** - Engaging lessons with syntax highlighting and code examples
- **Adaptive Assessment System** - Dynamic quizzes and evaluations with instant feedback
- **Progress Tracking Dashboard** - Visual analytics and progress monitoring with charts
- **Binary/Decimal Calculator** - Interactive tools for number system conversions
- **Circuit Simulator** - Visual circuit design and simulation tools
- **AI-Powered Assistance** - Integrated AI chatbot for learning support
- **Bookmark Management** - Save and organize favorite lessons and topics
- **Responsive Design** - Mobile-first approach with seamless cross-device experience
- **Dark Mode Support** - Theme switching with next-themes
- **Authentication** - Secure user authentication with Supabase

## Technology Stack

### Core Framework
- **React 19** - Latest version with concurrent features
- **TypeScript 5.8** - Strongly typed development
- **Vite 6** - Next-generation frontend build tool

### Routing & State Management
- **TanStack Router** - Type-safe routing with file-based routing
- **TanStack Query** - Powerful asynchronous state management
- **Zustand** - Lightweight state management solution

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Shadcn/UI** - Re-usable component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon set
- **Motion (Framer Motion)** - Animation library
- **Material-UI** - Additional UI components

### Forms & Validation
- **React Hook Form** - Performant form handling
- **Zod** - TypeScript-first schema validation
- **Formik** - Form management utilities

### Visualization & Animation
- **Recharts** - Composable charting library
- **Lottie React** - After Effects animations
- **React Confetti** - Celebration animations
- **Canvas Confetti** - Canvas-based confetti effects
- **COBE** - WebGL globe visualization

### Additional Tools
- **Axios** - HTTP client for API calls
- **Supabase** - Backend-as-a-Service for authentication and database
- **MathLive** - Math equation editor
- **Intro.js** - User onboarding and tutorials
- **React Syntax Highlighter** - Code syntax highlighting

### Development Tools
- **ESLint** - Code linting with TypeScript support
- **Prettier** - Code formatting
- **Kubb** - OpenAPI code generation
- **dotenv** - Environment variable management

## Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bitwise-ui
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL="http://localhost:3000"

# Supabase Configuration
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Feature Flags (optional)
VITE_ENABLE_DEVTOOLS="true"
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

### 5. Build for Production

```bash
npm run build
```

### 6. Preview Production Build

```bash
npm run preview
```

## Available Scripts

### Development

```bash
npm run dev              # Start development server with hot reload
npm run preview          # Preview production build locally
```

### Production

```bash
npm run build            # Build application for production
npm run build:ci         # Build with clean install for CI/CD
npm run render-build     # Build script for Render deployment
npm run start            # Serve production build on port 3000
```

### Code Quality

```bash
npm run lint             # Lint and auto-fix code issues
```

## Project Structure

```
bitwise-ui/
├── public/
│   ├── _redirects              # Deployment redirects
│   └── site.webmanifest        # PWA manifest
├── src/
│   ├── assets/                 # Static assets
│   │   ├── animations/         # Lottie animations
│   │   ├── audio/             # Audio files
│   │   ├── icons/             # Icon assets
│   │   └── photos/            # Images
│   ├── components/            # React components
│   │   ├── ui/                # Shadcn/UI components
│   │   └── *.tsx              # Feature components
│   ├── constants/             # Application constants
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Library configurations
│   │   └── styles/            # Global styles
│   ├── routes/                # Route components
│   ├── services/              # API services
│   ├── tools/                 # Utility tools
│   │   └── simulator/         # Circuit simulator
│   ├── types/                 # TypeScript definitions
│   ├── utils/                 # Utility functions
│   ├── App.tsx                # Root component
│   ├── main.tsx               # Application entry point
│   └── routeTree.gen.ts       # Generated route tree
├── components.json            # Shadcn/UI config
├── Dockerfile                 # Docker configuration
├── eslint.config.js          # ESLint configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite configuration
```

## Key Directories

- **`components/`** - Reusable UI components and feature-specific components
- **`routes/`** - Page-level components mapped to routes
- **`services/`** - API client services and data fetching logic
- **`hooks/`** - Custom React hooks for shared logic
- **`contexts/`** - React context providers for global state
- **`tools/`** - Interactive tools like calculators and simulators
- **`utils/`** - Helper functions and utilities
- **`types/`** - TypeScript type definitions and interfaces

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_ENABLE_DEVTOOLS` | Enable development tools | No |

## Building for Production

The application is optimized for production deployment with:

- Code splitting and lazy loading
- Minification and compression
- Tree shaking for minimal bundle size
- Asset optimization
- Environment-specific builds

### Docker Deployment

```bash
# Build Docker image
docker build -t bitwise-ui .

# Run container
docker run -p 3000:3000 bitwise-ui
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is private and unlicensed.
