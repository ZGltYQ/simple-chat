import Select from '@/shared/ui/select';
import { DEFAULT_SOURCES } from '@/app/config';
import { useStore } from 'zustand';
import { settingsStore } from '@/app/store';

export default function SourceDropdown() {
    const source = useStore(settingsStore, state => state.formData.source);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    async function handleChange(event: React.ChangeEvent<{ value: string }>) {
        await window.ipcRenderer.invoke('updateSettingsSource', event.target.value);

        setFormData({ source: event.target.value })
    }

    return (
        <Select label={'Source'} options={DEFAULT_SOURCES} value={source} onChange={handleChange} />
    )
}