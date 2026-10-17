import * as React from "react";
import { Plus, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDate,
  getDaysInMonth,
  startOfMonth,
  getDay,
  startOfWeek,
  addDays,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mon-first day labels
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// Returns 0=Mon … 6=Sun (Mon-first)
function monFirstIndex(date) {
  return (getDay(date) + 6) % 7;
}

export const GlassCalendar = React.forwardRef(
  ({ className, selectedDate: propSelectedDate, onDateSelect, questions = [], ...props }, ref) => {
    const today = React.useMemo(() => new Date(), []);

    const [currentMonth, setCurrentMonth] = React.useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || today);
    const [viewMode, setViewMode] = React.useState('monthly');
    const [noteModalOpen, setNoteModalOpen] = React.useState(false);
    const [scheduleModalOpen, setScheduleModalOpen] = React.useState(false);
    const [practiceNote, setPracticeNote] = React.useState('');
    const [savedNotes, setSavedNotes] = React.useState({});
    const [scheduleTitle, setScheduleTitle] = React.useState('');
    const [scheduledSessions, setScheduledSessions] = React.useState([]);

    React.useEffect(() => {
      if (propSelectedDate) setSelectedDate(propSelectedDate);
    }, [propSelectedDate]);

    // ── Month grid ───────────────────────────────────────────────────────────
    // Returns array of {date, isEmpty} — Mon-first, padded to full 7-col rows
    const monthGrid = React.useMemo(() => {
      const firstDay = startOfMonth(currentMonth);
      const totalDays = getDaysInMonth(currentMonth);
      const offset = monFirstIndex(firstDay); // blank cells before day 1
      const cells = [];

      // leading blanks
      for (let i = 0; i < offset; i++) cells.push({ date: null, isEmpty: true });

      // actual days
      for (let d = 0; d < totalDays; d++) {
        cells.push({
          date: new Date(firstDay.getFullYear(), firstDay.getMonth(), d + 1),
          isEmpty: false,
        });
      }

      // trailing blanks to complete last row
      const remainder = cells.length % 7;
      if (remainder !== 0) {
        for (let i = 0; i < 7 - remainder; i++) cells.push({ date: null, isEmpty: true });
      }

      return cells;
    }, [currentMonth]);

    // ── Week strip (7 days centred on selectedDate) ──────────────────────────
    const weekStrip = React.useMemo(() => {
      // Start from Monday of the week containing selectedDate
      const monday = startOfWeek(selectedDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
    }, [selectedDate]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const hasPracticeOnDate = (dateStr) =>
      questions.some((q) => q.completedAt === dateStr);

    const handleDateClick = (date) => {
      if (!date) return;
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const handleSaveNote = (e) => {
      e.preventDefault();
      if (!practiceNote.trim()) return;
      const key = format(selectedDate, 'yyyy-MM-dd');
      setSavedNotes((prev) => ({ ...prev, [key]: practiceNote.trim() }));
      setPracticeNote('');
      setNoteModalOpen(false);
    };

    const handleScheduleSession = (e) => {
      e.preventDefault();
      if (!scheduleTitle.trim()) return;
      setScheduledSessions((prev) => [
        ...prev,
        { id: Date.now(), title: scheduleTitle.trim(), date: format(selectedDate, 'yyyy-MM-dd') },
      ]);
      setScheduleTitle('');
      setScheduleModalOpen(false);
    };

    const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
    const currentNote = savedNotes[selectedDateKey];
    const sessionsForDay = scheduledSessions.filter((s) => s.date === selectedDateKey);

    // ── Day cell renderer ─────────────────────────────────────────────────────
    const DayCell = ({ date, compact = false }) => {
      if (!date) return <div className={compact ? 'h-7 w-7' : 'h-8 w-full'} />;
      const dateKey = format(date, 'yyyy-MM-dd');
      const isSelected = isSameDay(date, selectedDate);
      const isTodayDate = isToday(date);
      const hasPractice = hasPracticeOnDate(dateKey);
      const hasNote = Boolean(savedNotes[dateKey]);
      const hasSession = scheduledSessions.some((s) => s.date === dateKey);

      return (
        <button
          type="button"
          onClick={() => handleDateClick(date)}
          className={cn(
            'relative flex items-center justify-center rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer select-none',
            compact ? 'h-7 w-7' : 'h-8 w-8',
            isSelected
              ? 'bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg scale-105'
              : isTodayDate
              ? 'bg-white/15 text-white ring-1 ring-white/40'
              : 'text-zinc-300 hover:bg-white/15 hover:text-white'
          )}
        >
          {getDate(date)}

          {/* Practice dot — top right */}
          {hasPractice && !isSelected && (
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
          )}
          {/* Note dot */}
          {hasNote && !hasPractice && !isSelected && (
            <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-blue-400" />
          )}
          {/* Session dot — bottom right */}
          {hasSession && !isSelected && (
            <span className="absolute bottom-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-400" />
          )}
        </button>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full rounded-3xl p-5 shadow-2xl overflow-hidden relative',
          'bg-black/20 backdrop-blur-xl border border-white/10',
          'text-white font-sans',
          className
        )}
        {...props}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1 rounded-lg bg-black/20 p-1">
            {['Weekly', 'Monthly'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode.toLowerCase())}
                className={cn(
                  'rounded-md px-3.5 py-1 text-xs font-bold transition-all cursor-pointer',
                  viewMode === mode.toLowerCase()
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/60 hover:text-white'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-zinc-400">
            {format(selectedDate, 'MMM d')} selected
          </span>
        </div>

        {/* ── Month title + nav ── */}
        <div className="flex items-center justify-between mb-3">
          <motion.p
            key={format(currentMonth, 'MMMM yyyy')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="text-2xl font-extrabold tracking-tight"
          >
            {format(currentMonth, 'MMMM')}
            <span className="text-base font-bold text-zinc-400 ml-2">
              {format(currentMonth, 'yyyy')}
            </span>
          </motion.p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              aria-label="Previous month"
              className="p-1.5 rounded-full text-white/70 hover:bg-white/10 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              aria-label="Next month"
              className="p-1.5 rounded-full text-white/70 hover:bg-white/10 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Day-of-week header (always Mon → Sun) ── */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_LABELS.map((lbl) => (
            <div key={lbl} className="flex items-center justify-center">
              <span className="text-[10px] font-extrabold text-zinc-500 uppercase">{lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Calendar body ── */}
        <AnimatePresence mode="wait">
          {viewMode === 'monthly' ? (
            <motion.div
              key={`monthly-${format(currentMonth, 'yyyy-MM')}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-y-1"
            >
              {monthGrid.map((cell, idx) => (
                <div key={idx} className="flex items-center justify-center">
                  <DayCell date={cell.date} />
                </div>
              ))}
            </motion.div>
          ) : (
            /* Weekly strip — 7 days of the current week */
            <motion.div
              key={`weekly-${format(weekStrip[0], 'yyyy-MM-dd')}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-7 gap-y-1"
            >
              {weekStrip.map((date) => (
                <div key={format(date, 'yyyy-MM-dd')} className="flex items-center justify-center">
                  <DayCell date={date} compact />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Selected day info ── */}
        {(currentNote || sessionsForDay.length > 0) && (
          <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
            {currentNote && (
              <p className="text-zinc-200 font-medium leading-relaxed">
                <span className="text-blue-400 font-bold">Note: </span>
                {currentNote}
              </p>
            )}
            {sessionsForDay.map((s) => (
              <p key={s.id} className="text-emerald-300 font-medium">
                <span className="font-bold">⏰ </span>
                {s.title}
              </p>
            ))}
          </div>
        )}

        {/* ── Divider + footer actions ── */}
        <div className="mt-4 h-px bg-white/10" />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setNoteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5 text-blue-400" />
            Practice note
          </button>
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-black/20 px-3 py-1.5 text-xs font-bold text-white border border-white/10 hover:bg-black/30 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            Schedule
          </button>
        </div>

        {/* ── Note modal ── */}
        {noteModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-5 flex flex-col justify-center rounded-3xl">
            <h4 className="text-sm font-bold text-white mb-3">
              Note for {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            <form onSubmit={handleSaveNote} className="flex flex-col gap-3">
              <textarea
                rows={3}
                value={practiceNote}
                onChange={(e) => setPracticeNote(e.target.value)}
                placeholder="e.g. Solved 3 DP problems, practiced recursion tree..."
                className="w-full rounded-xl bg-zinc-900 border border-white/20 p-2.5 text-xs text-white outline-none focus:border-blue-400 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNoteModalOpen(false)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-3.5 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Schedule modal ── */}
        {scheduleModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm p-5 flex flex-col justify-center rounded-3xl">
            <h4 className="text-sm font-bold text-white mb-3">
              Schedule for {format(selectedDate, 'MMM d')}
            </h4>
            <form onSubmit={handleScheduleSession} className="flex flex-col gap-3">
              <input
                type="text"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
                placeholder="e.g. System Design Mock 7 PM"
                className="w-full rounded-xl bg-zinc-900 border border-white/20 p-2 text-xs text-white outline-none focus:border-emerald-400"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-3.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white cursor-pointer">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";

export default GlassCalendar;
