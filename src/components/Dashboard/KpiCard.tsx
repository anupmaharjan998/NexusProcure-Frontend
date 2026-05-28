import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

type KpiCardProps = {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
};

export const KpiCard = ({ label, value, icon, color }: KpiCardProps) => {
    return (
        <Card
            sx={{
                borderRadius: 3,
                height: '100%',
                transition: '0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }
            }}
        >
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography color="text.secondary" fontSize={14}>
                            {label}
                        </Typography>

                        <Typography variant="h5" fontWeight={700}>
                            {value}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            background: `${color}20`,
                            p: 1.5,
                            borderRadius: 2,
                            color
                        }}
                    >
                        {icon}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};