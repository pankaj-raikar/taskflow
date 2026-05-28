/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { User, Task } from './types';
import { INITIAL_TASKS, MOCK_USERS } from './data';

type AppRoute = 'login' | 'dashbaod';

const getRouteFromPath = (): AppRoute => {
  if (window.location.pathname === '/dashbaod') return 'dashbaod';
  if (window.location.pathname === '/dashboard') return 'dashbaod';
  return 'login';
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromPath);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getRouteFromPath() === 'dashbaod' ? MOCK_USERS[0] : null);
  const [darkTheme, setDarkTheme] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Attempt local storage recall
    try {
      const stored = localStorage.getItem('taskflow_tasks_list');
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Keep state persistent
  useEffect(() => {
    try {
      localStorage.setItem('taskflow_tasks_list', JSON.stringify(tasks));
    } catch (err) {
      console.warn('LocalStorage persistence disabled or error: ', err);
    }
  }, [tasks]);

  // Synchronize layout element color theme
  useEffect(() => {
    if (darkTheme) {
      document.body.style.backgroundColor = '#040815';
      document.body.classList.add('dark');
    } else {
      document.body.style.backgroundColor = '#f8fafc';
      document.body.classList.remove('dark');
    }
  }, [darkTheme]);

  useEffect(() => {
    const syncRoute = () => {
      const nextRoute = getRouteFromPath();
      setCurrentRoute(nextRoute);
      if (window.location.pathname === '/dashboard') {
        window.history.replaceState({}, '', '/dashbaod');
      } else if (window.location.pathname !== '/login' && window.location.pathname !== '/dashbaod') {
        window.history.replaceState({}, '', '/login');
      }
      if (nextRoute === 'dashbaod') {
        setCurrentUser(prev => prev ?? MOCK_USERS[0]);
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const navigateTo = (route: AppRoute) => {
    const path = route === 'dashbaod' ? '/dashbaod' : '/login';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentRoute(route);
  };

  // Auth form authorization success handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    navigateTo('dashbaod');
  };

  // Logged user signout handler
  const handleLogout = () => {
    setCurrentUser(null);
    navigateTo('login');
  };

  return (
    <div className={`w-full min-h-screen ${darkTheme ? 'dark bg-[#040815]' : 'bg-slate-50'}`}>
      {currentRoute === 'login' && (
        <AuthPage 
          initialMode="signin"
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {currentRoute === 'dashbaod' && (
        <Dashboard
          currentUser={currentUser ?? MOCK_USERS[0]}
          onLogout={handleLogout}
          darkTheme={darkTheme}
          onThemeToggle={() => setDarkTheme(!darkTheme)}
          tasks={tasks}
          setTasks={setTasks}
        />
      )}
    </div>
  );
}
