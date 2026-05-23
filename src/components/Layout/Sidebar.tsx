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
    Typography,
    alpha,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import { ManageAccounts } from '@mui/icons-material';
import {useNavigate, useLocation} from 'react-router-dom';
import {useAuth} from '../../hooks/useAuth';
import {useEffect, useMemo, useState} from 'react';

export const drawerWidth = 260;
export const drawerWidthCollapsed = 78;

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
        text: 'Dashboard',
        icon: <DashboardRoundedIcon />,
        path: '/dashboard',
        permissions: ['PUBLIC'],
    },
    {
        text: 'Users',
        icon: <PeopleAltOutlinedIcon />,
        path: '/users',
        permissions: ['VIEW_USERS'],
    },
    {
        text: 'Roles',
        icon: <AdminPanelSettingsOutlinedIcon />,
        path: '/roles',
        permissions: ['VIEW_ROLES'],
    },
    {
        text: 'Permissions',
        icon: <KeyOutlinedIcon />,
        path: '/permissions',
        permissions: ['VIEW_PERMISSIONS'],
    },
    {
        text: 'Departments',
        icon: <ApartmentOutlinedIcon />,
        path: '/departments',
        permissions: ['VIEW_DEPARTMENTS'],
    },

    {
        text: 'Delegations',
        icon: <ManageAccounts />,
        path: '/delegations',
        permissions: ['PUBLIC'],
    },
    {
        text: 'Vendors',
        icon: <StorefrontOutlinedIcon />,
        path: '/vendors',
        permissions: ['VIEW_VENDOR'],
    },
    {
        text: 'Categories',
        icon: <CategoryOutlinedIcon />,
        path: '/categories',
        permissions: ['VIEW_CATEGORIES'],
    },
    {
        text: 'Inventory',
        icon: <Inventory2OutlinedIcon />,
        permissions: ['PUBLIC'],
        children: [
            {
                text: 'Stock Catalog',
                icon: <Inventory2OutlinedIcon />,
                path: '/inventory',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Add Stock',
                icon: <AddBoxOutlinedIcon />,
                path: '/inventory/stocks/create',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Add Asset',
                icon: <DevicesOutlinedIcon />,
                path: '/inventory/assets/create',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Inventory Categories',
                icon: <CategoryOutlinedIcon />,
                path: '/inventory/categories',
                permissions: ['PUBLIC'],
            },
            {
                text: 'PO Deliveries',
                icon: <LocalShippingOutlinedIcon />,
                path: '/inventory/delivery',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Inventory Requests',
                icon: <AssignmentTurnedInOutlinedIcon />,
                path: '/inventory/requests',
                permissions: ['PUBLIC'],
            },
        ],
    },
    {
        text: 'Procurement',
        icon: <ShoppingCartOutlinedIcon />,
        permissions: ['PUBLIC'],
        children: [
            {
                text: 'Approval Policies',
                icon: <RuleFolderOutlinedIcon />,
                path: '/procurement/approval-policy',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Amount Risk Scores',
                icon: <GppGoodOutlinedIcon />,
                path: '/procurement/risk-score',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Requisitions',
                icon: <ReceiptLongOutlinedIcon />,
                path: '/procurement/requisitions',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Requisition Approvals',
                icon: <AssignmentTurnedInOutlinedIcon />,
                path: '/procurement/requisitions-approvals',
                permissions: ['PUBLIC'],
            },
            {
                text: 'RFQ',
                icon: <RequestQuoteOutlinedIcon />,
                path: '/rfq',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Quotation Approvals',
                icon: <FactCheckOutlinedIcon />,
                path: '/procurement/quotations-approvals',
                permissions: ['PUBLIC'],
            },
            {
                text: 'Purchase Orders',
                icon: <ShoppingCartOutlinedIcon />,
                path: '/procurement/purchase-orders',
                permissions: ['PUBLIC'],
            },
        ],
    },
    {
        text: 'Reports',
        icon: <AssessmentOutlinedIcon />,
        path: '/reports',
        permissions: ['VIEW_REPORTS'],
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

    const hasAccess = (permissions: string[]) =>
        permissions.includes('PUBLIC') || hasPermission(permissions);

    const filteredMenuItems = useMemo(
        () =>
            menuItems
                .filter((item) => hasAccess(item.permissions))
                .map((item) => ({
                    ...item,
                    children: item.children?.filter((child) => hasAccess(child.permissions)),
                }))
                .filter((item) => !item.children || item.children.length > 0),
        [hasPermission]
    );

    const isPathActive = (path?: string) => {
        if (!path) return false;
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const isParentActive = (item: MenuItem) => {
        if (item.path && isPathActive(item.path)) return true;
        return !!item.children?.some((child) => isPathActive(child.path));
    };

    useEffect(() => {
        const nextState: Record<string, boolean> = {};
        filteredMenuItems.forEach((item) => {
            if (item.children?.length && isParentActive(item)) {
                nextState[item.text] = true;
            }
        });
        setOpenMenus((prev) => ({...prev, ...nextState}));
    }, [location.pathname]);

    const toggleMenu = (key: string) => {
        if (collapsed) return;
        setOpenMenus((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleNavigation = (path?: string) => {
        if (!path) return;
        navigate(path);
        onClose();
    };

    const renderMenuButton = (
        item: MenuItem,
        options?: {
            nested?: boolean;
            active?: boolean;
            onClick?: () => void;
            trailing?: JSX.Element | null;
        }
    ) => {
        const nested = options?.nested ?? false;
        const active = options?.active ?? false;
        const onClick = options?.onClick ?? (() => handleNavigation(item.path));
        const trailing = options?.trailing ?? null;

        const button = (
            <ListItemButton
                onClick={onClick}
                sx={{
                    minHeight: nested ? 42 : 48,
                    mx: collapsed ? 1 : 1.5,
                    my: 0.5,
                    px: collapsed ? 1.25 : nested ? 2 : 2,
                    pl: collapsed ? 1.25 : nested ? 4 : 2,
                    borderRadius: 2.5,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    backgroundColor: active ? alpha('#2563EB', 0.14) : 'transparent',
                    color: active ? '#0F172A' : '#64748B',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: active
                            ? alpha('#2563EB', 0.18)
                            : alpha('#94A3B8', 0.10),
                    },
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: collapsed ? 0 : nested ? 34 : 40,
                        mr: collapsed ? 0 : 1,
                        color: active ? '#2563EB' : '#64748B',
                        justifyContent: 'center',
                    }}
                >
                    {item.icon}
                </ListItemIcon>

                {!collapsed && (
                    <>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                fontSize: nested ? 13.5 : 14,
                                fontWeight: active ? 700 : nested ? 500 : 600,
                                color: active ? '#0F172A' : '#334155',
                                fontFamily: 'Inter, sans-serif',
                            }}
                        />
                        {trailing}
                    </>
                )}
            </ListItemButton>
        );

        return collapsed ? (
            <Tooltip title={item.text} placement="right" arrow>
                {button}
            </Tooltip>
        ) : (
            button
        );
    };

    const drawerContent = (isDesktop: boolean) => (
        <>
            <Toolbar
                sx={{
                    minHeight: '72px !important',
                    px: collapsed ? 1 : 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}
            >
                {!collapsed ? (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                boxShadow: '0 8px 20px rgba(0, 86, 210, 0.18)',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="NexusProcure"
                                sx={{
                                    width: 24,
                                    height: 24,
                                    objectFit: 'contain',
                                    filter: 'brightness(0) invert(1)',
                                }}
                            />
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: 15,
                                    fontWeight: 800,
                                    color: '#0F172A',
                                    lineHeight: 1.1,
                                }}
                            >
                                NexusProcure
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: 'Poppins, sans-serif',
                                    fontSize: 11.5,
                                    color: '#94A3B8',
                                    mt: 0.3,
                                }}
                            >
                                Internal Portal
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    <Tooltip title="NexusProcure" placement="right" arrow>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #0056D2 0%, #00A8E8 100%)',
                                boxShadow: '0 8px 20px rgba(0, 86, 210, 0.18)',
                                overflow: 'hidden',
                            }}
                        >
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="NexusProcure"
                                sx={{
                                    width: 22,
                                    height: 22,
                                    objectFit: 'contain',
                                    filter: 'brightness(0) invert(1)',
                                }}
                            />
                        </Box>
                    </Tooltip>
                )}
            </Toolbar>

            <Divider sx={{mx: collapsed ? 1 : 2, opacity: 0.7}} />

            <Box
                sx={{
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    mt: 1.5,
                    height: '100%',
                    pb: 2,
                }}
            >
                <List disablePadding>
                    {filteredMenuItems.map((item) => {
                        const hasChildren = !!item.children?.length;
                        const parentActive = isParentActive(item);
                        const isOpen = openMenus[item.text];

                        if (hasChildren) {
                            return (
                                <ListItem key={item.text} disablePadding sx={{display: 'block'}}>
                                    {renderMenuButton(item, {
                                        active: parentActive,
                                        onClick: () => toggleMenu(item.text),
                                        trailing: !collapsed ? (
                                            isOpen ? (
                                                <ExpandLessRoundedIcon sx={{fontSize: 20, color: '#64748B'}} />
                                            ) : (
                                                <ExpandMoreRoundedIcon sx={{fontSize: 20, color: '#64748B'}} />
                                            )
                                        ) : null,
                                    })}

                                    {!collapsed && (
                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                            <List disablePadding sx={{mt: 0.25}}>
                                                {item.children!.map((child) => {
                                                    const childActive = isPathActive(child.path);

                                                    return (
                                                        <ListItem key={child.text} disablePadding>
                                                            {renderMenuButton(child, {
                                                                nested: true,
                                                                active: childActive,
                                                                onClick: () => handleNavigation(child.path),
                                                            })}
                                                        </ListItem>
                                                    );
                                                })}
                                            </List>
                                        </Collapse>
                                    )}
                                </ListItem>
                            );
                        }

                        return (
                            <ListItem key={item.text} disablePadding sx={{display: 'block'}}>
                                {renderMenuButton(item, {
                                    active: isPathActive(item.path),
                                    onClick: () => handleNavigation(item.path),
                                })}
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{my: 2, mx: collapsed ? 1 : 2, opacity: 0.7}} />

                {isDesktop && (
                    <Box sx={{px: collapsed ? 1 : 1.5}}>
                        <Tooltip
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            placement="right"
                            arrow
                        >
                            <IconButton
                                onClick={onToggleCollapse}
                                sx={{
                                    width: '100%',
                                    borderRadius: 2.5,
                                    py: 1.1,
                                    border: '1px solid',
                                    borderColor: alpha('#CBD5E1', 0.9),
                                    color: '#475569',
                                    backgroundColor: '#FFFFFF',
                                    '&:hover': {
                                        backgroundColor: '#F8FAFC',
                                    },
                                }}
                            >
                                {collapsed ? (
                                    <ChevronRightRoundedIcon />
                                ) : (
                                    <ChevronLeftRoundedIcon />
                                )}
                            </IconButton>
                        </Tooltip>
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
                ModalProps={{keepMounted: true}}
                sx={{
                    display: {xs: 'block', sm: 'none'},
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        borderRight: '1px solid #E2E8F0',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                    },
                }}
            >
                {drawerContent(false)}
            </Drawer>

            <Drawer
                variant="permanent"
                open
                sx={{
                    display: {xs: 'none', sm: 'block'},
                    width: collapsed ? drawerWidthCollapsed : drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: collapsed ? drawerWidthCollapsed : drawerWidth,
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                        transition: 'width 0.25s ease',
                        borderRight: '1px solid #E2E8F0',
                        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
                    },
                }}
            >
                {drawerContent(true)}
            </Drawer>
        </>
    );
};