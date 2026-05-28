/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import { User, Task } from './types';
import { MOCK_USERS } from './data';
import { ApiClient, ApiError, AuthCredentials, AuthSession, TaskPatch, TaskPayload, clearSession, loadSession, saveSession } from './api';

type AppRoute = 'login' | 'dashbaod';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

const withUserDefaults = (user: User): User => ({
  ...user,
  avatar: user.avatar || DEFAULT_AVATAR,
  bio: user.bio || 'TaskFlow workspace member.',
  role: user.role || 'Member',
  status: user.status || 'online'
});

const getRouteFromPath = (): AppRoute => {
  if (window.location.pathname === '/dashbaod') return 'dashbaod';
  if (window.location.pathname === '/dashboard') return 'dashbaod';
  return 'login';
};

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromPath);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const storedSession = loadSession();
    return storedSession ? withUserDefaults(storedSession.user) : null;
  });
  const [darkTheme, setDarkTheme] = useState<boolean>(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appError, setAppError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);

  const api = useMemo(() => new ApiClient(undefined, session?.token ?? null), [session?.token]);

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
      if (nextRoute === 'dashbaod' && !loadSession()) {
        window.history.replaceState({}, '', '/login');
        setCurrentRoute('login');
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

  const activateSession = useCallback((nextSession: AuthSession) => {
    const decoratedSession = {
      ...nextSession,
      user: withUserDefaults(nextSession.user)
    };

    saveSession(decoratedSession);
    setSession(decoratedSession);
    setCurrentUser(decoratedSession.user);
    navigateTo('dashbaod');
  }, []);

  const handleAuthenticate = async (credentials: AuthCredentials) => {
    const publicApi = new ApiClient();
    const nextSession = credentials.mode === 'signup'
      ? await publicApi.register({
          name: credentials.name ?? credentials.email,
          email: credentials.email,
          password: credentials.password
        })
      : await publicApi.login({
          email: credentials.email,
          password: credentials.password
        });

    activateSession(nextSession);
  };

  const handleDemoSignIn = async (user: User) => {
    const publicApi = new ApiClient();
    const password = 'taskflow-demo-password';

    try {
      activateSession(await publicApi.register({
        name: user.name,
        email: user.email,
        password
      }));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        activateSession(await publicApi.login({ email: user.email, password }));
        return;
      }

      throw error;
    }
  };

  const loadTasks = useCallback(async () => {
    if (!session) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    setAppError('');

    try {
      const [user, nextTasks] = await Promise.all([
        api.getCurrentUser(),
        api.listTasks()
      ]);
      setCurrentUser(withUserDefaults(user));
      setTasks(nextTasks);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearSession();
        setSession(null);
        setCurrentUser(null);
        setTasks([]);
        navigateTo('login');
      } else {
        setAppError(error instanceof Error ? error.message : 'Unable to load dashboard data.');
      }
    } finally {
      setLoadingTasks(false);
    }
  }, [api, session]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreateTask = async (task: TaskPayload) => {
    const created = await api.createTask(task);
    setTasks(prev => [...prev, created]);
    return created;
  };

  const handleUpdateTask = async (taskId: string, patch: TaskPatch) => {
    const updated = await api.updateTask(taskId, patch);
    setTasks(prev => prev.map(task => task.id === taskId ? updated : task));
    return updated;
  };

  const handleDeleteTask = async (taskId: string) => {
    const deleted = await api.deleteTask(taskId);
    setTasks(prev => prev.filter(task => task.id !== taskId));
    return deleted;
  };

  // Logged user signout handler
  const handleLogout = () => {
    clearSession();
    setSession(null);
    setCurrentUser(null);
    setTasks([]);
    navigateTo('login');
  };

  return (
    <div className={`w-full min-h-screen ${darkTheme ? 'dark bg-[#040815]' : 'bg-slate-50'}`}>
      {currentRoute === 'login' && (
        <AuthPage 
          initialMode="signin"
          onAuthenticate={handleAuthenticate}
          onDemoSignIn={handleDemoSignIn}
        />
      )}

      {currentRoute === 'dashbaod' && (
        <Dashboard
          currentUser={currentUser ?? session?.user ?? MOCK_USERS[0]}
          onLogout={handleLogout}
          darkTheme={darkTheme}
          onThemeToggle={() => setDarkTheme(!darkTheme)}
          tasks={tasks}
          users={currentUser ? [currentUser] : []}
          loading={loadingTasks}
          error={appError}
          onCreateTask={handleCreateTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}
