# ApkiPractice - Interview Preparation Tracker

A modern interview preparation tracking application designed to help you organize your learning journey with visual analytics, progress tracking, and scheduling tools.

## What You Get

**Dashboard** - Real-time overview of your preparation progress with live clock and velocity metrics  
**Question Tracker** - Organize DSA, Technical, and Git questions with full CRUD functionality  
**Analytics** - Detailed insights with contribution heatmaps and weekly velocity tracking  
**Calendar** - Interactive calendar for scheduling practice sessions and adding notes  
**Fresh Start** - All data starts empty so you can track your genuine first-hand progress

## Getting Started

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

## Reset Your Data

The app starts with no pre-populated questions for an authentic tracking experience. If you want to clear all saved data:

**Browser Console Method**  
Open DevTools Console (F12) and run:
```javascript
localStorage.removeItem('interview_questions_v1');
location.reload();
```

**Settings Page**  
Go to Settings and click "Reset All Data"

## Recent Updates

**Digital Clock Widget** - Live time display integrated into dashboard layout  
**Edit Questions** - Click the blue pencil icon to modify existing questions  
**Fixed Calendar** - Proper Monday-first grid alignment with correct date handling  
**Real Analytics** - All statistics now reflect your actual practice data  
**Fresh Data** - Empty initial state for genuine progress tracking  
**Dark Heatmap Cells** - Clear visual distinction between active and inactive days

## Tech Stack

Built with React 19, Vite, Tailwind CSS, date-fns, Framer Motion, and Recharts

## Project Structure

```
src/
├── components/
│   ├── Dashboard.jsx          - Main dashboard with statistics
│   ├── QuestionTracker.jsx    - Question management with edit support
│   ├── ProgressAnalytics.jsx  - Analytics and insights
│   ├── Settings.jsx           - Application settings
│   └── ui/                    - Reusable UI components
│       ├── digital-clock.jsx  - Live clock widget
│       ├── glass-calendar.jsx - Interactive calendar
│       ├── monthly-activity-heatmap.jsx
│       └── advanced-stats.jsx
├── lib/
│   └── useQuestions.js        - Data management and state
└── App.jsx                    - Main application component
```

## How to Use

**Add Questions** - Click "+ Add Question" to create new practice items  
**Edit Questions** - Click the blue pencil icon to modify any question  
**Toggle Status** - Click the status badge to cycle through: Pending, In Progress, Completed  
**Track Progress** - View your streak, velocity, and completion rates on the Dashboard  
**Schedule Practice** - Use the calendar to plan sessions and add practice notes  
**Filter Questions** - Use search, category, status, and difficulty filters in the tracker

## Development Notes

Questions are stored in browser localStorage. Export your data regularly via Settings if you want a backup. The heatmap shows real activity based on completed question dates. Weekly velocity calculates your average problems solved per week over the last 28 days.

---

Built for developers preparing for technical interviews
