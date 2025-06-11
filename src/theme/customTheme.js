import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: { main: '#009688' },
    background: { default: '#f5f5f5' },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: { disableRipple: true },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
    MuiSelect: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
});

export default customTheme;
