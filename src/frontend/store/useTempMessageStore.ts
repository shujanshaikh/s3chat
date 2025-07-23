import { create } from 'zustand';


interface TempMessage {
  id: string; 
  content: string;
  reasoning: string;
}

interface TempMessageStoreState {
  messages: TempMessage[];
}

export const useTempMessageStore = create<TempMessageStoreState>()((set) => ({
  messages: [], 
}));