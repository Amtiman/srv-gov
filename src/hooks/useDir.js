import { useTranslation } from 'react-i18next';
import theme from '../theme';

export const useDir = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    fontFamily: isRTL ? theme.typography.fontFamily.ar : theme.typography.fontFamily.en,
  };
};
