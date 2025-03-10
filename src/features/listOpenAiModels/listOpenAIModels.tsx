import Select from '@/shared/ui/select';
import { useStore } from 'zustand';
import { settingsStore } from '@/app/store';
import React, { useState, useEffect } from 'react';

export default function ListOpenAIModels() {
    const openaiInstance = useStore(settingsStore, state => state.openaiInstance);
    const model = useStore(settingsStore, state => state.formData?.model);
    const setFormData = useStore(settingsStore, state => state.setFormData);
    const formDate = useStore(settingsStore, state => state.formData);
    const models = useStore(settingsStore, state => state.models);

    const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
        setFormData({ ...formDate, model: event.target.value })
    };

    return <Select label="OpenAI Models" options={models} value={model} onChange={handleChange}/>
}