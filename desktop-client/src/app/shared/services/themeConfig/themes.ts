export interface Theme {
    primary: string;
    primaryContrast: string;
    primaryLight: string;
    almostPrimary: string;

    accent: string;
    accentContrast: string;
    accentLight: string;
    almostAccent: string;

    warn: string;
}

// Lilac Theme
export const JokerTheme: Theme = {
    primary: '#6A1B9A',
    primaryContrast: '#FFFFFF',
    primaryLight: '#CE93D8',
    almostPrimary: '#7B1FA2',

    accent: '#2E7D32', // Indigo
    accentContrast: '#ffffff', // White
    accentLight: '#A5D6A7', // Light Indigo
    almostAccent: '#1B5E20',

    warn: '#ff3d00', // Bright Orange
};

// Light Theme
export const LightTheme: Theme = {
    primary: '#283593', // Indigo
    primaryContrast: '#ffffff', // White
    primaryLight: '#b9c6e7', // Light Indigo
    almostPrimary: '#3f51b5',

    accent: '#ef5350', // Bright Red
    accentContrast: '#ffffff', // White
    accentLight: '#ffcdd2', // Light Pink
    almostAccent: '#eb655b',

    warn: '#ff3d00', // Bright Orange
};

export const shamrockTheme: Theme = {
    primary: '#2E7D32', // Dark Green
    primaryContrast: '#ffffff', // White
    primaryLight: '#90ca98', // Bright Yellow
    almostPrimary: '#38aa84',

    accent: '#FFB300', // Bright Yellow
    accentContrast: '#000000', // Black
    accentLight: '#FCE3A0', // Orange
    almostAccent: '#ffd256',

    warn: '#ff3d00', // Bright Orange
};
