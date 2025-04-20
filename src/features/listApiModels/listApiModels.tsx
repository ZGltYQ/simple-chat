import Select from '@/shared/ui/select';
import { useStore } from 'zustand';
import { settingsStore } from '@/app/store';
import { DEFAULT_MODELS } from '@/app/config';
import React from 'react';

export default function ListApiModels() {
    const model = useStore(settingsStore, state => state.formData?.model);
    const source = useStore(settingsStore, state => state.formData?.source);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
        setFormData({ model: event.target.value })
    };

    return <Select label="OpenAI Models" options={DEFAULT_MODELS?.[source] || []} value={model} onChange={handleChange}/>
}