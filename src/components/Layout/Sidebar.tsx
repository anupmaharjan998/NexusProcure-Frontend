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
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import { ROLE_TYPES } from '../../types/Role.ts';

export const drawerWidth = 240;  // Expanded sidebar width (with text)
export const drawerWidthCollapsed = 70;  // Collapsed sidebar width (icon-only)

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface MenuItem {
  text: string;
  icon: JSX.Element;
  path: string;
  roles: string[];
}

const menuItems: MenuItem[] = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
    roles: [ROLE_TYPES.ADMIN, ROLE_TYPES.EMPLOYEE, ROLE_TYPES.DEPARTMENT_HEAD, ROLE_TYPES.PROCUREMENT_OFFICER],
  },
  {
    text: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
    roles: [ROLE_TYPES.ADMIN],
  },
  {
    text: 'Roles',
    icon: <SecurityIcon />,
    path: '/roles',
    roles: [ROLE_TYPES.ADMIN],
  },
  {
    text: 'Departments',
    icon: <BusinessIcon />,
    path: '/departments',
    roles: [ROLE_TYPES.ADMIN, ROLE_TYPES.DEPARTMENT_HEAD],
  },
  {
    text: 'Inventory',
    icon: <InventoryIcon />,
    path: '/inventory',
    roles: [ROLE_TYPES.ADMIN, ROLE_TYPES.PROCUREMENT_OFFICER],
  },
  {
    text: 'Procurement',
    icon: <ShoppingCartIcon />,
    path: '/procurement',
    roles: [ROLE_TYPES.ADMIN, ROLE_TYPES.PROCUREMENT_OFFICER],
  },
  {
    text: 'Reports',
    icon: <AssessmentIcon />,
    path: '/reports',
    roles: [ROLE_TYPES.ADMIN, ROLE_TYPES.DEPARTMENT_HEAD],
  },
];

export const Sidebar = ({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.some((role) => hasRole(role))
  );

  const drawer = (isDesktop: boolean) => (
    <>
      <Toolbar />
      <Box sx={{ overflow: 'auto', mt: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const button = (
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#EBF5FF' : 'transparent',
                  color: isActive ? '#0056D2' : '#475569',
                  fontWeight: isActive ? 600 : 400,
                  justifyContent: collapsed && isDesktop ? 'center' : 'flex-start',
                  '&:hover': {
                    backgroundColor: isActive ? '#EBF5FF' : '#F8FAFC',
                  },
                  transition: 'all 0.3s ease',
                  px: collapsed && isDesktop ? 1 : 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#0056D2' : '#64748B',
                    minWidth: collapsed && isDesktop ? 'auto' : 40,
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {(!collapsed || !isDesktop) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontFamily: 'Poppins, sans-serif',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            );

            return (
              <ListItem key={item.text} disablePadding sx={{ px: collapsed && isDesktop ? 0.5 : 2, mb: 0.5 }}>
                {collapsed && isDesktop ? (
                  <Tooltip title={item.text} placement="right">
                    {button}
                  </Tooltip>
                ) : (
                  button
                )}
              </ListItem>
            );
          })}
        </List>
        <Divider sx={{ my: 2 }} />
        
        {isDesktop && (
          <Box sx={{ mt: 'auto', p: collapsed ? 0.5 : 2 }}>
            <IconButton
              onClick={onToggleCollapse}
              sx={{
                width: '100%',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                },
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        {drawer(false)}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: collapsed ? drawerWidthCollapsed : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? drawerWidthCollapsed : drawerWidth,
            borderRight: '1px solid #E2E8F0',
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer(true)}
      </Drawer>
    </>
  );
};

