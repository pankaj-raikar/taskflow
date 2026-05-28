/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Task, User, Notification, TaskStatus, TaskCategory, TaskPriority } from '../types';
import { TaskPatch, TaskPayload } from '../api';
import { MOCK_PROJECTS, MOCK_NOTIFICATIONS } from '../data';
import { 
  Check, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Star, 
  Layout, 
  CheckSquare, 
  Clock, 
  PlusCircle, 
  Users, 
  BarChart4, 
  Folder, 
  LogOut, 
  Sparkle, 
  ChevronRight, 
  ChevronLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  Sliders,
  Sparkles,
  Award,
  Play,
  Menu,
  X
} from 'lucide-react';
import TeamModal from './TeamModal';
import TaskModal from './TaskModal';

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  darkTheme: boolean;
  onThemeToggle: () => void;
  tasks: Task[];
  users: User[];
  loading: boolean;
  error: string;
  onCreateTask: (task: TaskPayload) => Promise<Task>;
  onUpdateTask: (taskId: string, patch: TaskPatch) => Promise<Task>;
  onDeleteTask: (taskId: string) => Promise<Task>;
}

type ActiveNavTab = 'dashboard' | 'todo' | 'in-progress' | 'done' | 'my-tasks' | 'all-tasks' | 'calendar' | 'priority' | 'projects' | 'reports';

export default function Dashboard({ 
  currentUser, 
  onLogout, 
  darkTheme, 
  onThemeToggle,
  tasks,
  users,
  loading,
  error,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}: DashboardProps) {
  const [activeNav, setActiveNav] = useState<ActiveNavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColForNewTask, setSelectedColForNewTask] = useState<TaskStatus>('todo');

  // Notifications dropdown
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  // Profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Pro Upgrade dialog state
  const [unlockedPro, setUnlockedPro] = useState(false);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [taskActionError, setTaskActionError] = useState('');

  // Read unread notifications count
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Tasks Filter Logic based on Active Nav Tab
  const processedTasks = useMemo(() => {
    let result = [...tasks];
    
    // 1. Sidebar Nav Filters
    if (activeNav === 'my-tasks') {
      result = result.filter(t => t.assigneeId === currentUser.id);
    } else if (activeNav === 'todo' || activeNav === 'in-progress' || activeNav === 'done') {
      result = result.filter(t => t.status === activeNav);
    } else if (activeNav === 'priority') {
      // Show high priority first
      result.sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      });
    }

    // 2. Global search query filtering
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [tasks, activeNav, currentUser.id, searchQuery]);

  // Calculate task counts for stats banners
  const stats = useMemo(() => {
    const todo = tasks.filter(t => t.status === 'todo').length;
    const progress = tasks.filter(t => t.status === 'in-progress').length;
    const completed = tasks.filter(t => t.status === 'done').length;
    
    const dueToday = tasks.filter(t => t.status === 'todo' && t.dueDate === '2026-05-28').length;
    const workingToday = tasks.filter(t => t.status === 'in-progress').length;

    return { todo, progress, completed, dueToday, workingToday };
  }, [tasks]);

  // Handle task star toggling
  const toggleStar = async (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskActionError('');
    try {
      await onUpdateTask(task.id, { starred: !task.starred });
    } catch (err) {
      setTaskActionError(err instanceof Error ? err.message : 'Unable to update task.');
    }
  };

  // Move task to a status directly
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTaskActionError('');
    try {
      await onUpdateTask(taskId, { status });
    } catch (err) {
      setTaskActionError(err instanceof Error ? err.message : 'Unable to move task.');
    }
  };

  // Checking task moves it between Todo and Done
  const toggleCheck = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    void updateTaskStatus(task.id, targetStatus);
  };

  // Move task left or right (Kanban flows)
  const moveTask = (task: Task, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const columns: TaskStatus[] = ['todo', 'in-progress', 'done'];
    const currentIndex = columns.indexOf(task.status);
    let targetIndex = currentIndex + (direction === 'right' ? 1 : -1);
    if (targetIndex >= 0 && targetIndex < columns.length) {
      void updateTaskStatus(task.id, columns[targetIndex]);
    }
  };

  const renderMoveControls = (task: Task) => (
    <div className={`flex items-center gap-1 rounded-lg border p-0.5 ${
      darkTheme ? 'border-slate-800/70 bg-slate-950/60' : 'border-slate-300 bg-slate-100'
    }`}>
      {task.status !== 'todo' && (
        <button
          onClick={(e) => moveTask(task, 'left', e)}
          className={`p-1 rounded-md transition-colors ${
            darkTheme ? 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400' : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
          title="Move task left"
          aria-label="Move task left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}
      {task.status !== 'done' && (
        <button
          onClick={(e) => moveTask(task, 'right', e)}
          className={`p-1 rounded-md transition-colors ${
            darkTheme ? 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400' : 'text-slate-600 hover:bg-white hover:text-slate-950'
          }`}
          title="Move task right"
          aria-label="Move task right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  // Delete/Archive task
  const deleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTaskActionError('');

    try {
      await onDeleteTask(taskId);
      const deleteNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: 'Task deleted',
        content: 'You removed a task card from your workspace.',
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [deleteNotif, ...prev]);
    } catch (err) {
      setTaskActionError(err instanceof Error ? err.message : 'Unable to delete task.');
    }
  };

  // Handle Task Creation or Editing Save
  const handleTaskSave = async (taskData: TaskPayload & { id?: string }) => {
    setTaskActionError('');

    try {
      const { id, ...payload } = taskData;
      const savedTask = id ? await onUpdateTask(id, payload) : await onCreateTask(payload);

      const createNotif: Notification = {
        id: `notif-${Date.now()}`,
        title: id ? 'Task updated' : 'New project task',
        content: `"${savedTask.title}" ${id ? 'saved' : `added to column ${savedTask.status.toUpperCase()}`}`,
        time: 'Just now',
        read: false
      };
      setNotifications(prev => [createNotif, ...prev]);
    } catch (err) {
      setTaskActionError(err instanceof Error ? err.message : 'Unable to save task.');
    }
  };

  // Mark all notifications as read
  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Trigger editing modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskOpen(true);
  };

  // Trigger creating modal for specific col
  const openCreateModal = (col: TaskStatus) => {
    setEditingTask(null);
    setSelectedColForNewTask(col);
    setIsTaskOpen(true);
  };

  // Find user image and details for tasks
  const getAssignee = (userId: string) => {
    return users.find(u => u.id === userId) || currentUser;
  };

  // Calendar Days generator (Simple beautiful dashboard representation based on Current Year/Month 2026-05)
  const calendarDays = useMemo(() => {
    // We generate 35 days (May 2026 starts on Friday, May 1st)
    const days = [];
    for (let i = 27; i <= 31; i++) {
      days.push({ day: i, month: 4, label: `2026-04-${i}`, currentMonth: false });
    }
    for (let i = 1; i <= 31; i++) {
      days.push({ day: i, month: 5, label: `2026-05-${String(i).padStart(2, '0')}`, currentMonth: true });
    }
    for (let i = 1; i <= 6; i++) {
      days.push({ day: i, month: 6, label: `2026-06-0${i}`, currentMonth: false });
    }
    return days.slice(0, 35);
  }, []);

  return (
    <div className={`h-screen overflow-hidden flex transition-colors duration-500 ${
      darkTheme ? 'bg-[#040815] text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Decorative Blur Background bubbles (Dark Theme Only) */}
      {darkTheme && (
        <>
          <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-cyan-950/15 rounded-full blur-[130px] pointer-events-none z-0" />
          <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-indigo-950/15 rounded-full blur-[110px] pointer-events-none z-0" />
        </>
      )}

      {/* 1. LEFT SIDEBAR PANEL (Collapsible, Matches Image 3 & 4) */}
      <aside 
        className={`taskflow-sidebar ${!darkTheme ? 'taskflow-sidebar-light' : ''} h-screen relative z-20 transition-all duration-300 border-r shrink-0 flex flex-col justify-between ${
          sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden border-r-0'
        } ${
          darkTheme 
            ? 'bg-[#070b16] border-slate-900 text-slate-200' 
            : 'bg-white border-slate-100 text-slate-700'
        }`}
      >
        <div className="p-5 flex flex-col gap-6 flex-1 overflow-y-auto no-scrollbar">
          
          {/* Logo & title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="taskflow-logo-mark w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-cyan-400 to-indigo-500 p-0.5">
                <div className="taskflow-logo-core w-full h-full bg-[#0a0f1d] rounded-[6px] flex items-center justify-center">
                  <Check className="taskflow-logo-icon w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="taskflow-logo-text font-display font-semibold text-lg tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className={`p-1.5 rounded-lg border transition-all ${
                darkTheme ? 'border-slate-800 hover:bg-slate-900 text-slate-500' : 'border-slate-100 hover:bg-slate-50 text-slate-400'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 pt-2">
            
            <div className="space-y-1.5">
              <button
                onClick={() => { setActiveNav('dashboard'); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${
                  activeNav === 'dashboard' 
                    ? darkTheme 
                      ? 'bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 font-semibold shadow-inner' 
                      : 'bg-cyan-50 border border-cyan-200 text-cyan-600 font-semibold shadow-sm'
                    : 'border border-transparent text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            </div>

            {/* TASKS CATEGORY */}
            <div className="space-y-2">
              <p className={`text-[10px] font-mono uppercase tracking-wider px-3.5 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                TASKS
              </p>
              
              <div className="space-y-1">
                <button
                  onClick={() => { setActiveNav('todo'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center justify-between ${
                    activeNav === 'todo'
                      ? 'bg-slate-100/10 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Todo</span>
                  </div>
                  <span className="sidebar-count-badge text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 font-mono">{stats.todo}</span>
                </button>

                <button
                  onClick={() => { setActiveNav('in-progress'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center justify-between ${
                    activeNav === 'in-progress'
                      ? 'bg-slate-100/10 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-4 h-4 text-indigo-400 fill-current" />
                    <span>In Progress</span>
                  </div>
                  <span className="sidebar-count-badge text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 font-mono">{stats.progress}</span>
                </button>

                <button
                  onClick={() => { setActiveNav('done'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center justify-between ${
                    activeNav === 'done'
                      ? 'bg-slate-100/10 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Done</span>
                  </div>
                  <span className="sidebar-count-badge text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 font-mono">{stats.completed}</span>
                </button>

                <button
                  onClick={() => { setActiveNav('all-tasks'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center justify-between ${
                    activeNav === 'all-tasks'
                      ? 'bg-slate-100/10 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>All Tasks</span>
                  </div>
                  <span className="sidebar-count-badge text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 font-mono">{tasks.length}</span>
                </button>

                <button
                  onClick={() => { setActiveNav('my-tasks'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center justify-between ${
                    activeNav === 'my-tasks'
                      ? 'bg-slate-100/10 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:bg-slate-500/5 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <span>My Tasks</span>
                  </div>
                  <span className="sidebar-count-badge text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800/80 font-mono">
                    {tasks.filter(t => t.assigneeId === currentUser.id).length}
                  </span>
                </button>

                <button
                  onClick={() => { setActiveNav('calendar'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center gap-3 ${
                    activeNav === 'calendar' ? 'text-cyan-400 font-semibold bg-slate-100/10' : 'text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4 text-indigo-400" />
                  <span>Calendar</span>
                </button>

                <button
                  onClick={() => { setActiveNav('priority'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center gap-3 ${
                    activeNav === 'priority' ? 'text-cyan-400 font-semibold bg-slate-100/10' : 'text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span>Priority Sorting</span>
                </button>
              </div>
            </div>

            {/* OTHERS CATEGORY */}
            <div className="space-y-2">
              <p className={`text-[10px] font-mono uppercase tracking-wider px-3.5 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
                OTHERS
              </p>

              <div className="space-y-1">
                <button
                  onClick={() => { setActiveNav('projects'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center gap-3 ${
                    activeNav === 'projects' ? 'text-cyan-400 font-semibold bg-slate-100/10' : 'text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <Folder className="w-4 h-4 text-sky-400" />
                  <span>Projects</span>
                </button>

                <button
                  onClick={() => { setIsTeamOpen(true); }}
                  className="w-full px-3.5 py-2 text-left rounded-xl text-sm text-slate-400 hover:bg-slate-500/5 hover:text-slate-200 transition-all flex items-center gap-3"
                >
                  <Users className="w-4 h-4 text-violet-400" />
                  <span>Explore Teams</span>
                </button>

                <button
                  onClick={() => { setActiveNav('reports'); }}
                  className={`w-full px-3.5 py-2 text-left rounded-xl text-sm transition-all flex items-center gap-3 ${
                    activeNav === 'reports' ? 'text-cyan-400 font-semibold bg-slate-100/10' : 'text-slate-400 hover:bg-slate-500/5'
                  }`}
                >
                  <BarChart4 className="w-4 h-4 text-pink-400" />
                  <span>Reports Summary</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Upgrade to Pro & Logout */}
        <div className="p-4 space-y-4">
          
          <div className={`p-4.5 rounded-2xl relative overflow-hidden border ${
            darkTheme 
              ? 'bg-[#090e1f] border-indigo-950 shadow-inner' 
              : 'bg-indigo-50/40 border-indigo-100 shadow-sm'
          }`}>
            <div className="absolute top-[-20px] right-[-20px] w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
            
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPGRADE TO PRO</span>
            </div>
            
            <h4 className="text-xs font-medium text-slate-400 leading-relaxed">
              Unlock unlimited board synchronizations and team calendars.
            </h4>
            
            <button
              onClick={() => {
                setUnlockedPro(true);
                setShowUpgradeAlert(true);
                setTimeout(() => setShowUpgradeAlert(false), 4000);
              }}
              className="w-full mt-3.5 py-2 rounded-xl text-xs font-semibold text-center bg-gradient-to-r from-cyan-400 to-indigo-600 text-white hover:opacity-95 transform active:scale-95 transition-all shadow-lg"
            >
              {unlockedPro ? 'Pro Active ✨' : 'Upgrade Now'}
            </button>
          </div>

          {/* Quick Sign Out row */}
          <button
            onClick={onLogout}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
              darkTheme ? 'hover:bg-slate-900 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign out from deck</span>
          </button>
        </div>
      </aside>

      {/* Helper trigger for sidebar on mobile/collapses */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          className={`fixed left-4 bottom-4 z-40 p-3.5 rounded-2xl border transition-all pointer-events-auto flex items-center justify-center cursor-pointer shadow-lg ${
            darkTheme 
              ? 'bg-[#090d16] border-slate-800 hover:bg-slate-800 text-cyan-400' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-cyan-600'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* 2. MAIN HUB WORKSPACE CANVAS PANEL */}
      <main className="h-screen flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* Global PRO welcome flash banner */}
        {showUpgradeAlert && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm py-3 px-6 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
            <Award className="w-5 h-5 text-amber-300" />
            <span>Successfully upgraded to <strong>TaskFlow Premium Enterprise Suite</strong>!</span>
          </div>
        )}

        {/* TOP BAR / NAVIGATION HEADER */}
        <header className={`shrink-0 p-4 sm:p-5 flex items-center justify-between border-b ${
          darkTheme ? 'border-indigo-950/40' : 'border-slate-100'
        }`}>
          
          <div className="flex items-center gap-4 flex-1 max-w-lg">
            {/* Sidebar toggle back */}
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className={`p-2 rounded-lg border hidden md:block ${
                  darkTheme ? 'border-slate-800 text-slate-400 hover:text-white' : 'border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* Quick Filter Search Bar */}
            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-3 w-4.5 h-4.5 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, projects, categories (Cmd K)..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none text-sm transition-all ${
                  darkTheme 
                    ? 'bg-[#060a14]/60 border-slate-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-600/10'
                }`}
              />
              <span className={`absolute right-3 top-3 text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border ${
                darkTheme ? 'border-slate-800 text-slate-500 bg-slate-900' : 'border-slate-200 text-slate-400 bg-slate-50'
              }`}>
                ⌘ K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Dark & light toggler */}
            <button
              onClick={onThemeToggle}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                darkTheme 
                  ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-amber-400' 
                  : 'border-slate-200 bg-white hover:bg-slate-100 shadow-sm text-slate-600'
              }`}
              title={darkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkTheme ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* Notifications Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowProfileDropdown(false); }}
                className={`p-2.5 rounded-xl border transition-all relative cursor-pointer ${
                  darkTheme 
                    ? 'border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-slate-300 hover:text-white' 
                    : 'border-slate-200 bg-white hover:bg-slate-100 shadow-sm text-slate-600'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-transparent" />
                )}
              </button>

              {showNotifDropdown && (
                <div className={`absolute right-0 mt-3.5 w-80 rounded-2xl border shadow-2xl p-4 space-y-3 z-50 ${
                  darkTheme ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/40">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllNotifsRead}
                        className="text-[10px] text-cyan-400 hover:underline font-mono"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto no-scrollbar">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          notif.read 
                            ? 'bg-transparent border-transparent opacity-60' 
                            : darkTheme ? 'bg-slate-950/40 border-slate-800/60' : 'bg-slate-50 border-slate-100'
                        }`}
                      >
                        <h5 className="text-xs font-semibold">{notif.title}</h5>
                        <p className={`text-[11px] mt-0.5 leading-relaxed ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{notif.content}</p>
                        <span className="text-[9px] text-slate-500 font-mono mt-1 block">{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropper (User Alex Morgan portrait) */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileDropdown(!showProfileDropdown); setShowNotifDropdown(false); }}
                className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-500/20"
                  referrerPolicy="no-referrer"
                />
                
                <div className="hidden sm:block">
                  <h4 className="text-sm font-semibold leading-tight">{currentUser.name}</h4>
                  <p className={`text-[10px] ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser.role}</p>
                </div>
              </button>

              {showProfileDropdown && (
                <div className={`absolute right-0 mt-3 w-56 rounded-2xl border shadow-2xl p-2 z-50 ${
                  darkTheme ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="p-3 border-b border-slate-800/40">
                    <p className="text-xs font-semibold truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                  </div>
                  
                  <button
                    onClick={() => { setIsTeamOpen(true); setShowProfileDropdown(false); }}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-slate-500/10 transition-colors flex items-center gap-2 mt-1"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Team Members</span>
                  </button>

                  <button
                    onClick={onLogout}
                    className="w-full text-left px-3 py-2 text-xs rounded-xl hover:bg-rose-500/15 text-rose-500 transition-colors flex items-center gap-2 mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* MAIN BODY SCROLLER */}
        <div className="p-4 md:p-6 space-y-5 flex-1 min-h-0 overflow-hidden flex flex-col">
          {(loading || error || taskActionError) && (
            <div className={`shrink-0 rounded-xl border px-4 py-3 text-xs font-medium ${
              error || taskActionError
                ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                : darkTheme
                ? 'border-cyan-800/40 bg-cyan-950/20 text-cyan-300'
                : 'border-cyan-200 bg-cyan-50 text-cyan-700'
            }`}>
              {error || taskActionError || 'Syncing dashboard data...'}
            </div>
          )}
          
          {/* Welcome Banner */}
          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-semibold tracking-tight text-glow-cyan">
                Welcome back, {currentUser.name.split(' ')[0]} 👋
              </h1>
              <p className={`text-sm mt-1 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
                Here's what's happening with your tasks today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Add Task Primary Action */}
              <button
                onClick={() => openCreateModal('todo')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:opacity-95 transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task Card</span>
              </button>
            </div>
          </div>

          {/* Three Summary Indicators row (Matches Screen 3 & 4) */}
          <div className="shrink-0 grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Card 1: Todo */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
              darkTheme 
                ? 'bg-slate-900/40 border-slate-800/80 hover:border-cyan-500/30' 
                : 'bg-white border-slate-200 hover:border-cyan-500/30 shadow-sm shadow-slate-100'
            }`}>
              {/* Abstract decorative graphic */}
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-cyan-400/10 rounded-full blur-2xl" />
              
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Todo Tasks</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-display font-semibold transition-all">{stats.todo}</h3>
                    <span className="text-xs text-slate-500 font-medium">tasks</span>
                  </div>
                </div>
                
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  darkTheme ? 'bg-cyan-950/40 border border-cyan-800/40' : 'bg-cyan-50 border border-cyan-200'
                }`}>
                  <CheckSquare className="w-5 h-5 text-cyan-400" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{stats.dueToday} tasks due today</span>
              </div>
            </div>

            {/* Card 2: In Progress */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
              darkTheme 
                ? 'bg-slate-900/40 border-slate-800/80 hover:border-indigo-500/30' 
                : 'bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm shadow-slate-100'
            }`}>
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-400/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>In Progress</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-display font-semibold transition-all">{stats.progress}</h3>
                    <span className="text-xs text-slate-500 font-medium">tasks</span>
                  </div>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  darkTheme ? 'bg-indigo-950/40 border border-indigo-800/40' : 'bg-indigo-50 border border-indigo-200'
                }`}>
                  <Play className="w-5 h-5 text-indigo-400 fill-current" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stats.workingToday} active tasks remaining</span>
              </div>
            </div>

            {/* Card 3: Completed */}
            <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all duration-300 ${
              darkTheme 
                ? 'bg-slate-900/40 border-slate-800/80 hover:border-emerald-500/30' 
                : 'bg-white border-slate-200 hover:border-emerald-500/30 shadow-sm shadow-slate-100'
            }`}>
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl" />

              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>Completed</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-display font-semibold transition-all">{stats.completed}</h3>
                    <span className="text-xs text-slate-500 font-medium">tasks</span>
                  </div>
                </div>

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  darkTheme ? 'bg-emerald-950/40 border border-emerald-800/40' : 'bg-emerald-50 border border-emerald-200'
                }`}>
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
                <Sparkle className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Great job executing work! 🎉</span>
              </div>
            </div>

          </div>

          {/* DYNAMIC CONTENTS PANEL DEPENDING ON SUB-NAV */}
          
          {/* Sub-Nav View A: KANBAN COLUMNS (Dashboard OR All Tasks OR Priority) */}
          {(activeNav === 'dashboard' || activeNav === 'todo' || activeNav === 'in-progress' || activeNav === 'done' || activeNav === 'all-tasks' || activeNav === 'priority') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch flex-1 min-h-0">
              
              {/* Column 1: Todo */}
              <div className={`p-4 rounded-2xl border text-left flex flex-col min-h-0 h-full ${
                darkTheme ? 'bg-[#060a14]/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 text-glow-cyan" />
                    <h4 className="font-semibold text-sm">Todo</h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${darkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {processedTasks.filter(t => t.status === 'todo').length}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => openCreateModal('todo')}
                    className={`p-1 rounded-lg hover:opacity-85 ${darkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Rows listed items */}
                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
                  {processedTasks.filter(t => t.status === 'todo').length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center text-slate-500">
                      <span className="text-xs">No active tasks</span>
                    </div>
                  ) : (
                    processedTasks.filter(t => t.status === 'todo').map(task => (
                      <div
                        key={task.id}
                        onClick={() => openEditModal(task)}
                        className={`p-4 rounded-xl border relative group cursor-pointer transition-all duration-300 ${
                          darkTheme 
                            ? 'bg-[#080d19] border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/30' 
                            : 'bg-white border-slate-200 hover:border-cyan-500/20 hover:bg-slate-50/50 shadow-sm'
                        }`}
                      >
                        {/* Drag Handle represent */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>
                          
                          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            {renderMoveControls(task)}
                            <button
                              onClick={(e) => void toggleStar(task, e)}
                              className={`p-0.5 rounded transition-colors ${task.starred ? 'text-amber-400' : 'text-slate-400'}`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={(e) => deleteTask(task.id, e)}
                              className="p-0.5 rounded hover:text-rose-500 text-slate-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="text-sm font-semibold truncate leading-tight">{task.title}</h5>
                        <p className={`text-[11px] truncate mt-1 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100/5 text-slate-400 border border-slate-800/80 font-mono">
                            {task.category}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {task.dateLabel}
                            </span>
                            
                            <img 
                              src={getAssignee(task.assigneeId).avatar} 
                              alt={getAssignee(task.assigneeId).name} 
                              className="w-5.5 h-5.5 rounded-full object-cover border border-slate-500/20"
                              title={getAssignee(task.assigneeId).name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => openCreateModal('todo')}
                  className={`w-full py-2.5 mt-4 rounded-xl border border-dashed text-xs text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                    darkTheme ? 'border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-300 hover:bg-slate-50 text-slate-500'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Task Card</span>
                </button>
              </div>

              {/* Column 2: In Progress */}
              <div className={`p-4 rounded-2xl border text-left flex flex-col min-h-0 h-full ${
                darkTheme ? 'bg-[#060a14]/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 text-glow-purple" />
                    <h4 className="font-semibold text-sm">In Progress</h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${darkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {processedTasks.filter(t => t.status === 'in-progress').length}
                    </span>
                  </div>

                  <button 
                    onClick={() => openCreateModal('in-progress')}
                    className={`p-1 rounded-lg hover:opacity-85 ${darkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
                  {processedTasks.filter(t => t.status === 'in-progress').length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center text-slate-500">
                      <span className="text-xs">No active tasks</span>
                    </div>
                  ) : (
                    processedTasks.filter(t => t.status === 'in-progress').map(task => (
                      <div
                        key={task.id}
                        onClick={() => openEditModal(task)}
                        className={`p-4 rounded-xl border relative group cursor-pointer transition-all duration-300 ${
                          darkTheme 
                            ? 'bg-[#080d19] border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/30' 
                            : 'bg-white border-slate-200 hover:border-indigo-500/20 hover:bg-slate-50/50 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>

                          <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            {renderMoveControls(task)}
                            <button
                              onClick={(e) => void toggleStar(task, e)}
                              className={`p-0.5 rounded transition-colors ${task.starred ? 'text-amber-400' : 'text-slate-400'}`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={(e) => deleteTask(task.id, e)}
                              className="p-0.5 rounded hover:text-rose-500 text-slate-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="text-sm font-semibold truncate leading-tight">{task.title}</h5>
                        <p className={`text-[11px] truncate mt-1 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100/5 text-slate-400 border border-slate-800/80 font-mono">
                            {task.category}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                              <Play className="w-3 h-3 text-indigo-400 fill-current" />
                              {task.dateLabel}
                            </span>

                            <img 
                              src={getAssignee(task.assigneeId).avatar} 
                              alt={getAssignee(task.assigneeId).name} 
                              className="w-5.5 h-5.5 rounded-full object-cover border border-slate-500/20"
                              title={getAssignee(task.assigneeId).name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => openCreateModal('in-progress')}
                  className={`w-full py-2.5 mt-4 rounded-xl border border-dashed text-xs text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                    darkTheme ? 'border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Task Card</span>
                </button>
              </div>

              {/* Column 3: Done */}
              <div className={`p-4 rounded-2xl border text-left flex flex-col min-h-0 h-full ${
                darkTheme ? 'bg-[#060a14]/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/40">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 text-glow-cyan" />
                    <h4 className="font-semibold text-sm">Completed</h4>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${darkTheme ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      {processedTasks.filter(t => t.status === 'done').length}
                    </span>
                  </div>

                  <button 
                    onClick={() => openCreateModal('done')}
                    className={`p-1 rounded-lg hover:opacity-85 ${darkTheme ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-1">
                  {processedTasks.filter(t => t.status === 'done').length === 0 ? (
                    <div className="h-44 border-2 border-dashed border-slate-800/60 rounded-xl flex flex-col items-center justify-center text-slate-500">
                      <span className="text-xs">No completed tasks yet</span>
                    </div>
                  ) : (
                    processedTasks.filter(t => t.status === 'done').map(task => (
                      <div
                        key={task.id}
                        onClick={() => openEditModal(task)}
                        className={`p-4 rounded-xl border relative group cursor-pointer transition-all duration-300 ${
                          darkTheme 
                            ? 'bg-[#080d19] border-slate-800 hover:border-emerald-500/30 hover:bg-slate-900/30 opacity-70' 
                            : 'bg-white border-slate-200 hover:border-emerald-500/20 hover:bg-slate-50/50 shadow-sm opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono ${
                            task.priority === 'high' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                          }`}>
                            {task.priority.toUpperCase()}
                          </span>

                          <div className="flex items-center gap-1.5 opacity-45 group-hover:opacity-100 transition-opacity">
                            {renderMoveControls(task)}
                            <button
                              onClick={(e) => void toggleStar(task, e)}
                              className={`p-0.5 rounded transition-colors ${task.starred ? 'text-amber-400' : 'text-slate-400'}`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>
                            <button
                              onClick={(e) => deleteTask(task.id, e)}
                              className="p-0.5 rounded text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h5 className="text-sm font-semibold truncate leading-tight line-through text-slate-500">{task.title}</h5>
                        <p className={`text-[11px] truncate mt-1 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>{task.description}</p>

                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/5 text-emerald-400 border border-emerald-900/30 font-mono">
                            {task.category}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-1 font-semibold">
                              <Check className="w-3 h-3 text-emerald-400" />
                              {task.dateLabel}
                            </span>

                            <img 
                              src={getAssignee(task.assigneeId).avatar} 
                              alt={getAssignee(task.assigneeId).name} 
                              className="w-5.5 h-5.5 rounded-full object-cover border border-slate-500/20 saturate-50"
                              title={getAssignee(task.assigneeId).name}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <button
                  onClick={() => openCreateModal('done')}
                  className={`w-full py-2.5 mt-4 rounded-xl border border-dashed text-xs text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                    darkTheme ? 'border-slate-800 hover:bg-slate-900/40 text-slate-400 hover:text-white' : 'border-slate-300 hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Task Card</span>
                </button>
              </div>

            </div>
          )}

          {/* Sub-Nav View B: CALENDAR VIEW */}
          {activeNav === 'calendar' && (
            <div className={`p-6 rounded-2xl border ${
              darkTheme ? 'bg-[#060a14]/60 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/40 mb-6">
                <div>
                  <h3 className="text-lg font-display font-semibold">Task Calendar</h3>
                  <p className="text-xs text-slate-500 mt-1">Due dates structured on daily scheduler view (May 2026)</p>
                </div>

                {/* Calendar Title */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold font-mono">MAY 2026</span>
                </div>
              </div>

              {/* Grid 7 days heading */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase font-bold text-slate-500 pb-2 border-b border-slate-800/20">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              {/* Grid 35 fields days boxes */}
              <div className="grid grid-cols-7 gap-1 mt-1 font-sans">
                {calendarDays.map((dayItem, index) => {
                  // Find if any task due today
                  const tasksToday = tasks.filter(t => t.dueDate === dayItem.label);

                  return (
                    <div 
                      key={index}
                      className={`min-h-[90px] p-2 border border-slate-800/25 rounded-lg flex flex-col justify-between transition-all relative ${
                        dayItem.currentMonth 
                          ? darkTheme ? 'bg-[#080d1a] border-slate-800' : 'bg-slate-50/50 border-slate-100'
                          : darkTheme ? 'bg-transparent text-slate-600 border-transparent opacity-30' : 'bg-transparent text-slate-400 border-transparent opacity-35'
                      }`}
                    >
                      <span className="text-xs font-mono font-medium self-end">{dayItem.day}</span>
                      
                      {/* Short visual tags of tasks */}
                      <div className="space-y-1 mt-1 max-h-12 overflow-y-auto no-scrollbar">
                        {tasksToday.slice(0, 2).map(tk => (
                          <div 
                            key={tk.id}
                            onClick={() => openEditModal(tk)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate cursor-pointer transition-opacity hover:opacity-80 ${
                              tk.status === 'done' 
                                ? 'bg-emerald-5000/10 text-emerald-400 border border-emerald-500/20 line-through' 
                                : tk.status === 'in-progress'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/10'
                            }`}
                          >
                            {tk.title}
                          </div>
                        ))}
                        {tasksToday.length > 2 && (
                          <div className="text-[8px] text-slate-500 font-mono text-center">
                            + {tasksToday.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-Nav View C: PROJECTS LIST (Image 3 Left Projects represent) */}
          {activeNav === 'projects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_PROJECTS.map(proj => {
                const projTasks = tasks.filter(t => t.category.toLowerCase() === 'development' || t.category.toLowerCase() === 'design');
                return (
                  <div 
                    key={proj.id}
                    className={`p-6 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      darkTheme ? 'bg-[#060a14]/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center p-0.5 text-white font-bold"
                          style={{ backgroundColor: `${proj.color}25`, border: `1px solid ${proj.color}50` }}
                        >
                          <Folder className="w-5 h-5" style={{ color: proj.color }} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm leading-tight">{proj.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono">Workspace Sync Active</span>
                        </div>
                      </div>

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100/5 text-slate-400 border border-slate-800/80 font-mono">
                        {proj.tasksCount} total tasks
                      </span>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Active Progress</span>
                        <span className="font-mono font-bold" style={{ color: proj.color }}>{proj.progress}%</span>
                      </div>
                      
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800/30">
                        <div 
                          className="h-full rounded-full transition-all duration-700" 
                          style={{ width: `${proj.progress}%`, backgroundColor: proj.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-Nav View D: REPORTS SUMMARY */}
          {activeNav === 'reports' && (
            <div className={`p-6 rounded-2xl border text-left space-y-6 ${
              darkTheme ? 'bg-[#060a14]/40 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div>
                <h3 className="text-lg font-display font-semibold">Workspace Analytics</h3>
                <p className="text-xs text-slate-500 mt-1">Consolidated report count of tasks categorized by area</p>
              </div>

              {/* Dynamic generated reports using SVGs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* Horizontal Category Bar represent */}
                <div className="space-y-4">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800/30">Category Volume</h5>
                  
                  {(['Design', 'Development', 'Work', 'Meeting', 'Bug', 'Documentation'] as TaskCategory[]).map(cat => {
                    const count = tasks.filter(t => t.category === cat).length;
                    const maxCount = Math.max(...['Design', 'Development', 'Work', 'Meeting', 'Bug', 'Documentation'].map(c => tasks.filter(t => t.category === c).length));
                    const percent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium">{cat}</span>
                          <span className="text-slate-400 font-mono font-medium">{count} tasks</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-slate-900 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vertical priorities chart represent */}
                <div className="space-y-4">
                  <h5 className="text-xs font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800/30">Priority Density</h5>
                  
                  <div className="h-56 flex items-end justify-around gap-4 pt-6 text-center font-mono">
                    {(['low', 'medium', 'high'] as TaskPriority[]).map(prio => {
                      const count = tasks.filter(t => t.priority === prio).length;
                      const maxDensity = Math.max(...['low', 'medium', 'high'].map(p => tasks.filter(t => t.priority === p).length));
                      const heightPercent = maxDensity > 0 ? (count / maxDensity) * 100 : 0;

                      return (
                        <div key={prio} className="flex-1 flex flex-col justify-end items-center h-full">
                          <span className="text-[10px] text-slate-400 mb-1.5">{count}</span>
                          <div 
                            className={`w-14 rounded-t-xl transition-all duration-700 ${
                              prio === 'high' 
                                ? 'bg-gradient-to-t from-rose-600 to-rose-400 text-glow-purple' 
                                : prio === 'medium'
                                ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                                : 'bg-gradient-to-t from-slate-600 to-slate-400'
                            }`}
                            style={{ height: `${heightPercent || 15}%` }}
                          />
                          <span className="text-[10px] font-sans font-medium text-slate-500 mt-2 capitalize">{prio}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </main>

      {/* Floating global action button for adding task (FAB) */}
      <button
        onClick={() => openCreateModal('todo')}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 duration-200 transition-all cursor-pointer border border-cyan-300/20"
        title="Add Task to Workspace"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 3. SUB-MODALS INTEGRATED */}
      
      {/* Team profiles detail explorer */}
      <TeamModal 
        isOpen={isTeamOpen} 
        onClose={() => setIsTeamOpen(false)} 
        darkTheme={darkTheme} 
        users={users}
      />

      {/* Task Creation & updating Dialog */}
      <TaskModal
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onSave={handleTaskSave}
        initialTask={editingTask}
        initialStatus={selectedColForNewTask}
        darkTheme={darkTheme}
        users={users}
      />

    </div>
  );
}
