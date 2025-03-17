import OpenSettingsButton from "@/features/openSettingsButton"
import { AppBar, Dialog, List, Toolbar } from "@mui/material"
import Transition from "@/shared/ui/transition";
import { useStore } from "zustand"
import { settingsStore } from "@/app/store"
import CloseSettingsButton from "@/features/closeSettingsButton";
import SaveSettingsButton from "@/features/saveSettingsButton";
import OpenAI from "openai";
import InputApiToken from "@/features/inputApiToken";
import SourceDropdown from "@/features/sourceDropdown";
import ContextMessagesSlider from "@/features/contextMessagesSlider";
import ListOpenAIModels from "@/features/listApiModels";
import SystemMessageField from "@/features/systemMessageField";
import { useEffect } from "react";

export default function Settings() {
    const open = useStore(settingsStore, (state) => state.open);
    const setOpen = useStore(settingsStore, (state) => state.setOpen);
    const setFormData = useStore(settingsStore, (state) => state.setFormData);
    const token = useStore(settingsStore, (state) => state.formData?.api_token);
    const source = useStore(settingsStore, (state) => state.formData?.source);
    const setOpenaiInstance = useStore(settingsStore, state => state.setOpenaiInstance);
    const openaiInstance = useStore(settingsStore, state => state.openaiInstance);
    const setModels = useStore(settingsStore, state => state.setModels);

    useEffect(() => {
        const sources: Record<string, () => void> = {
            openai: () => {
                setOpenaiInstance(new OpenAI({ 
                    dangerouslyAllowBrowser: true,
                    apiKey: token
                }))
            },
            deepseek : () => {
                setOpenaiInstance(new OpenAI({ 
                    dangerouslyAllowBrowser: true,
                    baseURL: 'https://api.deepseek.com',
                    apiKey: token
                }))
            }
        }
        
        sources?.[source]();
    }, [ token, source ])

    useEffect(() => {
        (async () => {
            if (openaiInstance?.apiKey?.length) {
                const { data } = await openaiInstance.models.list();

                setModels(data.map((model: any) => ({ value: model?.id, label: model?.id })));
            }
        })();
    }, [ openaiInstance, source ]);
    
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
                    <SourceDropdown/>
                    <InputApiToken />
                    <ContextMessagesSlider/>
                    <ListOpenAIModels/>
                    <SystemMessageField/>
                </List>
            </Dialog>
        </>
    )
}