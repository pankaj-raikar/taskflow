/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Task, Project, Notification } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@taskflow.inc',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Product Designer at TaskFlow. Passionate about glassmorphism, fluid animations, and high-contrast ergonomic UI layouts.',
    role: 'Product Designer',
    status: 'online',
  },
  {
    id: 'user-2',
    name: 'Sophia Chen',
    email: 'sophia.chen@taskflow.inc',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead Frontend Engineer. Obsessed with performance, structural React design patterns, and beautiful Tailwind utilities.',
    role: 'Frontend Engineer',
    status: 'online',
  },
  {
    id: 'user-3',
    name: 'Marcus Vance',
    email: 'marcus.vance@taskflow.inc',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Systems & Backend Engineer. Specialist in SQL optimizations, WebSockets, and real-time asynchronous workflows.',
    role: 'Full Stack Dev',
    status: 'away',
  },
  {
    id: 'user-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@taskflow.inc',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Product Manager. Translates customer pain-points into design sprints. Lover of retro video games and sci-fi literature.',
    role: 'Product Manager',
    status: 'offline',
  },
];

export const INITIAL_TASKS: Task[] = [
  // Todo
  {
    id: 'task-1',
    title: 'Design landing page UI',
    description: 'Create a high-fidelity landing page showcasing TaskFlow\'s unique dark glassmorphism styling and layout variations.',
    status: 'todo',
    category: 'Design',
    priority: 'high',
    dueDate: '2026-05-28',
    dateLabel: 'Due Today',
    assigneeId: 'user-1',
    starred: true,
  },
  {
    id: 'task-2',
    title: 'Setup authentication system',
    description: 'Implement a highly secure auth panel supporting password visible-toggles, Google, and GitHub social providers.',
    status: 'todo',
    category: 'Development',
    priority: 'medium',
    dueDate: '2026-05-29',
    dateLabel: 'Due Tomorrow',
    assigneeId: 'user-4',
    starred: false,
  },
  {
    id: 'task-3',
    title: 'Write project documentation',
    description: 'Document the app architecture, environment setup guidelines, and modular component hierarchy.',
    status: 'todo',
    category: 'Documentation',
    priority: 'low',
    dueDate: '2026-05-26',
    dateLabel: 'Due May 26',
    assigneeId: 'user-1',
    starred: false,
  },
  
  // In Progress
  {
    id: 'task-4',
    title: 'Implement user dashboard',
    description: 'Develop the interactive Kanban board, metrics cards, responsive side navigation and search flows.',
    status: 'in-progress',
    category: 'Development',
    priority: 'high',
    dueDate: '2026-06-02',
    dateLabel: 'In Progress',
    assigneeId: 'user-2',
    starred: true,
  },
  {
    id: 'task-5',
    title: 'Database optimization',
    description: 'Optimize data structures, streamline local state flows, and setup localStorage triggers for persistence.',
    status: 'in-progress',
    category: 'Development',
    priority: 'medium',
    dueDate: '2026-05-28',
    dateLabel: 'Due Today',
    assigneeId: 'user-3',
    starred: false,
  },
  {
    id: 'task-6',
    title: 'Fix responsive issues',
    description: 'Solve scaling problems on tablets and mobile screens for glass panels, cards, and modal components.',
    status: 'in-progress',
    category: 'Bug',
    priority: 'high',
    dueDate: '2026-05-29',
    dateLabel: 'Due Tomorrow',
    assigneeId: 'user-2',
    starred: false,
  },

  // Completed
  {
    id: 'task-7',
    title: 'Project setup and configuration',
    description: 'Initialize Vite React project with Tailwind v4, Typescript typing structures, and dependencies.',
    status: 'done',
    category: 'Development',
    priority: 'medium',
    dueDate: '2026-05-20',
    dateLabel: 'Completed',
    assigneeId: 'user-1',
    starred: false,
  },
  {
    id: 'task-8',
    title: 'Create wireframes',
    description: 'Sketch layout alternatives and user interaction sequences for the primary dashboard and auth modules.',
    status: 'done',
    category: 'Design',
    priority: 'high',
    dueDate: '2026-05-18',
    dateLabel: 'Completed',
    assigneeId: 'user-1',
    starred: true,
  },
  {
    id: 'task-9',
    title: 'API integration',
    description: 'Build backend routes and request-response proxies for secure payload communication.',
    status: 'done',
    category: 'Development',
    priority: 'medium',
    dueDate: '2026-05-24',
    dateLabel: 'Completed',
    assigneeId: 'user-3',
    starred: false,
  },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 'proj-1', name: 'TaskFlow Redesign', progress: 85, color: '#06b6d4', tasksCount: 12 }, // cyan
  { id: 'proj-2', name: 'Mobile App', progress: 40, color: '#8b5cf6', tasksCount: 8 }, // violet
  { id: 'proj-3', name: 'Marketing Website', progress: 100, color: '#10b981', tasksCount: 15 }, // emerald
  { id: 'proj-4', name: 'Security Audit', progress: 15, color: '#ef4444', tasksCount: 4 }, // red
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'New assignment',
    content: 'Elena Rostova assigned you the task: Write project documentation',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Task completed 🎉',
    content: 'Sophia Chen completed "Implement user dashboard" testing!',
    time: '5 hours ago',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'System notice',
    content: 'TaskFlow backup scheduled successfully for 12:00 AM UTC.',
    time: 'Yesterday',
    read: true,
  },
];

export const BRAND_LOGOS = [
  { name: 'Airbnb', logoUrl: 'https://cdn.worldvectorlogo.com/logos/airbnb.svg' },
  { name: 'Google', logoUrl: 'https://cdn.worldvectorlogo.com/logos/google-2015.svg' },
  { name: 'Microsoft', logoUrl: 'https://cdn.worldvectorlogo.com/logos/microsoft-5.svg' },
  { name: 'Spotify', logoUrl: 'https://cdn.worldvectorlogo.com/logos/spotify-2.svg' },
  { name: 'Amazon', logoUrl: 'https://cdn.worldvectorlogo.com/logos/amazon-2.svg' }
];
