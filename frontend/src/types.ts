/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  role: string;
  status: 'online' | 'offline' | 'away';
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskCategory = string;

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "Due Today", "Due Tomorrow", "Due May 26"
  assigneeId: string; // User ID
  starred: boolean;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  read: boolean;
}

export interface Project {
  id: string;
  name: string;
  progress: number;
  color: string; // hex or tailwind class
  tasksCount: number;
}
