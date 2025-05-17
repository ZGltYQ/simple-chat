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

export type FunctionData = {
    name: string;
    description: string;
    params: string;
    active: boolean;
    handler: string;
    id?: string | number;
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
    system_message: string;
}

type SnackbarStore = {
    open: boolean;
    message: string;
    openSnackbar: ({ open, message }: { open: boolean; message: string }) => void
}

type SettingsStore = {
    open: boolean;
    setOpen: (open: boolean) => void;
    formData: SettingsFormData;
    setFormData: (updates: Partial<SettingsFormData>) => void;
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

type Functions = {
    formData: FunctionData;
    list: FunctionData[];
    setList: (list: FunctionData[]) => void
    setFormData: (data: Partial<FunctionData>) => void
    resetFormData: () => void
}

export type TopicsStore = {
    topics: Topic[];
    editingTopic: string | null;
    selected: Selected;
    setSelected: (selected: Selected) => void;
    setEditingTopic: (editingId: string | null) => void;
    setTopics: (topics: Topic[]) => void;
};

export const functionsStore = create<Functions>((set, get) => ({
    formData : {
        name: '',
        description: '',
        active: false,
        params: '',
        handler: '',
    },
    list : [],
    setList: (list: FunctionData[]) => set({ list }),
    resetFormData: () => set({ formData: { name: '', active: false, description: '', params: '', handler: '' } }),
    setFormData: (data: Partial<Functions>) => {
        set((state) => ({
            formData: {
                ...state.formData,
                ...data
            }
        }));
    }
}))

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
    setOpen: (open: boolean) => set({ open }),
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
    isProcessing: false,
    setIsProcessing: (isProcessing: boolean) => set({ isProcessing }),
    setMessages: (messages: any) => set({ messages }),
    setInput: (input: string) => set({ input }),
    setImages: (images: any) => set({ images }),
}))