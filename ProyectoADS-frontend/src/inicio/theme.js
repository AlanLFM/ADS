// theme.js (sin el degradado en background.default)
import { createTheme } from '@mui/material/styles';
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    text: { primary: '#333' }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    text: { primary: '#fff' }
  },
});
