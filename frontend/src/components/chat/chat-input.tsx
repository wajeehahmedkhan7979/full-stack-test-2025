'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Plus, X, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  isWaitingForReply: boolean;
}

export function ChatInput({ onSend, disabled, isWaitingForReply }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDisabled = disabled || (!content.trim() && files.length === 0);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSubmit = () => {
    if (isDisabled) return;
    const trimmed = content.trim();
    
    if (files.length > 0) {
      toast.info('File processing backend integration coming soon!');
    }
    
    if (trimmed || files.length > 0) {
      // For now, if there's no text but there's a file, we send a dummy text
      // to bypass the backend content requirement
      onSend(trimmed || 'Attached files');
      setContent('');
      setFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input so the same file can be selected again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] pb-6 pt-2 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4">
        {isWaitingForReply && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <Loader2 className="h-3 w-3 animate-spin text-[#EF5350]" />
            <span className="text-xs text-zinc-500">
              Assistant is thinking...
            </span>
          </div>
        )}

        {/* Attachment Chips */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700/50">
                <Paperclip size={12} className="text-zinc-500 dark:text-zinc-400" />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">{file.name}</span>
                <button 
                  onClick={() => removeFile(idx)}
                  className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex items-center gap-3 rounded-[24px] border border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-[#141414] px-4 py-2 shadow-sm focus-within:border-zinc-300 dark:focus-within:border-zinc-700 transition-all duration-200">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Attach file"
          >
            <Plus size={20} />
          </button>
          
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isWaitingForReply
                ? 'Wait for response...'
                : 'Ask something...'
            }
            disabled={disabled}
            rows={1}
            className={cn(
              'flex-1 resize-none bg-transparent text-[15px] text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[24px] max-h-[200px] py-1.5 leading-relaxed',
            )}
            id="chat-input"
          />
          
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors shrink-0",
              isDisabled 
                ? "text-zinc-400 dark:text-zinc-600 bg-transparent" 
                : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            )}
            aria-label="Send message"
            id="send-message-button"
          >
            {disabled && !isWaitingForReply ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4 ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
