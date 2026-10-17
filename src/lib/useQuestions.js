import { useState, useEffect } from 'react';

const STORAGE_KEY = 'interview_questions_v1';

// Start fresh - no pre-populated data
const INITIAL_QUESTIONS = [];

// Generate real contributions from actual question data only — no fake/mock activity injected
export function generateMockContributions(questions, weeks = 52) {
  const today = new Date();
  const contributions = [];

  // Only count real completed questions by their completedAt date
  const countsByDate = {};
  questions.forEach(q => {
    if (q.completedAt) {
      countsByDate[q.completedAt] = (countsByDate[q.completedAt] || 0) + 1;
    }
  });

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = countsByDate[dateStr] || 0;

    let level = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count <= 4) level = 3;
    else if (count > 4) level = 4;

    contributions.push({ date: dateStr, count, level });
  }

  return contributions;
}

// Calculate current practice streak (consecutive days with activity, counting back from today)
export function calculateStreak(contributions) {
  let streak = 0;
  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Calculate average problems solved per week over the last 4 weeks
export function calculateWeeklyVelocity(contributions) {
  const last28 = contributions.slice(-28);
  const total = last28.reduce((sum, d) => sum + d.count, 0);
  return Math.round(total / 4);
}

// Calculate % change between this month's activity and last month's
export function calculateMonthlyChange(contributions) {
  const thisMonth = contributions.slice(-30);
  const lastMonth = contributions.slice(-60, -30);
  const thisTotal = thisMonth.reduce((sum, d) => sum + d.count, 0);
  const lastTotal = lastMonth.reduce((sum, d) => sum + d.count, 0);
  if (lastTotal === 0 && thisTotal === 0) return 0;
  if (lastTotal === 0) return thisTotal > 0 ? 100 : 0;
  return Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
}

// Get a velocity label based on weekly velocity
export function getVelocityLabel(velocity) {
  if (velocity >= 15) return 'Blazing momentum';
  if (velocity >= 10) return 'High momentum';
  if (velocity >= 5) return 'Steady progress';
  if (velocity >= 1) return 'Building up';
  return 'Getting started';
}

export function useQuestions() {
  const [questions, setQuestions] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load questions from localStorage:', e);
    }
    return INITIAL_QUESTIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to persist questions to localStorage:', e);
    }
  }, [questions]);

  const addQuestion = (newQ) => {
    const question = {
      id: `q-${Date.now()}`,
      title: newQ.title.trim(),
      category: newQ.category || 'DSA',
      difficulty: newQ.difficulty || 'Easy',
      status: newQ.status || 'Pending',
      tags: Array.isArray(newQ.tags)
        ? newQ.tags
        : (newQ.tags || '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean),
      notes: newQ.notes || '',
      solutionUrl: newQ.solutionUrl || '',
      createdAt: new Date().toISOString().slice(0, 10),
      completedAt: newQ.status === 'Completed' ? new Date().toISOString().slice(0, 10) : null,
    };
    setQuestions(prev => [question, ...prev]);
    return question;
  };

  const updateQuestion = (id, updates) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === id) {
          const updated = { ...q };
          
          // Handle title
          if (updates.title !== undefined) {
            updated.title = updates.title.trim();
          }
          
          // Handle category, difficulty, etc.
          if (updates.category !== undefined) updated.category = updates.category;
          if (updates.difficulty !== undefined) updated.difficulty = updates.difficulty;
          if (updates.notes !== undefined) updated.notes = updates.notes;
          if (updates.solutionUrl !== undefined) updated.solutionUrl = updates.solutionUrl;
          
          // Handle tags conversion
          if (updates.tags !== undefined) {
            updated.tags = Array.isArray(updates.tags)
              ? updates.tags
              : (updates.tags || '')
                  .split(',')
                  .map(t => t.trim())
                  .filter(Boolean);
          }
          
          // Handle status and completedAt
          if (updates.status !== undefined) {
            updated.status = updates.status;
            if (updates.status === 'Completed' && !q.completedAt) {
              updated.completedAt = new Date().toISOString().slice(0, 10);
            } else if (updates.status !== 'Completed') {
              updated.completedAt = null;
            }
          }
          
          return updated;
        }
        return q;
      })
    );
  };

  const deleteQuestion = (id) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const toggleStatus = (id) => {
    setQuestions(prev =>
      prev.map(q => {
        if (q.id === id) {
          let nextStatus = 'In Progress';
          if (q.status === 'Pending') nextStatus = 'In Progress';
          else if (q.status === 'In Progress') nextStatus = 'Completed';
          else if (q.status === 'Completed') nextStatus = 'Pending';

          return {
            ...q,
            status: nextStatus,
            completedAt: nextStatus === 'Completed' ? new Date().toISOString().slice(0, 10) : null,
          };
        }
        return q;
      })
    );
  };

  const resetAllData = () => {
    setQuestions(INITIAL_QUESTIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear localStorage:', e);
    }
  };

  const exportData = () => {
    const data = JSON.stringify(questions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apki-practice-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported) && imported.length > 0) {
            setQuestions(imported);
            resolve(imported.length);
          } else {
            reject(new Error('Invalid data format'));
          }
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const stats = {
    total: questions.length,
    completed: questions.filter(q => q.status === 'Completed').length,
    inProgress: questions.filter(q => q.status === 'In Progress').length,
    pending: questions.filter(q => q.status === 'Pending').length,
    dsaTotal: questions.filter(q => q.category === 'DSA').length,
    dsaCompleted: questions.filter(q => q.category === 'DSA' && q.status === 'Completed').length,
    gitTotal: questions.filter(q => q.category === 'Git').length,
    gitCompleted: questions.filter(q => q.category === 'Git' && q.status === 'Completed').length,
    technicalTotal: questions.filter(q => q.category === 'Technical').length,
    technicalCompleted: questions.filter(q => q.category === 'Technical' && q.status === 'Completed').length,
    completionRate: questions.length > 0
      ? Math.round((questions.filter(q => q.status === 'Completed').length / questions.length) * 100)
      : 0,
  };

  return {
    questions,
    stats,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleStatus,
    resetAllData,
    exportData,
    importData,
  };
}
