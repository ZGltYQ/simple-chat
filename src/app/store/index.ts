import { create } from 'zustand'

type Selected = {
    id: string;
    title: string;
}

type Topic = {
    id: string;
    title: string;
}

type DrawerStore = {
    open: boolean;
    setOpen: (open: boolean) => void;
}

type Model = {
    label: string;
    value: string;
}

type SettingsFormData = {
    api_token: string;
    context_messages: number;
    model: string;
}

type SettingsStore = {
    open: boolean;
    setOpen: (open: boolean) => void;
    openaiInstance: any;
    setOpenaiInstance: (openaiInstance: any) => void;
    formData: SettingsFormData;
    models: Model[];
    setModels: (models: Model[]) => void;
    setFormData: (formData: SettingsFormData) => void;
}

type ChatStore = {
    input: string;
    messages: any[];
    images: string[];
    isProcessing: boolean;
    setIsProcessing: (isProcessing: boolean) => void;
    setMessages: (messages: any[]) => void;
    setInput: (input: string) => void;
    setImages: (images: string[]) => void;
}

export type TopicsStore = {
    topics: Topic[];
    editingTopic: string | null;
    selected: Selected;
    setSelected: (selected: Selected) => void;
    setEditingTopic: (editingId: string | null) => void;
    setTopics: (topics: Topic[]) => void;
};

export const topicsStore = create<TopicsStore>((set) => ({
    topics: [],
    editingTopic: '',
    selected: {
        id: '',
        title: ''
    },
    setSelected: (selected: Selected) => set({ selected }),
    setEditingTopic: (editingTopic: string | null) => set({ editingTopic }),
    setTopics: (topics: Topic[]) => set({ topics }),
}));

export const settingsStore = create<SettingsStore>((set) => ({
    open: false,
    openaiInstance: null,
    setOpenaiInstance: (openaiInstance: any) => set({ openaiInstance }),
    setOpen: (open: boolean) => set({ open }),
    models: [],
    setModels: (models: Model[]) => set({ models }),
    formData: {
        api_token: '',
        context_messages: 30,
        model: 'gpt-4o'
    },
    setFormData: (formData: SettingsFormData) => {
        set({ formData });
    }
}));

export const drawerStore = create<DrawerStore>((set) => ({
    open: true,
    setOpen: (open: boolean) => set({ open }),
}));

export const chatStore = create<ChatStore>((set) => ({
    input: '',
    messages: [],
    images : [],
    isProcessing: false,
    setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),
    setMessages: (messages: any) => set({ messages }),
    setInput: (input: string) => set({ input }),
    setImages: (images: any) => set({ images }),
}))