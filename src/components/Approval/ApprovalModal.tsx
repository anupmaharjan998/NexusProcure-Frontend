// src/components/Approval/ApprovalModal.tsx
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem} from '@mui/material';
import {Controller, useForm} from 'react-hook-form';
import {ApprovalRequest} from '../../types/approval';

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: ApprovalRequest) => Promise<void>;
}

export const ApprovalModal = ({open, onClose, onSubmit}: Props) => {
    const {control, handleSubmit} = useForm<ApprovalRequest>({
        defaultValues: {decision: 'Approved', approverId: '', roleId: '', comments: ''},
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Approve / Reject Requisition</DialogTitle>
            <DialogContent>
                <Controller
                    name="decision"
                    control={control}
                    render={({field}) => (
                        <TextField select label="Decision" fullWidth margin="normal" {...field}>
                            <MenuItem value="Approved">Approve</MenuItem>
                            <MenuItem value="Rejected">Reject</MenuItem>
                        </TextField>
                    )}
                />
                <Controller
                    name="comments"
                    control={control}
                    render={({field}) => (
                        <TextField label="Comments" fullWidth multiline rows={3} margin="normal" {...field} />
                    )}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit(onSubmit)}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
};
