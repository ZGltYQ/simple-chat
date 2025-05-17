import { useState } from 'react';
import { functionsStore } from '@/app/store';
import { useStore } from 'zustand';
import VirtualizedList from '@/shared/ui/virtualizedList';
import EditorComponent from '@/shared/ui/editor';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';


export default function FunctionCallingField() {
    const functions = useStore(functionsStore, state => state.list);
    const formData = useStore(functionsStore, state => state.formData);
    const setList = useStore(functionsStore, state => state.setList);
    const setFormData = useStore(functionsStore, state => state.setFormData);
    const resetFormData = useStore(functionsStore, state => state.resetFormData);

    const [ open, setOpen ] = useState(false);
    const [ errors, setErrors ] = useState<Record<string, string>>({});

    const getList = async () => {
        const functions = await window.ipcRenderer.invoke('getFunctions');

        if (functions) setList(functions);
    }

    const handleDelete = async (id: number | string | undefined) => {
        await window.ipcRenderer.invoke('deleteFunction', id);

        await getList();
    }

    const handleClose = () => {
        setOpen(false);
        resetFormData();
        setErrors({});
    };

    const handleOpen = (data?: any | undefined) => {
        if (data) setFormData(data);

        setOpen(true);
    }

    const handleCreate = async () => {
        const {errors} = await window.ipcRenderer.invoke('createFunction', formData);

        if (errors) return setErrors(errors);
 
        await getList();

        setOpen(false);
        resetFormData();
        setErrors({});
    }

    const handleEdit = async () => {    
        await window.ipcRenderer.invoke('updateFunction', formData);

        await getList();

        setOpen(false);
        resetFormData();
        setErrors({});
    }

    const handleToggle = async (id: number | string | undefined) => {
        await window.ipcRenderer.invoke('toggleFunction', id);

        const functions = await window.ipcRenderer.invoke('getFunctions');

        if (functions) setList(functions);
    }

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
            >
                <DialogTitle>{formData?.id ? 'Edit' : 'Create'}</DialogTitle>
                <DialogContent dividers sx={{
                    '& .MuiTextField-root': { mb: 2 }, // Space between text fields
                    '& .MuiBox-root': { mb: 3 },      // Space around editor components
                    py: 2,                            // Vertical padding for dialog content
                    px: 3                             // Horizontal padding for dialog content
                }}>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        value={formData?.name}
                        onChange={({ target }) => setFormData({ name: target?.value })}
                        error={!!errors?.name}
                        fullWidth
                        variant="standard"
                    />
                    <TextField
                        required
                        margin="dense"
                        id="description"
                        name="description"
                        label="Description"
                        onChange={({ target }) => setFormData({ description: target?.value })}
                        value = {formData?.description}
                        multiline
                        fullWidth
                        error={!!errors?.description}
                        variant="standard"
                    />
                    <EditorComponent
                        error={errors?.params}
                        label='Params'
                        value={formData?.params} 
                        onChange={(code: string) => setFormData({ params: code })} 
                    />
                    <EditorComponent
                        error={errors?.handler}
                        label='Handler'
                        value={formData?.handler} 
                        onChange={(code: string) => setFormData({ handler: code })} 
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={formData?.id ? handleEdit : handleCreate}>Save</Button>
                </DialogActions>
            </Dialog>
            <VirtualizedList
                title='Functions'
                items={functions}
                onCreate={handleOpen}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onEdit={handleOpen}
            />
        </>
    );
}