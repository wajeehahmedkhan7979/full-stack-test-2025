'use client';

import { useAuthContext } from '../../../providers/auth-provider';
import { useTheme } from '../../../providers/theme-provider';
import { User, Bell, Shield, Moon, Monitor, Sun } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function SettingsPage() {
  const { user } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';

  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-200 overflow-y-auto transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <div className="space-y-8">
          {/* Profile Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User size={18} className="text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Profile</h2>
            </div>
            <div className="bg-zinc-50 dark:bg-[#141414] rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-2xl font-bold text-zinc-500 dark:text-zinc-400">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Email Address</p>
                  <p className="text-lg text-zinc-800 dark:text-zinc-100">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Theme Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Monitor size={18} className="text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">Appearance</h2>
            </div>
            <div className="bg-zinc-50 dark:bg-[#141414] rounded-xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-800">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">Dark Mode</p>
                  <p className="text-xs text-zinc-500">Toggle between light and dark theme</p>
                </div>
                <button 
                  onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
                  className={cn(
                    "h-6 w-10 rounded-full relative transition-colors duration-200",
                    isDarkMode ? "bg-emerald-600" : "bg-zinc-300"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 h-4 w-4 bg-white rounded-full shadow-sm transition-all duration-200",
                    isDarkMode ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-zinc-500" />
              <h2 className="text-lg font-semibold text-zinc-300">Security</h2>
            </div>
            <div className="bg-[#141414] rounded-xl border border-zinc-800 p-4">
              <button className="text-sm font-medium text-emerald-500 hover:text-emerald-400">
                Change Password
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
