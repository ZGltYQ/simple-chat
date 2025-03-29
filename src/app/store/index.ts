import { create } from 'zustand'
import { MODELS } from '../config';

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
    source: string;
    api_token: string;
    context_messages: number;
    model: string;
    gpu_layers: number;
    context_size: number;
    batch_size: number;
    threads: number;
    system_message: string
}

type SnackbarStore = {
    open: boolean;
    message: string;
    openSnackbar: ({ open, message }: { open: boolean; message: string }) => void
}

type SettingsStore = {
    open: boolean;
    setOpen: (open: boolean) => void;
    openaiInstance: any;
    setOpenaiInstance: (openaiInstance: any) => void;
    formData: SettingsFormData;
    models: Model[];
    setModels: (models: Model[]) => void;
    setFormData: (updates: Partial<SettingsFormData>) => void;
}

type ChatStore = {
    input: string;
    messages: any[];
    images: string[];
    isProcessing: boolean;
    streamedMessage: any;
    setStreamedMessage: (streamedMessage: any) => void;
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
        source : MODELS.OPENAI,
        api_token: '',
        context_messages: 30,
        gpu_layers: 35,
        context_size: 8192,
        batch_size: 512,
        threads: 6,
        model: 'gpt-4o',
        system_message: ''
    },
    setFormData: (updates: Partial<SettingsFormData>) => {
        set((state) => ({
            formData: {
                ...state.formData,
                ...updates
            }
        }));
    }
}));

export const drawerStore = create<DrawerStore>((set) => ({
    open: true,
    setOpen: (open: boolean) => set({ open }),
}));

export const snackbarStore = create<SnackbarStore>((set) => ({
    open: false,
    message: '',
    openSnackbar: ({ open, message }: { open: boolean; message: string }) => set({ open, message }),
}))

export const chatStore = create<ChatStore>((set) => ({
    input: '',
    messages: [],
    images : [],
    streamedMessage: '',
    setStreamedMessage: (streamedMessage: any) => set((state) => ({ 
        streamedMessage: {
            ...state.streamedMessage,
            ...streamedMessage,
            text: state.streamedMessage.text + streamedMessage.text
        }
    })),
    isProcessing: false,
    setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),
    setMessages: (messages: any) => set({ messages }),
    setInput: (input: string) => set({ input }),
    setImages: (images: any) => set({ images }),
}))