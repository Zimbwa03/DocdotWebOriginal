import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isBreak: boolean;
  session: number;
  totalStudyTime: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StudyStateContextType {
  // Timer state
  timerState: TimerState;
  setTimerState: (state: TimerState) => void;
  
  // AI Chat state
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  
  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Study planner state
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  
  // Study groups state
  selectedGroup: any;
  setSelectedGroup: (group: any) => void;
}

const StudyStateContext = createContext<StudyStateContextType | undefined>(undefined);

const initialTimerState: TimerState = {
  minutes: 25,
  seconds: 0,
  isRunning: false,
  isBreak: false,
  session: 1,
  totalStudyTime: 0
};

export function StudyStateProvider({ children }: { children: ReactNode }) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('timerState');
    return saved ? JSON.parse(saved) : initialTimerState;
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('activeStudyTab') || 'timer';
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    const saved = localStorage.getItem('selectedPlannerDate');
    return saved ? new Date(saved) : new Date();
  });

  const [selectedGroup, setSelectedGroup] = useState<any>(() => {
    const saved = localStorage.getItem('selectedStudyGroup');
    return saved ? JSON.parse(saved) : null;
  });

  // Persist timer state
  useEffect(() => {
    localStorage.setItem('timerState', JSON.stringify(timerState));
  }, [timerState]);

  // Persist chat messages
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Persist active tab
  useEffect(() => {
    localStorage.setItem('activeStudyTab', activeTab);
  }, [activeTab]);

  // Persist selected date
  useEffect(() => {
    if (selectedDate) {
      localStorage.setItem('selectedPlannerDate', selectedDate.toISOString());
    }
  }, [selectedDate]);

  // Persist selected group
  useEffect(() => {
    if (selectedGroup) {
      localStorage.setItem('selectedStudyGroup', JSON.stringify(selectedGroup));
    }
  }, [selectedGroup]);

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const value: StudyStateContextType = {
    timerState,
    setTimerState,
    chatMessages,
    setChatMessages,
    addChatMessage,
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    selectedGroup,
    setSelectedGroup
  };

  return (
    <StudyStateContext.Provider value={value}>
      {children}
    </StudyStateContext.Provider>
  );
}

export function useStudyState() {
  const context = useContext(StudyStateContext);
  if (context === undefined) {
    throw new Error('useStudyState must be used within a StudyStateProvider');
  }
  return context;
}