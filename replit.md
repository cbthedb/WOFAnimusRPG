# Overview

This is a text-based role-playing game inspired by the Wings of Fire book series, where players control an animus dragon (a dragon with magical powers) attending Jade Mountain Academy. The core gameplay revolves around making choices that affect the character's soul integrity - using animus magic corrupts the dragon's soul, creating a compelling risk-reward mechanic. Players must balance using their powerful magical abilities with preserving their humanity and moral compass.

The application is built as a full-stack web game with a React frontend and Express backend, featuring character generation, scenario-based storytelling, and persistent game state management.

# User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes
- **Character Customization System** (January 2025): Added comprehensive character creator allowing players to choose tribe, powers, attributes, and animus status, plus randomization options.

## Future Changes Requested  
- **Database Migration** (planned for ~1 month): Convert from PostgreSQL database saves to local browser storage to remove Replit Core dependency. This will eliminate the save system and make the game run without database requirements.

# System Architecture

## Frontend Architecture
The client is built with **React 18** using **TypeScript** and **Vite** as the build tool. The UI leverages **shadcn/ui** components built on **Radix UI** primitives, styled with **TailwindCSS** for a modern, accessible interface. State management is handled through **TanStack Query** for server state and React hooks for local state.

The routing system uses **Wouter** for lightweight client-side navigation. The application follows a component-based architecture with clear separation between game logic (housed in utility classes) and presentation components.

## Backend Architecture  
The server runs on **Express.js** with TypeScript, following a simple REST API pattern. The architecture includes:

- **Route handlers** in `/server/routes.ts` for game state CRUD operations
- **Storage abstraction layer** with an in-memory implementation (`MemStorage`) for development
- **Middleware** for request logging and error handling
- **Schema validation** using Zod for type-safe data handling

The backend is designed to be database-agnostic through the `IStorage` interface, making it easy to swap storage implementations.

## Game Engine Design
The core game logic is centralized in a `GameEngine` class that processes player choices and updates game state. Key design decisions include:

- **Immutable state updates** - all game state changes return new objects
- **Scenario-based progression** - the game generates contextual scenarios based on character state and history
- **Soul corruption system** - the central mechanic where magic use gradually corrupts the character
- **Deterministic randomness** - random elements are controlled to ensure fair gameplay

## Data Storage Solutions
Currently uses an in-memory storage system for development, with schema definitions prepared for PostgreSQL through **Drizzle ORM**. The data model includes:

- **Users table** for basic authentication (prepared but not implemented)
- **Game states table** storing character data, game progression, and history as JSONB
- **Type-safe schemas** generated from database definitions using `drizzle-zod`

## Development Environment
The project is configured for **Replit** deployment with:
- **Hot module replacement** in development
- **ESBuild** for production bundling  
- **Integrated development tools** including error overlays and debugging support
- **Path aliases** for clean imports (`@/` for client, `@shared/` for shared code)

# External Dependencies

## Database Integration
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **@neondatabase/serverless** for cloud database connectivity
- **connect-pg-simple** for session management (prepared for future authentication)

## UI and Styling
- **Radix UI** component library for accessible, unstyled primitives
- **TailwindCSS** for utility-first styling with custom design system
- **Lucide React** for consistent iconography
- **class-variance-authority** for component variant management

## State Management and Data Fetching
- **TanStack React Query** for server state management, caching, and synchronization
- **React Hook Form** with **Hookform Resolvers** for form validation
- **Zod** for runtime type validation and schema generation

## Development and Build Tools
- **Vite** for fast development server and optimized production builds
- **TypeScript** for type safety across the entire application
- **ESBuild** for fast JavaScript bundling in production
- **Replit-specific plugins** for enhanced development experience on the platform

## Utility Libraries
- **date-fns** for date manipulation and formatting
- **clsx** and **tailwind-merge** for conditional CSS class handling
- **nanoid** for generating unique identifiers
- **cmdk** for command palette functionality