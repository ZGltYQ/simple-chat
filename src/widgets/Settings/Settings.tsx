import OpenSettingsButton from "@/features/openSettingsButton"
import { AppBar, Dialog, List, Toolbar } from "@mui/material"
import Transition from "@/shared/ui/transition";
import { useStore } from "zustand"
import { functionsStore, settingsStore } from "@/app/store"
import CloseSettingsButton from "@/features/closeSettingsButton";
import SaveSettingsButton from "@/features/saveSettingsButton";
import InputApiToken from "@/features/inputApiToken";
import SourceDropdown from "@/features/sourceDropdown";
import ContextMessagesSlider from "@/features/contextMessagesSlider";
import ListApiModels from "@/features/listApiModels";
import UploadLocalModel   from "@/features/uploadLocalModel";
import SystemMessageField from "@/features/systemMessageField";
import GPULayersSlider from "@/features/gpuLayersSlider";
import ContextSizeSlider from "@/features/contextSizeSlider";
import BatchSizeSlider from "@/features/batchSizeSlider";
import FunctionCallingField from "@/features/functionCallingField";
import ThreadsSlider from "@/features/threadsSlider";
import { useEffect } from "react";

export default function Settings() {
    const open = useStore(settingsStore, (state) => state.open);
    const setOpen = useStore(settingsStore, (state) => state.setOpen);
    const setFormData = useStore(settingsStore, (state) => state.setFormData);
    const source = useStore(settingsStore, (state) => state.formData?.source);
    const setList = useStore(functionsStore, state => state.setList);


    useEffect(() => {
        (async () => {
            const functions = await window.ipcRenderer.invoke('getFunctions');
            
            if (functions) setList(functions);
        })()
    }, [ ])
    
    useEffect(() => {
        (async () => {
            const settings = await window.ipcRenderer.invoke('getSettings');

            if (settings) setFormData(settings);
        })()
    }, [ source ])

    const renderSourceFields = (source: string) => {
        switch (source) {
            case 'openai':
                return (
                    <>
                        <SourceDropdown/>
                        <InputApiToken />
                        <ContextMessagesSlider/>
                        <ListApiModels/>
                        <SystemMessageField/>
                        <FunctionCallingField/>
                    </>
                )
            case 'deepseek':
                return (
                    <>
                        <SourceDropdown/>
                        <InputApiToken />
                        <ContextMessagesSlider/>
                        <ListApiModels/>
                        <SystemMessageField/>
                        <FunctionCallingField/>
                    </>
                )
            case 'local':
                return (
                    <>
                        <SourceDropdown/>
                        <UploadLocalModel/>
                        <ContextMessagesSlider/>
                        <SystemMessageField/>
                        <GPULayersSlider/>
                        <ContextSizeSlider/>
                        <BatchSizeSlider/>
                        <ThreadsSlider/>
                        <FunctionCallingField/>
                    </>
                )
            default:
                return null
        }
    }

    return (
        <>
            <OpenSettingsButton />
            <Dialog
                fullScreen
                open={open}
                onClose={() => setOpen(false)}
                TransitionComponent={Transition}
            >
                <AppBar sx={{ position: 'relative' }}>
                    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <CloseSettingsButton />
                        <SaveSettingsButton />
                    </Toolbar>
                </AppBar>
                <List sx={{ margin: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {renderSourceFields(source)}
                </List>
            </Dialog>
        </>
    )
}