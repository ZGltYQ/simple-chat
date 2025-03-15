import OpenSettingsButton from "@/features/openSettingsButton"
import { AppBar, Dialog, List, Toolbar } from "@mui/material"
import Transition from "@/shared/ui/transition";
import { useStore } from "zustand"
import { settingsStore } from "@/app/store"
import CloseSettingsButton from "@/features/closeSettingsButton";
import SaveSettingsButton from "@/features/saveSettingsButton";
import OpenAI from "openai";
import InputOpenAiToken from "@/features/inputOpenAiToken";
import ContextMessagesSlider from "@/features/contextMessagesSlider";
import ListOpenAIModels from "@/features/listOpenAiModels";
import SystemMessageField from "@/features/systemMessageField";
import { useEffect } from "react";

export default function Settings() {
    const open = useStore(settingsStore, (state) => state.open);
    const setOpen = useStore(settingsStore, (state) => state.setOpen);
    const setFormData = useStore(settingsStore, (state) => state.setFormData);
    const token = useStore(settingsStore, (state) => state.formData?.api_token);
    const setOpenaiInstance = useStore(settingsStore, state => state.setOpenaiInstance);
    const openaiInstance = useStore(settingsStore, state => state.openaiInstance);
    const models = useStore(settingsStore, state => state.models);
    const setModels = useStore(settingsStore, state => state.setModels);

    useEffect(() => {
        setOpenaiInstance(new OpenAI({ 
            dangerouslyAllowBrowser: true,
            apiKey: token
        }))
    }, [ token ])

    useEffect(() => {
        (async () => {
            if (openaiInstance?.apiKey?.length && !models?.length) {
                const { data } = await openaiInstance.models.list();

                setModels(data.map((model: any) => ({ value: model?.id, label: model?.id })));
            }
        })();
    }, [ openaiInstance ])
    
    useEffect(() => {
        (async () => {
            const settings = await window.ipcRenderer.invoke('getSettings');
        
            if (settings) setFormData(settings);
        })()
    }, [ open ])

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
                    <InputOpenAiToken />
                    <ContextMessagesSlider/>
                    <ListOpenAIModels/>
                    <SystemMessageField/>
                </List>
            </Dialog>
        </>
    )
}