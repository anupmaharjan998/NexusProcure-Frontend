import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box,
    Divider,
    IconButton,
    Tooltip,
    Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CategoryIcon from '@mui/icons-material/Category';
import {useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useState} from 'react';

export const drawerWidth = 240;
export const drawerWidthCollapsed = 70;

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

interface MenuItem {
    text: string;
    icon: JSX.Element;
    path?: string;
    permissions: string[];
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    {
        text: "Dashboard",
        icon: <DashboardIcon/>,
        path: "/dashboard",
        permissions: ["PUBLIC"],
    },
    {
        text: "Users",
        icon: <PeopleIcon/>,
        path: "/users",
        permissions: ["VIEW_USERS"],
    },
    {
        text: "Roles",
        icon: <SecurityIcon/>,
        path: "/roles",
        permissions: ["VIEW_ROLES"],
    },
    {
        text: "Permissions",
        icon: <VpnKeyIcon/>,
        path: "/permissions",
        permissions: ["VIEW_PERMISSIONS"],
    },
    {
        text: "Departments",
        icon: <BusinessIcon/>,
        path: "/departments",
        permissions: ["VIEW_DEPARTMENTS"],
    },
    {
        text: "Vendors",
        icon: <StorefrontIcon/>,
        path: "/vendors",
        permissions: ["VIEW_VENDOR"],
    },
    {
        text: "Categories",
        icon: <CategoryIcon/>,
        path: "/categories",
        permissions: ["VIEW_CATEGORIES"],
    },
    {
        text: "Inventory",
        icon: <InventoryIcon/>,
        permissions: ["PUBLIC"],
        children: [
            {
                text: "Inventory",
                icon: <InventoryIcon/>,
                path: "/inventory",
                permissions: ["PUBLIC"]
            },
            {
                text: "Categories",
                icon: <CategoryIcon/>,
                path: "/inventory/categories",
                permissions: ["PUBLIC"],
            },
        ]
    },
    {
        text: "Procurement",
        icon: <ShoppingCartIcon/>,
        permissions: ["PUBLIC"],
        children: [
            {
                text: "Approval Policies",
                icon: <SecurityIcon/>,
                path: "/procurement/approval-policy",
                permissions: ["PUBLIC"],
            },
            {
                text: "Amount Risk Scores",
                icon: <SecurityIcon/>,
                path: "/procurement/risk-score",
                permissions: ["PUBLIC"],
            },
            {
                text: "Requisitions",
                icon: <ShoppingCartIcon/>,
                path: "/procurement/requisitions",
                permissions: ["PUBLIC"],
            },
            {
                text: "Requisitions Approval",
                icon: <ShoppingCartIcon/>,
                path: "/procurement/requisitions-approvals",
                permissions: ["PUBLIC"],
            },
            {
                text: "RFQ",
                icon: <InventoryIcon/>,
                path: "/rfq",
                permissions: ["PUBLIC"],
            },
            {
                text: "Quotations Approval",
                icon: <ShoppingCartIcon/>,
                path: "/procurement/quotations-approvals",
                permissions: ["PUBLIC"],
            },
            {
                text: "Purchase Orders",
                icon: <InventoryIcon/>,
                path: "/procurement/purchase-orders",
                permissions: ["PUBLIC"],
            },
        ],
    },
    {
        text: "Reports",
        icon: <AssessmentIcon/>,
        path: "/reports",
        permissions: ["VIEW_REPORTS"],
    },
];

export const Sidebar = ({
                            open,
                            onClose,
                            collapsed,
                            onToggleCollapse,
                        }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {hasPermission} = useAuth();

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleNavigation = (path?: string) => {
        if (!path) return;
        navigate(path);
        onClose();
    };

    const filteredMenuItems = menuItems.filter(item =>
        item.permissions.includes("PUBLIC") || hasPermission(item.permissions)
    );

    const drawerContent = (isDesktop: boolean) => (
        <>
            <Toolbar/>
            <Box sx={{overflow: 'auto', mt: 2, height: '100%'}}>
                <List>
                    {filteredMenuItems.map(item => {
                        const hasChildren = !!item.children?.length;
                        const isOpen = openMenus[item.text];
                        const isActive = location.pathname === item.path;

                        if (hasChildren) {
                            return (
                                <ListItem key={item.text} disablePadding>
                                    <Box sx={{width: '100%'}}>
                                        <ListItemButton
                                            onClick={() => toggleMenu(item.text)}
                                            sx={{
                                                justifyContent: collapsed ? 'center' : 'space-between',
                                                borderRadius: '8px',
                                                px: collapsed ? 1 : 2,
                                            }}
                                        >
                                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                                                <ListItemIcon sx={{minWidth: 40}}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                {!collapsed && (
                                                    <ListItemText primary={item.text}/>
                                                )}
                                            </Box>
                                            {!collapsed && (
                                                isOpen ? <ExpandLessIcon/> : <ExpandMoreIcon/>
                                            )}
                                        </ListItemButton>

                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                            <List component="div" disablePadding>
                                                {item.children!
                                                    .filter(child =>
                                                        child.permissions.includes("PUBLIC") ||
                                                        hasPermission(child.permissions)
                                                    )
                                                    .map(child => (
                                                        <ListItemButton
                                                            key={child.text}
                                                            sx={{
                                                                pl: collapsed ? 2 : 6,
                                                                borderRadius: '8px',
                                                            }}
                                                            onClick={() => handleNavigation(child.path)}
                                                        >
                                                            <ListItemIcon sx={{minWidth: 36}}>
                                                                {child.icon}
                                                            </ListItemIcon>
                                                            {!collapsed && (
                                                                <ListItemText primary={child.text}/>
                                                            )}
                                                        </ListItemButton>
                                                    ))}
                                            </List>
                                        </Collapse>
                                    </Box>
                                </ListItem>
                            );
                        }

                        return (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        borderRadius: '8px',
                                        backgroundColor: isActive ? '#EBF5FF' : 'transparent',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                    }}
                                >
                                    <ListItemIcon sx={{minWidth: 40}}>
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText primary={item.text}/>
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{my: 2}}/>

                {isDesktop && (
                    <Box sx={{p: collapsed ? 0.5 : 2}}>
                        <IconButton
                            onClick={onToggleCollapse}
                            sx={{width: '100%'}}
                        >
                            {collapsed ? <ChevronRightIcon/> : <ChevronLeftIcon/>}
                        </IconButton>
                    </Box>
                )}
            </Box>
        </>
    );

    return (
        <>
            <Drawer
                variant="temporary"
                open={open}
                onClose={onClose}
                sx={{display: {xs: 'block', sm: 'none'}}}
            >
                {drawerContent(false)}
            </Drawer>

            <Drawer
                variant="permanent"
                sx={{
                    display: {xs: 'none', sm: 'block'},
                    width: collapsed ? drawerWidthCollapsed : drawerWidth,
                }}
                open
            >
                {drawerContent(true)}
            </Drawer>
        </>
    );
};
