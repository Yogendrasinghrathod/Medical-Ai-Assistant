# Medical AI Assistant

A voice-enabled AI medical consultation platform that connects users with specialized AI medical agents for personalized healthcare consultations.

## Features

- 🎤 **Voice Consultations**: Real-time voice interactions with AI medical agents
- 👨‍⚕️ **Specialized Doctors**: Multiple AI agents specialized in different medical fields
- 📊 **Session Management**: Track and manage your consultation history
- 📝 **Medical Reports**: Automated report generation after consultations
- 💳 **Credit System**: Manage consultation credits
- 🔐 **Secure Authentication**: User authentication via Clerk

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **Voice AI**: Vapi.ai
- **AI**: OpenAI, Google GenAI

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account for authentication
- Vapi.ai account for voice AI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Yogendrasinghrathod/Medical-Ai-Assistant.git
cd Medical-Ai-Assistant
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
DATABASE_URL=your_database_url
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_key
OPENAI_API_KEY=your_openai_key
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (routes)/
│   │   ├── dashboard/        # Dashboard and consultation pages
│   │   └── profile/          # User profile page
│   ├── api/                  # API routes
│   └── _component/           # Shared components
├── components/               # UI components
├── context/                  # React contexts
├── src/                      # Database and schema
└── shared/                   # Shared utilities and data
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations

## License

This project is private and proprietary.

## Author

Yogendrasinghrathod
