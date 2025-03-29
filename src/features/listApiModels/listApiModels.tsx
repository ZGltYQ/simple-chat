import Select from '@/shared/ui/select';
import { useStore } from 'zustand';
import { settingsStore } from '@/app/store';
import React from 'react';

export default function ListApiModels() {
    const model = useStore(settingsStore, state => state.formData?.model);
    const setFormData = useStore(settingsStore, state => state.setFormData);
    const models = useStore(settingsStore, state => state.models);

    const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
        setFormData({ model: event.target.value })
    };

    return <Select label="OpenAI Models" options={models} value={model} onChange={handleChange}/>
}