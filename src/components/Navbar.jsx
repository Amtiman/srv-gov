import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, LogOut, Settings } from 'lucide-react';
import theme from '../theme';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const langs = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'fr', label: 'FR' },
  ];

  const activeLang = i18n.language?.slice(0, 2) || 'en';

  return (
    <nav style={{
      backgroundColor: 'rgba(12,17,32,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Logo" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain' }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{t('navbar.appName')}</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* Language Selector */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10,
              padding: 3,
              gap: 2,
              marginRight: 16,
            }}>
              {langs.map(({ code, label }) => {
                const isActive = activeLang === code;
                return (
                  <button
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isActive
                        ? `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`
                        : 'transparent',
                      color: isActive ? '#0f172a' : theme.colors.neutral[500],
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Nav Links */}
            {user ? (
              <>
                <Link to="/chat" style={{
                  color: theme.colors.neutral[300], textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500, padding: '6px 12px',
                  borderRadius: 8, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[300]}
                >
                  {t('navigation.aiAssistant')}
                </Link>

                <Link to="/dashboard" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: theme.colors.neutral[300], textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500, padding: '6px 12px',
                  borderRadius: 8, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[300]}
                >
                  <LayoutDashboard style={{ width: 15, height: 15 }} />
                  {t('navigation.dashboard')}
                </Link>

                {user.role === 'ADMIN' && (
                  <Link to="/admin" style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: theme.colors.accent.gold, textDecoration: 'none',
                    fontSize: '0.875rem', fontWeight: 600, padding: '6px 12px',
                    borderRadius: 8,
                  }}>
                    <Settings style={{ width: 15, height: 15 }} />
                    {t('navigation.admin')}
                  </Link>
                )}

                {/* User + Logout */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginLeft: 8, paddingLeft: 16,
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${theme.colors.accent.gold}20`,
                    border: `1px solid ${theme.colors.accent.gold}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: theme.colors.accent.gold, fontSize: '0.75rem', fontWeight: 700 }}>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </span>
                  </div>
                  <span style={{ color: theme.colors.neutral[300], fontSize: '0.85rem' }}>
                    {user.firstName} {user.lastName}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: theme.colors.neutral[500], fontSize: '0.8rem',
                      padding: '4px 8px', borderRadius: 6, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[500]}
                  >
                    <LogOut style={{ width: 14, height: 14 }} />
                    {t('navigation.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  color: theme.colors.neutral[300], textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500, padding: '6px 14px',
                  borderRadius: 8, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[300]}
                >
                  {t('navigation.login')}
                </Link>
                <Link to="/register" style={{
                  padding: '7px 18px', borderRadius: 10,
                  background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
                  color: '#0f172a', fontWeight: 700, fontSize: '0.875rem',
                  textDecoration: 'none', transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t('navigation.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
