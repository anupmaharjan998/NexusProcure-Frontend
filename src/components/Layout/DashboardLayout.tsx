import {Box, Toolbar} from '@mui/material';
import {ReactNode, useState} from 'react';
import {Navbar} from './Navbar.tsx';
import {Sidebar, drawerWidth, drawerWidthCollapsed} from './Sidebar.tsx';

interface DashboardLayoutProps {
    children: ReactNode;
}

export const DashboardLayout = ({children}: DashboardLayoutProps) => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleToggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    return (
        <Box sx={{display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC'}}>
            <Navbar onMenuClick={handleDrawerToggle}/>
            <Sidebar
                open={mobileOpen}
                onClose={handleDrawerToggle}
                collapsed={collapsed}
                onToggleCollapse={handleToggleCollapse}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: {
                        xs: '100%',
                        sm: collapsed ? `calc(100% - ${drawerWidthCollapsed}px)` : `calc(100% - ${drawerWidth}px)`
                    },
                    ml: {
                        xs: 0,
                        sm: collapsed ? `${drawerWidthCollapsed}px` : `70px`
                    },
                    transition: 'margin 0.3s ease, width 0.3s ease',
                }}
            >
                <Toolbar/>
                {children}
            </Box>
        </Box>
    );
};

