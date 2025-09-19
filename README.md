# Chat CRM MVP

A modern React application with a chat interface for customer relationship management.

## Features

- **Home Page**: Welcome page with feature highlights
- **Contact Page**: Interactive chat interface similar to ChatGPT
- **Responsive Design**: Works on desktop and mobile devices
- **React Router**: Navigation between pages
- **Modern UI**: Clean, professional design with smooth animations

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── Layout.js          # Main layout wrapper
│   ├── Layout.css
│   ├── Header.js          # Navigation header
│   ├── Header.css
│   ├── Footer.js          # Footer component
│   └── Footer.css
├── pages/
│   ├── HomePage.js        # Home page component
│   ├── HomePage.css
│   ├── ContactPage.js     # Chat interface page
│   └── ContactPage.css
├── App.js                 # Main app with routing
├── App.css
├── index.js               # Entry point
└── index.css              # Global styles
```

## Features

### Chat Interface
- Real-time message bubbles (user messages in blue, bot messages in gray)
- Auto-scroll to latest messages
- Input field with send button
- Timestamp display
- Simulated bot responses

### Navigation
- React Router for client-side routing
- Header with navigation links
- Consistent layout across all pages

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Technologies Used

- React 18
- React Router DOM
- CSS3 with modern features
- Create React App
- TypeScript support
