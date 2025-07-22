import { create } from 'zustand';
import { UIMessage, Attachment } from '@ai-sdk/ui-utils';

interface PendingSubmission {
  input: string;
  attachments: Attachment[];
  selectedModel: string;
  webSearch: boolean;
}

interface TempMessageStoreState {
  messages: Record<string, UIMessage[]>; // keyed by threadId
  pendingSubmissions: Record<string, PendingSubmission>; // keyed by threadId
  setMessages: (threadId: string, messages: UIMessage[]) => void;
  getMessages: (threadId: string) => UIMessage[];
  clearMessages: (threadId: string) => void;
  hasMessages: (threadId: string) => boolean;
  setPendingSubmission: (threadId: string, submission: PendingSubmission) => void;
  getPendingSubmission: (threadId: string) => PendingSubmission | null;
  clearPendingSubmission: (threadId: string) => void;
  hasPendingSubmission: (threadId: string) => boolean;
}

export const useTempMessageStore = create<TempMessageStoreState>()((set, get) => ({
  messages: {},
  pendingSubmissions: {},
  
  setMessages: (threadId: string, messages: UIMessage[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [threadId]: messages,
      },
    }));
  },
  
  getMessages: (threadId: string) => {
    return get().messages[threadId] || [];
  },
  
  clearMessages: (threadId: string) => {
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[threadId];
      return { messages: newMessages };
    });
  },
  
  hasMessages: (threadId: string) => {
    const messages = get().messages[threadId];
    return messages && messages.length > 0;
  },

  setPendingSubmission: (threadId: string, submission: PendingSubmission) => {
    set((state) => ({
      pendingSubmissions: {
        ...state.pendingSubmissions,
        [threadId]: submission,
      },
    }));
  },

  getPendingSubmission: (threadId: string) => {
    return get().pendingSubmissions[threadId] || null;
  },

  clearPendingSubmission: (threadId: string) => {
    set((state) => {
      const newSubmissions = { ...state.pendingSubmissions };
      delete newSubmissions[threadId];
      return { pendingSubmissions: newSubmissions };
    });
  },

  hasPendingSubmission: (threadId: string) => {
    return !!get().pendingSubmissions[threadId];
  },
}));