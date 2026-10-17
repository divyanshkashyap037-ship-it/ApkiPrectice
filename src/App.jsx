import { useState } from 'react';
import {
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  Settings as SettingsIcon,
} from 'lucide-react';
import GradientASCII from './components/GradientASCII';
import StairTransition from './components/StairTransition';
import Dashboard from './components/Dashboard';
import QuestionTracker from './components/QuestionTracker';
import ProgressAnalytics from './components/ProgressAnalytics';
import Settings from './components/Settings';
import { NotchNav } from '@/components/ui/adaptive-notch-navigation-bar';
import { useQuestions } from '@/lib/useQuestions';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'question-tracker', label: 'Question Tracker', icon: ClipboardList },
  { id: 'progress-analytics', label: 'Progress and Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function App() {
  const [transitionDone, setTransitionDone] = useState(false);
  const [activeId, setActiveId] = useState('dashboard');

  const {
    questions,
    stats,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleStatus,
    resetAllData,
    exportData,
    importData,
  } = useQuestions();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div
        className="fixed inset-0 z-0 bg-black"
        style={{ width: '100%', height: '100%' }}
      >
        <GradientASCII
          colors={['#1e3fd8', '#f6f8ff', '#a5d8ff', '#38bdf8']}
          shape="horizon"
          characters=" .:-=+*#%@"
          cellSize={18}
          density={0.8}
          mouseInteraction={true}
          clickEffect="wave"
          intro={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {transitionDone && (
        <NotchNav
          items={NAV_ITEMS}
          activeId={activeId}
          position="top"
          showLogo={false}
          showRightContent={false}
          onActiveChange={setActiveId}
          className="z-10"
        >
          {activeId === 'dashboard' && (
            <Dashboard
              questions={questions}
              stats={stats}
              onNavigateToTracker={() => setActiveId('question-tracker')}
              onToggleStatus={toggleStatus}
            />
          )}

          {activeId === 'question-tracker' && (
            <QuestionTracker
              questions={questions}
              stats={stats}
              onAddQuestion={addQuestion}
              onUpdateQuestion={updateQuestion}
              onDeleteQuestion={deleteQuestion}
              onToggleStatus={toggleStatus}
            />
          )}

          {activeId === 'progress-analytics' && (
            <ProgressAnalytics
              questions={questions}
              stats={stats}
            />
          )}

          {activeId === 'settings' && (
            <Settings
              stats={stats}
              onResetData={resetAllData}
              onExportData={exportData}
              onImportData={importData}
            />
          )}
        </NotchNav>
      )}

      {!transitionDone && (
        <StairTransition
          numSteps={6}
          onComplete={() => {
            setTransitionDone(true);
            window.dispatchEvent(new Event('resize'));
          }}
        />
      )}
    </div>
  );
}
