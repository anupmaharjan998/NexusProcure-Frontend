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
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';

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
        text: 'Administration',
        icon: <AdminPanelSettingsOutlinedIcon />,
        permissions: ['VIEW_USERS', 'VIEW_ROLES', 'VIEW_PERMISSIONS', 'VIEW_DEPARTMENTS', 'DELEGATION', 'MANAGE_DELEGATION'],
        children: [
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
                icon: <ManageAccountsOutlinedIcon />,
                path: '/delegations',
                permissions: ['DELEGATION', 'MANAGE_DELEGATION'],
            },
        ],
    },
    {
        text: 'Vendors',
        icon: <StorefrontOutlinedIcon />,
        path: '/vendors',
        permissions: ['VIEW_VENDOR'],
    },
    {
        text: 'Policy & Risk',
        icon: <RuleFolderOutlinedIcon />,
        permissions: ['VIEW_POLICIES'],
        children: [
            {
                text: 'Approval Policies',
                icon: <RuleFolderOutlinedIcon />,
                path: '/procurement/approval-policy',
                permissions: ['VIEW_POLICIES'],
            },
            {
                text: 'Risk Score Rules',
                icon: <GppGoodOutlinedIcon />,
                path: '/procurement/risk-score',
                permissions: ['VIEW_POLICIES'],
            },
        ],
    },
    {
        text: 'Inventory',
        icon: <Inventory2OutlinedIcon />,
        permissions: ['VIEW_INVENTORY'],
        children: [
            {
                text: 'Inventory Items',
                icon: <Inventory2OutlinedIcon />,
                path: '/inventory',
                permissions: ['VIEW_INVENTORY'],
            },
            {
                text: 'Inventory Categories',
                icon: <CategoryOutlinedIcon />,
                path: '/inventory/categories',
                permissions: ['VIEW_INVENTORY'],
            },
            {
                text: 'Purchase Order Receiving',
                icon: <LocalShippingOutlinedIcon />,
                path: '/inventory/delivery',
                permissions: ['VIEW_INVENTORY'],
            },
        ],
    },
    {
        text: 'Inventory Requests',
        icon: <AssignmentTurnedInOutlinedIcon />,
        permissions: ['REQUEST_ASSET', 'REQUEST_ASSET_APPROVAL'],
        children: [
            {
                text: 'Create Inventory Request',
                icon: <AddBoxOutlinedIcon />,
                path: '/inventory-requests/new',
                permissions: ['REQUEST_ASSET'],
            },
            {
                text: 'My Inventory Requests',
                icon: <ReceiptLongOutlinedIcon />,
                path: '/inventory-requests/my',
                permissions: ['REQUEST_ASSET'],
            },
            {
                text: 'Manager Approvals',
                icon: <FactCheckOutlinedIcon />,
                path: '/inventory-requests/manager-pending',
                permissions: ['REQUEST_ASSET_APPROVAL'],
            },
            {
                text: 'Inventory Fulfillment',
                icon: <Inventory2OutlinedIcon />,
                path: '/inventory-requests/inventory-pending',
                permissions: ['ASSIGN_ASSET'],
            },
            {
                text: 'Shortage Decisions',
                icon: <FactCheckOutlinedIcon />,
                path: '/inventory-requests/shortage-decisions',
                permissions: ['REQUEST_ASSET_APPROVAL'],
            },
        ],
    },
    {
        text: 'Procurement',
        icon: <ShoppingCartOutlinedIcon />,
        permissions: ['CREATE_REQUISITION', 'APPROVE_REQUISITION', 'RECEIVE_PURCHASE_ORDER'],
        children: [
            {
                text: 'Requisitions',
                icon: <ReceiptLongOutlinedIcon />,
                path: '/procurement/requisitions',
                permissions: ['CREATE_REQUISITION'],
            },
            {
                text: 'Requisition Approvals',
                icon: <AssignmentTurnedInOutlinedIcon />,
                path: '/procurement/requisitions-approvals',
                permissions: ['APPROVE_REQUISITION'],
            },
            {
                text: 'RFQs',
                icon: <RequestQuoteOutlinedIcon />,
                path: '/rfq',
                permissions: ['CREATE_REQUISITION'],
            },
            {
                text: 'Quotation Approvals',
                icon: <FactCheckOutlinedIcon />,
                path: '/procurement/quotations-approvals',
                permissions: ['APPROVE_REQUISITION'],
            },
            {
                text: 'Purchase Orders',
                icon: <ShoppingCartOutlinedIcon />,
                path: '/procurement/purchase-orders',
                permissions: ['RECEIVE_PURCHASE_ORDER'],
            },
            {
                text: 'Procurement Requests',
                icon: <AssignmentOutlinedIcon />,
                path: '/procurement/requests',
                permissions: ['CREATE_REQUISITION'],
            },
        ],
    },
    {
        text: 'Reports & Analytics',
        icon: <AssessmentOutlinedIcon />,
        permissions: ['VIEW_REPORTS'],
        children: [
            {
                text: 'Reports Dashboard',
                icon: <DashboardRoundedIcon />,
                path: '/reports',
                permissions: ['VIEW_REPORTS'],
            },
            {
                text: 'Purchase Orders Report',
                icon: <ReceiptLongOutlinedIcon />,
                path: '/reports/purchase-orders',
                permissions: ['VIEW_REPORTS'],
            },
            {
                text: 'Inventory Reports',
                icon: <InventoryOutlinedIcon />,
                path: '/reports/inventory',
                permissions: ['VIEW_REPORTS'],
            },
            {
                text: 'Spending Analytics',
                icon: <PaidOutlinedIcon />,
                path: '/reports/spending',
                permissions: ['VIEW_REPORTS'],
            },
        ],
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
    const { hasPermission } = useAuth();

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

        setOpenMenus((prev) => ({
            ...prev,
            ...nextState,
        }));
    }, [location.pathname, filteredMenuItems]);

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
                            : alpha('#94A3B8', 0.1),
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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

            <Divider sx={{ mx: collapsed ? 1 : 2, opacity: 0.7 }} />

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
                                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                    {renderMenuButton(item, {
                                        active: parentActive,
                                        onClick: () => toggleMenu(item.text),
                                        trailing: !collapsed ? (
                                            isOpen ? (
                                                <ExpandLessRoundedIcon
                                                    sx={{ fontSize: 20, color: '#64748B' }}
                                                />
                                            ) : (
                                                <ExpandMoreRoundedIcon
                                                    sx={{ fontSize: 20, color: '#64748B' }}
                                                />
                                            )
                                        ) : null,
                                    })}

                                    {!collapsed && (
                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                            <List disablePadding sx={{ mt: 0.25 }}>
                                                {item.children!.map((child) => {
                                                    const childActive = isPathActive(child.path);

                                                    return (
                                                        <ListItem key={child.text} disablePadding>
                                                            {renderMenuButton(child, {
                                                                nested: true,
                                                                active: childActive,
                                                                onClick: () =>
                                                                    handleNavigation(child.path),
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
                            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                {renderMenuButton(item, {
                                    active: isPathActive(item.path),
                                    onClick: () => handleNavigation(item.path),
                                })}
                            </ListItem>
                        );
                    })}
                </List>

                <Divider sx={{ my: 2, mx: collapsed ? 1 : 2, opacity: 0.7 }} />

                {isDesktop && (
                    <Box sx={{ px: collapsed ? 1 : 1.5 }}>
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
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
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
                    display: { xs: 'none', sm: 'block' },
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