import { createContext, useContext } from 'react';

const defaultTheme = {
  hero: {
    background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%), linear-gradient(180deg, #0f172a 0%, #0c1120 100%)',
    text: '#ffffff',
    badgeBackground: 'rgba(212,175,55,0.1)',
    badgeBorder: 'rgba(212,175,55,0.22)',
    badgeText: '#d4af37',
  },
  stats: {
    cardBackground: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    label: '#9ca3af',
    value: '#ffffff',
    accent: '#3b82f6',
  },
  services: {
    background: 'transparent',
    label: '#d4af37',
    title: '#ffffff',
    cardBackground: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    cardHoverBorder: 'rgba(212,175,55,0.5)',
    titleText: '#ffffff',
    feeText: '#9ca3af',
    feeValue: '#10b981',
    timeText: '#d4af37',
  },
  features: {
    background: 'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.03) 50%, transparent 100%)',
    label: '#d4af37',
    title: '#ffffff',
    cardBackground: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    icon: '#d4af37',
    description: '#9ca3af',
  },
  cta: {
    background: 'rgba(255,255,255,0.03)',
    border: 'rgba(212,175,55,0.25)',
    title: '#ffffff',
    description: '#9ca3af',
    buttonBackground: 'linear-gradient(135deg, #d4af37, #b49427)',
    buttonText: '#0f172a',
    buttonHover: 'linear-gradient(135deg, #f4cf57, #d4af37)',
  },
  footer: {
    background: '#0f172a',
    text: '#9ca3af',
    link: '#d1d5db',
    linkHover: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
  },
};

const LandingThemeContext = createContext(defaultTheme);

export const LandingThemeProvider = ({ children }) => (
  <LandingThemeContext.Provider value={defaultTheme}>
    {children}
  </LandingThemeContext.Provider>
);

export const useLandingTheme = () => {
  const context = useContext(LandingThemeContext);
  if (!context) {
    throw new Error('useLandingTheme must be used within LandingThemeProvider');
  }
  return context;
};

export default LandingThemeContext;