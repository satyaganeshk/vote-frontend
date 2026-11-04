import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, BottomNavigation, BottomNavigationAction, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';

const NAV_ITEMS = [
  { label: 'Overview', to: '/admin', icon: <DashboardOutlinedIcon /> },
  { label: 'Voters', to: '/admin/voters', icon: <GroupOutlinedIcon /> },
  { label: 'Candidates', to: '/admin/candidates', icon: <BadgeOutlinedIcon /> },
  { label: 'Results', to: '/admin/results', icon: <BarChartOutlinedIcon /> },
];

export const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();

  const activeIndex = Math.max(
    0,
    NAV_ITEMS.findIndex((item) =>
      item.to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(item.to)
    )
  );

  if (isMobile) {
    return (
      <Box sx={{ pb: 8 }}>
        <Outlet />
        <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10 }}>
          <BottomNavigation showLabels value={activeIndex}>
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.to}
                label={item.label}
                icon={item.icon}
                component={NavLink}
                to={item.to}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Paper variant="outlined" sx={{ p: 1, position: 'sticky', top: 88 }}>
          <List disablePadding>
            {NAV_ITEMS.map((item, i) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                selected={i === activeIndex}
                sx={{ borderRadius: 2, mb: 0.5 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};
