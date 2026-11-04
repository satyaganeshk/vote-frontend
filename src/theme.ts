import { createTheme } from '@mui/material/styles';

// Design tokens — see DESIGN.md for the rationale behind these choices.
export const tokens = {
  navy: {
    main: '#0b3d66',
    light: '#2f5d85',
    dark: '#072a47',
  },
  accent: {
    main: '#0f766e',
    light: '#3b9c92',
    dark: '#0a5450',
  },
  grey: {
    50: '#f7f8fa',
    100: '#eef1f4',
    200: '#e3e6eb',
    300: '#cbd0d8',
    400: '#a4abb6',
    500: '#78818f',
    600: '#5b6472',
    700: '#424954',
    800: '#2a2f38',
    900: '#16181d',
  },
  radius: 12,
  subtleShadow: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)',
  raisedShadow: '0 4px 10px rgba(16, 24, 40, 0.08), 0 2px 4px rgba(16, 24, 40, 0.06)',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: tokens.navy,
    secondary: tokens.accent,
    background: {
      default: tokens.grey[50],
      paper: '#ffffff',
    },
    text: {
      primary: tokens.grey[900],
      secondary: tokens.grey[600],
    },
    divider: tokens.grey[200],
  },
  shape: {
    borderRadius: tokens.radius,
  },
  spacing: 8,
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h4: { fontWeight: 800, letterSpacing: -0.5 },
    h5: { fontWeight: 700, letterSpacing: -0.3 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.grey[50] },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          paddingTop: 10,
          paddingBottom: 10,
          minHeight: 44,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { minWidth: 44, minHeight: 44 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          boxShadow: tokens.subtleShadow,
          border: `1px solid ${tokens.grey[200]}`,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation1: { boxShadow: tokens.subtleShadow },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: tokens.subtleShadow },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.grey[50],
          '& .MuiTableCell-root': {
            fontWeight: 700,
            color: tokens.grey[700],
            fontSize: '0.8rem',
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: tokens.grey[50] },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: '0.75rem' },
      },
    },
  },
});
