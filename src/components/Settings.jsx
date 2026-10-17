import { useState, useRef } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import {
  RotateCcw,
  Download,
  Upload,
  Info,
  Shield,
  Database,
  CheckCircle2,
  AlertTriangle,
  GitBranch,
  Heart,
} from 'lucide-react';
import './Settings.css';

export default function Settings({ stats, onResetData, onExportData, onImportData }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // null | 'success' | 'error'
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleReset = () => {
    if (showResetConfirm) {
      onResetData?.();
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      // Auto-hide after 4 seconds
      setTimeout(() => setShowResetConfirm(false), 4000);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await onImportData?.(file);
      setImportStatus('success');
      setImportMessage(`Successfully imported ${count} questions!`);
    } catch (err) {
      setImportStatus('error');
      setImportMessage(err.message || 'Failed to import data');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Auto-hide status after 4 seconds
    setTimeout(() => {
      setImportStatus(null);
      setImportMessage('');
    }, 4000);
  };

  return (
    <section aria-label="Settings" className="settings-stage">
      {/* Top right hand */}
      <img
        src="/top-right-hand.png"
        alt="Top right hand"
        className="settings-hand settings-hand-top"
      />

      {/* Bottom left hand */}
      <img
        src="/bottom-left-hand.png"
        alt="Bottom left hand"
        className="settings-hand settings-hand-bottom"
      />

      {/* Settings Content */}
      <GlassCard className="settings-card">
        <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto scrollbar-hide">
          {/* Title */}
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Settings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Manage your data & preferences</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <span className="text-lg font-black text-white">{stats?.total || 0}</span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Total</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-lg font-black text-emerald-400">{stats?.completed || 0}</span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Done</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <span className="text-lg font-black text-blue-400">{stats?.completionRate || 0}%</span>
              <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Rate</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Data Management Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-widest">
              <Database className="w-3.5 h-3.5" />
              Data Management
            </div>

            {/* Export */}
            <button
              type="button"
              onClick={() => onExportData?.()}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <span className="block">Export Data</span>
                <span className="text-[10px] text-zinc-500 font-medium">Download your questions as JSON backup</span>
              </div>
            </button>

            {/* Import */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Upload className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1">
                <span className="block">Import Data</span>
                <span className="text-[10px] text-zinc-500 font-medium">Restore from a JSON backup file</span>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />

            {/* Import Status */}
            {importStatus && (
              <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-medium ${
                importStatus === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}>
                {importStatus === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                {importMessage}
              </div>
            )}

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer text-left ${
                showResetConfirm
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                showResetConfirm
                  ? 'bg-rose-500/30 border border-rose-400/40'
                  : 'bg-rose-500/15 border border-rose-400/25'
              }`}>
                <RotateCcw className={`w-4 h-4 ${showResetConfirm ? 'text-rose-300' : 'text-rose-400'}`} />
              </div>
              <div className="flex-1">
                <span className="block">
                  {showResetConfirm ? 'Click again to confirm reset' : 'Reset All Data'}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {showResetConfirm ? 'This will restore default questions' : 'Clear everything and start fresh'}
                </span>
              </div>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10" />

          {/* Privacy Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-zinc-500">
            <Shield className="w-3 h-3 text-zinc-500" />
            <span>All data is stored locally in your browser. Nothing is sent to any server.</span>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
