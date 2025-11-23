import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { DashboardLayout } from '../components/Layout/DashboardLayout';
import { useAuth } from '../hooks/useAuth.ts';
import { useEffect, useState } from 'react';
import { getUsers } from '../services/userService.ts';
import { getDepartments } from '../services/departmentService.ts';

interface StatCard {
  title: string;
  value: number;
  icon: JSX.Element;
  color: string;
  bgColor: string;
}

export const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    inventory: 0,
    procurement: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
          debugger;
        //if (hasPermission(ROLE_TYPES.ADMIN)) {
            debugger;
            //TODO: Fetch stats from backend
          const [usersData, departmentsData] = await Promise.all([
            getUsers(),
            getDepartments(),
          ]);
          setStats({
            users: usersData.length ? usersData.length : 0,
            departments: departmentsData.length ? departmentsData.length : 0,
            inventory: 0,
            procurement: 0,
          });
        //}
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#0056D2',
      bgColor: '#EBF5FF',
    },
    {
      title: 'Departments',
      value: stats.departments,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#00A8E8',
      bgColor: '#E0F7FF',
    },
    {
      title: 'Inventory Items',
      value: stats.inventory,
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      color: '#FFD700',
      bgColor: '#FFF9E0',
    },
    {
      title: 'Active Procurements',
      value: stats.procurement,
      icon: <ShoppingCartIcon sx={{ fontSize: 40 }} />,
      color: '#2ECC71',
      bgColor: '#E8F8EF',
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            color: '#1E293B',
            mb: 1,
          }}
        >
          Welcome back, {user?.fullName}!
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: 'Poppins, sans-serif',
            color: '#64748B',
            mb: 4,
          }}
        >
          Here's what's happening with your organization today.
        </Typography>

        <Grid container spacing={3}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              {loading ? (
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <CardContent>
                    <Skeleton variant="rectangular" height={100} />
                  </CardContent>
                </Card>
              ) : (
                <Card
                  sx={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '12px',
                          backgroundColor: card.bgColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: card.color,
                        }}
                      >
                        {card.icon}
                      </Box>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 700,
                        color: '#1E293B',
                        mb: 0.5,
                      }}
                    >
                      {card.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Poppins, sans-serif',
                        color: '#64748B',
                      }}
                    >
                      {card.title}
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
          ))}
        </Grid>

        {/* Additional sections can be added here for charts, recent activity, etc. */}
        <Box sx={{ mt: 4 }}>
          <Card
            sx={{
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#1E293B',
                mb: 2,
              }}
            >
              Quick Actions
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'Poppins, sans-serif',
                color: '#64748B',
              }}
            >
              Use the sidebar to navigate through different modules of the system.
            </Typography>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};


