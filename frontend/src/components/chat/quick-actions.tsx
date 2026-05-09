'use client';

import { Zap, Code, BookOpen, PenTool, Lightbulb } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  prompt: string;
  description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'explain',
    icon: <BookOpen size={16} className="text-blue-400" />,
    label: 'Explain Code',
    prompt: 'Can you explain how this code works step by step?\n\n```\n\n```',
    description: 'Get a clear explanation of any code snippet.'
  },
  {
    id: 'debug',
    icon: <Code size={16} className="text-red-400" />,
    label: 'Debug Issue',
    prompt: 'I am getting an error in this code. Can you help me find the bug?\n\n```\n\n```',
    description: 'Find and fix bugs in your logic.'
  },
  {
    id: 'write',
    icon: <PenTool size={16} className="text-emerald-400" />,
    label: 'Write Function',
    prompt: 'Can you write a TypeScript function that does the following: ',
    description: 'Generate clean, efficient code for your tasks.'
  },
  {
    id: 'optimize',
    icon: <Zap size={16} className="text-amber-400" />,
    label: 'Optimize Performance',
    prompt: 'How can I optimize this code for better performance?\n\n```\n\n```',
    description: 'Make your code faster and more efficient.'
  },
  {
    id: 'idea',
    icon: <Lightbulb size={16} className="text-purple-400" />,
    label: 'Brainstorm Ideas',
    prompt: 'I want to build a new feature that does... can we brainstorm some ideas?',
    description: 'Get creative suggestions for your project.'
  }
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export function QuickActions({ onSelect, onClose }: QuickActionsProps) {
  return (
    <div className="absolute left-[270px] top-20 z-50 w-80 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141414] p-2 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-200 transition-colors">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-100 dark:border-zinc-800/50 mb-1">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500 dark:text-amber-400" />
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-300 uppercase tracking-wider">Quick Actions</span>
        </div>
      </div>
      
      <div className="space-y-1">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => {
              onSelect(action.prompt);
              onClose();
            }}
            className="w-full flex items-start gap-3 p-3 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="mt-0.5">{action.icon}</div>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white">{action.label}</p>
              <p className="text-xs text-zinc-500 line-clamp-1">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
