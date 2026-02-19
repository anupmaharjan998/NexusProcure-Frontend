import {TextField, TextFieldProps} from '@mui/material';
import {forwardRef} from 'react';

type InputProps = TextFieldProps;

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    return (
        <TextField
            {...props}
            inputRef={ref}
            fullWidth
            variant="outlined"
            sx={{
                '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    '& fieldset': {
                        borderColor: '#E2E8F0',
                    },
                    '&:hover fieldset': {
                        borderColor: '#0056D2',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: '#0056D2',
                    },
                },
                '& .MuiInputLabel-root': {
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                },
                ...props.sx,
            }}
        />
    );
});

Input.displayName = 'Input';


