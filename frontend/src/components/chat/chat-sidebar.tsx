'use client';

import { useRouter, useParams } from 'next/navigation';
import { Home, Zap, Folder, MessageSquare, PanelLeftClose, Plus, Trash2, LogOut, Loader2, Settings, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { useChats, useCreateChat, useDeleteChat } from '../../hooks/useChats';
import { useAuthContext } from '../../providers/auth-provider';
import { useTheme } from '../../providers/theme-provider';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

export function ChatSidebar({ onClose, onQuickActionsClick }: { onClose?: () => void; onQuickActionsClick?: () => void }) {
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string | undefined;
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === 'dark';

  const { data: chats, isLoading, error } = useChats();
  const createChat = useCreateChat();
  const deleteChat = useDeleteChat();
  const { user, signOut } = useAuthContext();

  const handleNewChat = async () => {
    try {
      const chat = await createChat.mutateAsync(undefined);
      router.push(`/chat/${chat.id}`);
    } catch {
      // Error handled by React Query
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await deleteChat.mutateAsync(chatId);
      if (currentChatId === chatId) {
        router.push('/chat');
      }
    } catch {
      // Error handled by React Query
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleComingSoon = (feature: string) => {
    toast.info(`${feature} is coming soon!`);
  };

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-[#111111] text-zinc-600 dark:text-zinc-300 transition-all duration-300 shrink-0">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800/50 cursor-pointer overflow-hidden p-1.5" onClick={() => router.push('/chat')}>
          <img src="/TT%20Logo%20-%20colored%201.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <button onClick={onClose || (() => handleComingSoon('Close Sidebar'))} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <nav className="px-3 py-2 space-y-1">
        <button onClick={() => router.push('/chat')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
          <Home size={16} />
          Home
        </button>
        <button onClick={onQuickActionsClick || (() => handleComingSoon('Quick Actions'))} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
          <Zap size={16} />
          Quick Actions
        </button>
        <button onClick={() => handleComingSoon('Spaces')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
          <Folder size={16} />
          Spaces
        </button>
      </nav>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto px-3 mt-4">
        <div className="flex items-center justify-between px-3 py-2 mb-1">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Chat History
          </h3>
          <button 
            onClick={handleNewChat}
            disabled={createChat.isPending}
            className="text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            title="New Chat"
          >
            {createChat.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>

        <div className="space-y-0.5">
          {isLoading && (
            <div className="space-y-2 px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md bg-zinc-800/50" />
              ))}
            </div>
          )}

          {error && (
            <p className="px-3 py-2 text-xs text-red-400">
              Failed to load history
            </p>
          )}

          {chats?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className={cn(
                'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors',
                currentChatId === chat.id
                  ? 'bg-zinc-200 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-200 font-medium'
                  : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/40 hover:text-zinc-900 dark:hover:text-zinc-200',
              )}
            >
              <span className="flex-1 truncate">{chat.title || 'New Chat'}</span>
              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-all"
                onClick={(e) => handleDeleteChat(e, chat.id)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 mt-auto border-t border-zinc-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-300 ring-1 ring-zinc-300 dark:ring-zinc-700 group-hover:ring-zinc-400 dark:group-hover:ring-zinc-500 transition-all">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {user?.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <button
            onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button
            onClick={() => router.push('/chat/settings')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title="Settings"
          >
            <Settings size={14} />
          </button>
          <button
            onClick={handleSignOut}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
