/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, User } from '../types';
import { X, Calendar, User as UserIcon, Tag, Flame, Plus } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'dateLabel'> & { id?: string }) => Promise<void>;
  initialTask?: Task | null;
  initialStatus?: TaskStatus;
  darkTheme: boolean;
  users: User[];
}

const CATEGORIES: TaskCategory[] = ['Design', 'Development', 'Work', 'Meeting', 'Bug', 'Documentation'];
const OTHER_CATEGORY = 'Other';
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTask, 
  initialStatus = 'todo',
  darkTheme,
  users
}: TaskModalProps) {
  const defaultAssigneeId = users[0]?.id ?? '';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [categoryOption, setCategoryOption] = useState<TaskCategory>('Design');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState(defaultAssigneeId);
  const [dueDate, setDueDate] = useState('2026-05-28');

  // Reset or fill values when initialTask opens
  useEffect(() => {
    if (initialTask) {
      const isKnownCategory = CATEGORIES.includes(initialTask.category);
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setStatus(initialTask.status);
      setCategoryOption(isKnownCategory ? initialTask.category : OTHER_CATEGORY);
      setCustomCategory(isKnownCategory ? '' : initialTask.category);
      setPriority(initialTask.priority);
      setAssigneeId(initialTask.assigneeId);
      setDueDate(initialTask.dueDate);
    } else {
      setTitle('');
      setDescription('');
      setStatus(initialStatus);
      setCategoryOption('Design');
      setCustomCategory('');
      setPriority('medium');
      setAssigneeId(defaultAssigneeId);
      setDueDate('2026-05-28');
    }
  }, [defaultAssigneeId, initialTask, initialStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedCategory = categoryOption === OTHER_CATEGORY ? customCategory.trim() : categoryOption;
    if (!title.trim() || !resolvedCategory) return;

    await onSave({
      id: initialTask?.id,
      title,
      description,
      status,
      category: resolvedCategory,
      priority,
      assigneeId,
      dueDate,
      starred: initialTask ? initialTask.starred : false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 ${
          darkTheme 
            ? 'bg-slate-900/95 border-slate-800 text-white shadow-cyan-950/20' 
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'
        }`}
      >
        {/* Header */}
        <div className={`p-6 flex items-center justify-between border-b ${darkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
          <h2 className="text-xl font-display font-medium">
            {initialTask ? 'Edit Task Info' : 'Create New Task'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkTheme ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Task Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design responsive dashboard UI"
              className={`w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all ${
                darkTheme 
                  ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/25' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25'
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give details about task objectives and deliverables..."
              rows={3}
              className={`w-full px-4 py-2.5 rounded-xl border outline-none text-sm resize-none transition-all ${
                darkTheme 
                  ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/25' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
              <div className="relative">
                <Tag className={`absolute left-3.5 top-3.5 w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  value={categoryOption}
                  onChange={(e) => {
                    setCategoryOption(e.target.value as TaskCategory);
                    if (e.target.value !== OTHER_CATEGORY) setCustomCategory('');
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm appearance-none transition-all ${
                    darkTheme 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className={darkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {cat}
                    </option>
                  ))}
                  <option value={OTHER_CATEGORY} className={darkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                    Other
                  </option>
                </select>
              </div>
              {categoryOption === OTHER_CATEGORY && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Type category"
                  className={`mt-2 w-full px-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${
                    darkTheme 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/25' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/25'
                  }`}
                />
              )}
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Priority</label>
              <div className="relative">
                <Flame className={`absolute left-3.5 top-3.5 w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm appearance-none cursor-pointer transition-all ${
                    darkTheme 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  {PRIORITIES.map((prio) => (
                    <option key={prio} value={prio} className={darkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {prio.charAt(0).toUpperCase() + prio.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Assignee</label>
              <div className="relative">
                <UserIcon className={`absolute left-3.5 top-3.5 w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm appearance-none cursor-pointer transition-all ${
                    darkTheme 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
                  }`}
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id} className={darkTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Due Date</label>
              <div className="relative">
                <Calendar className={`absolute left-3.5 top-3.5 w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border outline-none text-sm transition-all ${
                    darkTheme 
                      ? 'bg-slate-950/50 border-slate-800 text-white focus:border-cyan-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-600'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStatus('todo')}
              className={`py-2 px-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                status === 'todo'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                  : darkTheme
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Todo
            </button>
            <button
              type="button"
              onClick={() => setStatus('in-progress')}
              className={`py-2 px-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                status === 'in-progress'
                  ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                  : darkTheme
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => setStatus('done')}
              className={`py-2 px-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                status === 'done'
                  ? 'border-emerald-500 bg-emerald-5000/10 text-emerald-400'
                  : darkTheme
                  ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                  : 'border-slate-200 hover:bg-slate-100 text-slate-600'
              }`}
            >
              Completed
            </button>
          </div>

          {/* Footer buttons */}
          <div className={`mt-6 pt-6 border-t flex justify-end gap-3 ${darkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                darkTheme 
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {initialTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
