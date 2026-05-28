/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User } from '../types';
import { X, Mail, ShieldAlert, Circle } from 'lucide-react';

interface TeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkTheme: boolean;
  users: User[];
}

export default function TeamModal({ isOpen, onClose, darkTheme, users }: TeamModalProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(users[0] ?? null);

  if (!isOpen) return null;

  const activeUser = selectedUser ?? users[0];

  if (!activeUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div 
        className={`relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-300 ${
          darkTheme 
            ? 'bg-slate-900/95 border-slate-800 text-white shadow-cyan-950/20' 
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300/40'
        }`}
      >
        {/* Header */}
        <div className={`p-6 flex items-center justify-between border-b ${darkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <h2 className="text-2xl font-display font-medium tracking-tight">Productivity Team</h2>
            <p className={`text-xs mt-1 ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>
              The talented team powerhouses responsible for executing TaskFlow projects
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkTheme ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Panel Split */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px]">
          {/* Members Sidebar list (Left) */}
          <div className={`md:col-span-5 p-4 space-y-2 border-r ${darkTheme ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50/50'}`}>
            <p className={`text-xs font-mono uppercase tracking-wider px-3 mb-3 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>
              Team Members ({users.length})
            </p>
            {users.map((user) => {
              const isActive = activeUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                    isActive 
                      ? darkTheme 
                        ? 'bg-cyan-950/40 border border-cyan-800/60 shadow-inner' 
                        : 'bg-cyan-50 border border-cyan-200 shadow-sm'
                      : 'border border-transparent hover:bg-slate-500/5'
                  }`}
                >
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-500/20"
                      referrerPolicy="no-referrer"
                    />
                    <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${
                      darkTheme ? 'border-slate-900' : 'border-white'
                    } ${
                      user.status === 'online' ? 'bg-emerald-5000' : user.status === 'away' ? 'bg-amber-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{user.name}</h4>
                    <p className={`text-xs truncate ${darkTheme ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Profile Detail Window (Right) */}
          <div className="md:col-span-7 p-8 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-start gap-5">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-20 h-20 rounded-2xl object-cover shadow-lg border border-slate-400/25"
                  referrerPolicy="no-referrer"
                />
                <div className="space-y-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    activeUser.status === 'online'
                      ? 'bg-emerald-5000/10 text-emerald-400'
                      : activeUser.status === 'away'
                      ? 'bg-amber-500/10 text-amber-500' 
                      : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    <Circle className={`w-2 h-2 fill-current ${
                      activeUser.status === 'online' ? 'text-emerald-500' : activeUser.status === 'away' ? 'text-amber-500' : 'text-slate-400'
                    }`} />
                    {activeUser.status.toUpperCase()}
                  </span>
                  <h3 className="text-2xl font-display font-semibold tracking-tight">{activeUser.name}</h3>
                  <p className={`text-sm ${darkTheme ? 'text-cyan-400' : 'text-cyan-600 font-medium'}`}>{activeUser.role}</p>
                </div>
              </div>

              {/* Bio block */}
              <div className="space-y-2">
                <h5 className={`text-xs font-mono uppercase tracking-wider ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Professional Biography</h5>
                <p className={`text-sm leading-relaxed ${darkTheme ? 'text-slate-300' : 'text-slate-600'}`}>
                  {activeUser.bio}
                </p>
              </div>

              {/* Contact info */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className={`w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                  <a href={`mailto:${activeUser.email}`} className={`hover:underline ${darkTheme ? 'text-slate-300 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-600'}`}>
                    {activeUser.email}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ShieldAlert className={`w-4 h-4 ${darkTheme ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={darkTheme ? 'text-slate-300' : 'text-slate-600'}>Access Role: <strong className="font-medium text-amber-500">Security Authenticated</strong></span>
                </div>
              </div>
            </div>

            <div className={`mt-6 pt-6 border-t flex justify-end gap-3 ${darkTheme ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={onClose}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                  darkTheme 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
