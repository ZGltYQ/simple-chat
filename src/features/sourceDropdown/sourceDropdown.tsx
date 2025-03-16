import Select from '@/shared/ui/select';
import { DEFAULT_SOURCES } from '@/app/config';
import { useStore } from 'zustand';
import { settingsStore } from '@/app/store';

export default function SourceDropdown() {
    const formData = useStore(settingsStore, state => state.formData);
    const setFormData = useStore(settingsStore, state => state.setFormData);

    function handleChange(event: React.ChangeEvent<{ value: string }>) {
        setFormData({ ...formData, source: event.target.value })
    }

    return (
        <Select label={'Source'} options={DEFAULT_SOURCES} value={formData.source} onChange={handleChange} />
    )
}