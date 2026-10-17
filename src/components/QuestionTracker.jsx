import { useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  Inbox,
  FilterX,
  X,
  Edit3,
} from 'lucide-react';
import './QuestionTracker.css';

export default function QuestionTracker({
  questions = [],
  stats,
  onAddQuestion,
  onToggleStatus,
  onDeleteQuestion,
  onUpdateQuestion,
}) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const [expandedId, setExpandedId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form state for adding/editing question
  const [form, setForm] = useState({
    title: '',
    category: 'DSA',
    difficulty: 'Easy',
    status: 'Pending',
    tags: '',
    notes: '',
    solutionUrl: '',
  });
  const [formError, setFormError] = useState('');

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Search filter
      const matchesSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        (q.tags && q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      // Category filter
      const matchesCategory =
        categoryFilter === 'All' || q.category === categoryFilter;

      // Status filter
      const matchesStatus =
        statusFilter === 'All' || q.status === statusFilter;

      // Difficulty filter
      const matchesDifficulty =
        difficultyFilter === 'All' || q.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesDifficulty;
    });
  }, [questions, search, categoryFilter, statusFilter, difficultyFilter]);

  const resetFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setDifficultyFilter('All');
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setForm({
      title: '',
      category: 'DSA',
      difficulty: 'Easy',
      status: 'Pending',
      tags: '',
      notes: '',
      solutionUrl: '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (question) => {
    setEditingQuestion(question);
    setForm({
      title: question.title,
      category: question.category,
      difficulty: question.difficulty,
      status: question.status,
      tags: Array.isArray(question.tags) ? question.tags.join(', ') : '',
      notes: question.notes || '',
      solutionUrl: question.solutionUrl || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setFormError('Please enter a question title.');
      return;
    }
    setFormError('');

    if (editingQuestion) {
      // Update existing question
      onUpdateQuestion(editingQuestion.id, {
        title: form.title,
        category: form.category,
        difficulty: form.difficulty,
        status: form.status,
        tags: form.tags,
        notes: form.notes,
        solutionUrl: form.solutionUrl,
      });
    } else {
      // Add new question
      onAddQuestion({
        title: form.title,
        category: form.category,
        difficulty: form.difficulty,
        status: form.status,
        tags: form.tags,
        notes: form.notes,
        solutionUrl: form.solutionUrl,
      });
    }

    setForm({
      title: '',
      category: 'DSA',
      difficulty: 'Easy',
      status: 'Pending',
      tags: '',
      notes: '',
      solutionUrl: '',
    });
    setEditingQuestion(null);
    setIsModalOpen(false);
  };

  const isFiltered =
    search || categoryFilter !== 'All' || statusFilter !== 'All' || difficultyFilter !== 'All';

  return (
    <section aria-label="Question Tracker" className="tracker-stage">
      {/* Top Header */}
      <div className="tracker-header">
        <div className="tracker-header-left">
          <h1>Question Tracker</h1>
          <p>Organize, solve, and track your interview preparation.</p>
        </div>
        <button
          type="button"
          className="tracker-add-btn"
          onClick={openAddModal}
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* 3 Metric Cards */}
      <div className="tracker-stats-grid">
        <GlassCard className="tracker-stat-card">
          <span className="tracker-stat-title">Total Questions</span>
          <span className="tracker-stat-value">{stats?.total ?? questions.length}</span>
        </GlassCard>
        <GlassCard className="tracker-stat-card tracker-stat-in-progress">
          <span className="tracker-stat-title">In Progress</span>
          <span className="tracker-stat-value">{stats?.inProgress ?? 0}</span>
        </GlassCard>
        <GlassCard className="tracker-stat-card tracker-stat-completed">
          <span className="tracker-stat-title">Completed</span>
          <span className="tracker-stat-value">{stats?.completed ?? 0}</span>
        </GlassCard>
      </div>

      {/* Search & Filter Card */}
      <GlassCard className="tracker-filter-card">
        <span className="tracker-filter-title">Find a question</span>

        {/* Search input */}
        <div className="tracker-search-wrapper">
          <Search className="tracker-search-icon" />
          <input
            type="text"
            className="tracker-search-input"
            placeholder="Search questions or topic tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category & Status Dropdowns */}
        <div className="tracker-filter-row">
          <select
            className="tracker-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="DSA">DSA</option>
            <option value="Git">Git</option>
            <option value="Technical">Technical</option>
          </select>

          <select
            className="tracker-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Difficulty Chips & Reset */}
        <div className="tracker-filter-footer">
          <div className="tracker-difficulty-chips">
            <span className="text-xs text-zinc-400 mr-1 font-medium">Difficulty:</span>
            {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
              <button
                key={diff}
                type="button"
                className={`tracker-chip ${difficultyFilter === diff ? 'active' : ''}`}
                onClick={() => setDifficultyFilter(diff)}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="tracker-footer-actions">
            <span className="tracker-count-label">
              {filteredQuestions.length} question{filteredQuestions.length === 1 ? '' : 's'} shown
            </span>
            {isFiltered && (
              <button
                type="button"
                className="tracker-reset-btn"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Questions List Card */}
      <GlassCard className="tracker-list-card">
        <div className="tracker-list-header">
          <span className="tracker-list-title">Your Questions</span>
          {filteredQuestions.length > 0 && (
            <span className="tracker-list-badge">
              {filteredQuestions.length} {filteredQuestions.length === 1 ? 'problem' : 'problems'}
            </span>
          )}
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="tracker-empty-state">
            {isFiltered ? (
              <>
                <FilterX className="tracker-empty-icon text-zinc-600" />
                <span className="tracker-empty-title">No matching questions</span>
                <p className="tracker-empty-desc">
                  No questions match your current search or filter combination.
                </p>
                <button
                  type="button"
                  className="tracker-reset-btn mt-2"
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </>
            ) : (
              <>
                <Inbox className="tracker-empty-icon text-zinc-600" />
                <span className="tracker-empty-title">No questions added yet</span>
                <p className="tracker-empty-desc">
                  Your practice list is currently empty. Start building your interview arsenal!
                </p>
                <button
                  type="button"
                  className="tracker-add-btn mt-2"
                  onClick={openAddModal}
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="tracker-questions-scroll-area custom-scrollbar">
            {filteredQuestions.map((q) => {
            const isExpanded = expandedId === q.id;
            let diffClass = 'tracker-diff-easy';
            if (q.difficulty === 'Medium') diffClass = 'tracker-diff-medium';
            else if (q.difficulty === 'Hard') diffClass = 'tracker-diff-hard';

            let statusClass = 'tracker-status-pending';
            if (q.status === 'In Progress') statusClass = 'tracker-status-progress';
            else if (q.status === 'Completed') statusClass = 'tracker-status-completed';

            return (
              <div key={q.id}>
                <div className="tracker-question-row">
                  <div className="tracker-question-left">
                    <div className="tracker-question-title">
                      <span>{q.title}</span>
                    </div>
                    <div className="tracker-tags-group">
                      <span className="tracker-cat-tag">{q.category}</span>
                      <span className={`tracker-diff-tag ${diffClass}`}>
                        {q.difficulty}
                      </span>
                      {q.tags &&
                        q.tags.map((tag) => (
                          <span key={tag} className="tracker-topic-tag">
                            {tag}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="tracker-question-right">
                    {/* One-click status toggle */}
                    <button
                      type="button"
                      className={`tracker-status-btn ${statusClass}`}
                      title="Click to toggle status"
                      onClick={() => onToggleStatus(q.id)}
                    >
                      {q.status}
                    </button>

                    {/* Edit question */}
                    <button
                      type="button"
                      className="tracker-action-icon-btn text-blue-400 hover:text-blue-300"
                      title="Edit question"
                      onClick={() => openEditModal(q)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Expand notes */}
                    <button
                      type="button"
                      className="tracker-action-icon-btn"
                      title={isExpanded ? 'Hide details' : 'View approach & links'}
                      onClick={() => setExpandedId(isExpanded ? null : q.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="tracker-action-icon-btn text-rose-400 hover:text-rose-300"
                      title="Delete question"
                      onClick={() => onDeleteQuestion(q.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded notes / approach & solution URL */}
                {isExpanded && (
                  <div className="tracker-expanded-details">
                    {q.notes && (
                      <p className="tracker-notes-text">
                        <strong className="text-zinc-300">Approach & Notes: </strong>
                        {q.notes}
                      </p>
                    )}
                    {q.solutionUrl && (
                      <a
                        href={q.solutionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tracker-solution-link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Solution / Reference
                      </a>
                    )}
                    {!q.notes && !q.solutionUrl && (
                      <p className="text-xs text-zinc-500 italic">No notes attached.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        )}
      </GlassCard>

      {/* Add/Edit Question Modal */}
      {isModalOpen && (
        <div className="tracker-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="tracker-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tracker-modal-header">
              <h3 className="tracker-modal-title">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                type="button"
                className="tracker-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="tracker-form-group">
                <label className="tracker-form-label">Question Title *</label>
                <input
                  type="text"
                  className="tracker-form-input"
                  placeholder="e.g. Trapping Rain Water, Debounce Function"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="tracker-form-row">
                <div className="tracker-form-group">
                  <label className="tracker-form-label">Category</label>
                  <select
                    className="tracker-form-select"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="DSA">DSA</option>
                    <option value="Git">Git</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div className="tracker-form-group">
                  <label className="tracker-form-label">Difficulty</label>
                  <select
                    className="tracker-form-select"
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="tracker-form-group">
                  <label className="tracker-form-label">Status</label>
                  <select
                    className="tracker-form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="tracker-form-group">
                <label className="tracker-form-label">Topic Tags (comma-separated)</label>
                <input
                  type="text"
                  className="tracker-form-input"
                  placeholder="e.g. Arrays, Two Pointers, DP"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              <div className="tracker-form-group">
                <label className="tracker-form-label">Notes & Solution Strategy</label>
                <textarea
                  rows={3}
                  className="tracker-form-textarea"
                  placeholder="Store your approach, edge cases, time/space complexity..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="tracker-form-group">
                <label className="tracker-form-label">Solution URL / LeetCode / GitHub</label>
                <input
                  type="url"
                  className="tracker-form-input"
                  placeholder="https://leetcode.com/... or https://github.com/..."
                  value={form.solutionUrl}
                  onChange={(e) => setForm({ ...form, solutionUrl: e.target.value })}
                />
              </div>

              <div className="tracker-modal-footer">
                <button
                  type="button"
                  className="tracker-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tracker-btn-submit">
                  {editingQuestion ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
