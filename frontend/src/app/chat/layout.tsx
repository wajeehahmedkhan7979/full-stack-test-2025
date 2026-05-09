'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../../providers/auth-provider';
import { ChatSidebar } from '../../components/chat/chat-sidebar';
import { QuickActions } from '../../components/chat/quick-actions';
import { useCreateChat } from '../../hooks/useChats';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const createChat = useCreateChat();

  const handleQuickActionSelect = async (prompt: string) => {
    try {
      const chat = await createChat.mutateAsync(undefined);
      sessionStorage.setItem(`initial_message_${chat.id}`, prompt);
      router.push(`/chat/${chat.id}`);
    } catch (error) {
      // Error handled by React Query
    }
  };

  // Protected route: redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-zinc-950 transition-colors duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 dark:border-zinc-700 border-t-emerald-500" />
          <p className="text-sm text-zinc-400 dark:text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 relative transition-colors duration-200">
      {isSidebarOpen ? (
        <ChatSidebar 
          onClose={() => setIsSidebarOpen(false)} 
          onQuickActionsClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
        />
      ) : (
        <div className="absolute top-4 left-4 z-50">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Open Sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 3v18"></path><path d="m14 9 3 3-3 3"></path></svg>
          </button>
        </div>
      )}

      {isQuickActionsOpen && (
        <QuickActions 
          onSelect={handleQuickActionSelect} 
          onClose={() => setIsQuickActionsOpen(false)} 
        />
      )}

      <main className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-[#0a0a0a]">
        {children}
      </main>
    </div>
  );
}
