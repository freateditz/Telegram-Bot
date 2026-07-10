# Project Info

## Project Name
Telegram Download Bot

## Main Motive
This project is a Telegram-based resource delivery system for downloading software-related files and viewing tutorial messages from a private Telegram channel.

The main goal is to keep all resource data in a central backend so the Telegram bot and any future dashboard can work through REST APIs instead of reading files directly. The system is designed to scale to many platforms, categories, and resources without changing bot code.

## What The Project Does
- Verifies Telegram users before they can access download resources.
- Shows inline keyboard menus for navigation.
- Loads platforms, categories, and resources from the backend database.
- Sends download links and fix links for each resource.
- Copies tutorial messages from a private Telegram channel.
- Supports back navigation through callback buttons.
- Exposes REST APIs for the bot and future dashboard.

## Current Stack
- Node.js
- Express.js
- Prisma ORM
- SQLite
- node-telegram-bot-api
- Telegram polling mode
- Railway deployment

## Current Architecture
The active implementation is split into two main parts:

### Backend
Path: `backend/`

The backend is the source of truth for business data.
It uses MVC-style structure and Prisma for persistence.

Important folders:
- `backend/src/controllers/` for request handlers
- `backend/src/routes/` for Express route definitions
- `backend/src/services/` for business logic
- `backend/src/database/` for Prisma client, seed data, and legacy user migration support
- `backend/src/config/` for environment and resource seed configuration
- `backend/src/utils/` for reusable helpers and error handling

The backend exposes JSON REST APIs for:
- Platforms
- Categories
- Resources
- Settings
- Users
- Telegram verification support
- Bot menu lookup endpoints

### Bot
Path: `bot/`

The Telegram bot is a thin client layer.
It does not read JSON or database files directly.
It calls the backend through REST APIs for all dynamic data.

Important folders:
- `bot/commands/` for slash command entry points
- `bot/handlers/` for callback and message handling
- `bot/keyboards/` for inline keyboard builders
- `bot/services/` for HTTP access and Telegram message actions
- `bot/utils/` is currently not used as a major business layer

### Shared
Path: `shared/`

Shared constants are stored here so the bot and backend can reuse API route definitions and callback metadata.

### Dashboard
Path: `dashboard/`

This folder is reserved for a future dashboard and is currently empty.

## Data Model
The backend uses Prisma with SQLite and currently supports these models:
- Platform
- Category
- Resource
- Setting
- User

### Model Purpose
- Platform: Represents a device/OS grouping such as Windows or macOS.
- Category: Represents a resource group such as Software, Plugins, Presets, Fonts, or Sound Effects.
- Resource: Represents a downloadable item with links and tutorial references.
- Setting: Stores app-level configuration values.
- User: Stores Telegram user verification state.

## REST API Workflow
The REST API is the center of the system.

### CRUD APIs
The backend exposes CRUD APIs for:
- `/api/platforms`
- `/api/categories`
- `/api/resources`
- `/api/settings`
- `/api/users`

### Bot-Facing APIs
The bot uses these custom endpoints:
- `GET /api/menu/:platform/:category`
- `GET /api/resource/:platform/:slug`

These endpoints let the bot build menus dynamically and fetch a single resource record including:
- `downloadLink`
- `fixLink`
- `tutorialChannelId`
- `tutorialMessageId`

## Telegram Workflow
1. User sends `/start`.
2. The bot asks the backend for verification and menu data.
3. If the user is not verified, the bot shows the verification prompt.
4. The user verifies through Telegram channel membership.
5. The bot marks the user as verified through the backend API.
6. The bot loads platforms dynamically from the backend.
7. The user selects a platform.
8. The bot loads categories dynamically from the backend.
9. The user selects a category.
10. The bot loads resources dynamically from the backend.
11. The user selects a resource.
12. The bot fetches resource details, sends the download/fix links, and copies the tutorial message from the private Telegram channel.
13. Back buttons let the user move through the menu tree without slash commands.

## Current Bot Rules
- `/start` is the only slash command.
- All other navigation happens through inline keyboard callback buttons.
- The bot never reads JSON files or database files directly.
- The bot always uses REST APIs.
- No frontend pages are implemented yet.

## Current Backend Behavior
- Uses Express and async/await.
- Uses Prisma with SQLite.
- Returns JSON responses.
- Uses centralized error handling.
- Keeps controllers thin.
- Keeps business logic in services.
- Supports legacy verified users by seeding them into SQLite.
- Seeds current resource data into the database.

## Current Repository State
The active, production-facing code is centered around:
- `index.js` as the main bootstrap entry
- `backend/src/server.js` for the Express API server
- `bot/bot.js` for the Telegram client

There are also some older top-level folders in the repository, but the active implementation is the split backend/bot architecture.

## Intended Scalability
The system is designed so that:
- New platforms can be added by creating database records.
- New categories can be added by creating database records.
- New resources can be added by creating database records.
- The bot UI updates automatically from API data.
- No bot code changes are needed for normal content expansion.

## Deployment Notes
The project is kept compatible with Railway by using environment variables and a polling-based Telegram bot setup.
The backend and bot both depend on runtime environment configuration such as:
- `BOT_TOKEN`
- `CHANNEL`
- `YOUTUBE`
- `DATABASE_URL`
- `BACKEND_PORT`
- `BACKEND_BASE_URL`

## Maintenance Notes
- Prisma schema lives in `backend/prisma/schema.prisma`.
- SQLite migration files live in `backend/prisma/migrations/`.
- Database seeding is handled from the backend side.
- The bot should stay API-only and should not regain direct file access.
