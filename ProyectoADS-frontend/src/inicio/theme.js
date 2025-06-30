// theme.js (sin el degradado en background.default)
import { createTheme } from '@mui/material/styles';
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    text: { primary: '#333' }
  },
  appBar: {
    main: "rgb(229, 61, 61)" // Color de fondo claro
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    text: { primary: '#fff' }
  },
  appBar: {
    main: "rgb(0, 0, 0)", 
  },
});
