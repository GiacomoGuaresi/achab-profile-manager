import { createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#009688',
    },
    secondary: {
      main: '#3b4446', 
    },
    text: {
      primary: '#000',
    },
    background: {
      default: '#e5e5e5',
      paper: '#fff',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
        },
        select: {
          borderRadius: 4,
          '&:focus': {
            borderRadius: 4,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius:4,
        },
        notchedOutline: {
          borderRadius: 4,
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default customTheme;