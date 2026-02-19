import {Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress} from '@mui/material';
import {ReactNode} from 'react';

interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
    children: ReactNode;
    loading?: boolean;
    color?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
}

export const Button = ({children, loading, disabled, color = 'primary', ...props}: ButtonProps) => {
    return (
        <MuiButton
            {...props}
            color={color}
            disabled={disabled || loading}
            sx={{
                textTransform: 'none',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: '14px',
                borderRadius: '8px',
                padding: '10px 24px',
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: 'none',
                },
                ...props.sx,
            }}
        >
            {loading ? <CircularProgress size={20} color="inherit"/> : children}
        </MuiButton>
    );
};


