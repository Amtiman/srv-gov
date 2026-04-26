import { Link } from 'react-router-dom';
import { formatFee } from '../lib/currency';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useDir } from '../hooks/useDir';
import { useLandingTheme } from '../context/LandingThemeContext';
import {
  Bot, FileText, CreditCard, CheckCircle, Clock, Shield,
  ArrowRight, Layers, Users, Zap, Globe, Settings,
  Car, IdCard, Briefcase, Scroll, Heart, Building
} from 'lucide-react';
import theme from '../theme';

const StatCard = ({ icon, label, value, accent, isRTL, landingTheme }) => (
  <div style={{
    background: landingTheme.stats?.cardBackground || 'rgba(255,255,255,0.04)',
    border: `1px solid ${landingTheme.stats?.cardBorder || 'rgba(255,255,255,0.08)'}`,
    borderRadius: '20px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: '16px',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: '14px', background: accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ textAlign: isRTL ? 'right' : 'left' }}>
      <p style={{ color: theme.colors.neutral[400], fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const getServiceIcon = (service) => {
  const key = service.name?.toLowerCase() || '';
  if (key.includes('passport')) return <FileText style={{ color: '#3b82f6', width: 26, height: 26 }} />;
  if (key.includes('national') || key.includes('id')) return <IdCard style={{ color: '#10b981', width: 26, height: 26 }} />;
  if (key.includes('car') || key.includes('insurance') || key.includes('vehicle')) return <Car style={{ color: '#f59e0b', width: 26, height: 26 }} />;
  if (key.includes('business') || key.includes('company') || key.includes('license')) return <Briefcase style={{ color: '#8b5cf6', width: 26, height: 26 }} />;
  if (key.includes('birth') || key.includes('certificate')) return <Scroll style={{ color: '#ec4899', width: 26, height: 26 }} />;
  if (key.includes('health') || key.includes('medical')) return <Heart style={{ color: '#ef4444', width: 26, height: 26 }} />;
  if (key.includes('building') || key.includes('property')) return <Building style={{ color: '#14b8a6', width: 26, height: 26 }} />;
  return <FileText style={{ color: theme.colors.accent.gold, width: 26, height: 26 }} />;
};

const ServiceCard = ({ service, badge, isRTL, textAlign, feeLabel, daysLabel, lang, landingTheme }) => (
  <div style={{
    background: landingTheme.services?.cardBackground || 'rgba(255,255,255,0.04)',
    border: `1px solid ${landingTheme.services?.cardBorder || 'rgba(255,255,255,0.08)'}`,
    borderRadius: '20px',
    padding: '24px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = landingTheme.services?.cardHoverBorder || `${theme.colors.accent.gold}50`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = landingTheme.services?.cardBorder || 'rgba(255,255,255,0.08)'; }}
  >
    <div style={{
      width: '100%', height: 100, borderRadius: '14px',
      background: 'rgba(255,255,255,0.04)', marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '14px',
        background: `${theme.colors.accent.gold}20`,
        border: `1px solid ${theme.colors.accent.gold}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {getServiceIcon(service)}
      </div>
    </div>
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 999,
      fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em',
      color: badge.color, background: badge.bg, marginBottom: 10,
    }}>
      • {badge.label}
    </span>
    <h3 style={{ color: landingTheme.services?.titleText || '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 12, textAlign }}>
      {lang === 'ar' && service.name_ar ? service.name_ar : service.name}
    </h3>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <span style={{ color: landingTheme.services?.feeText || theme.colors.neutral[400], fontSize: '0.8rem' }}>
        {feeLabel}: <strong style={{ color: landingTheme.services?.feeValue || theme.colors.success }}>{formatFee(service.fee, service.currency)}</strong>
      </span>
      <span style={{ color: landingTheme.services?.timeText || theme.colors.accent.gold, fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <Clock style={{ width: 12, height: 12 }} />
        {service.processing_time_days} {daysLabel}
      </span>
    </div>
  </div>
);

const FeatureCard = ({ feature, iconBg, isRTL, textAlign }) => (
  <div style={{
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '28px',
    backdropFilter: 'blur(12px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${theme.colors.accent.gold}40`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: '14px', background: iconBg,
      border: `1px solid rgba(255,255,255,0.08)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
    }}>
      {feature.icon}
    </div>
    <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginBottom: 8, textAlign }}>
      {feature.title}
    </h3>
    <p style={{ color: theme.colors.neutral[400], fontSize: '0.875rem', lineHeight: 1.6, textAlign }}>
      {feature.description}
    </p>
  </div>
);

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useDir();
  const landingTheme = useLandingTheme();
  const textAlign = isRTL ? 'right' : 'left';

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/services')
      .then(res => setServices(res.data.slice(0, 6)))
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));

    axios.get('http://localhost:5000/api/stats')
      .then(res => setStatsData(res.data))
      .catch(() => {});
  }, []);

  const formatCount = (n) => n >= 1000 ? Math.floor(n / 1000) + 'K+' : n + '+';

  const stats = [
    { icon: <Layers style={{ color: '#fff', width: 24, height: 24 }} />, label: t('landing.stats.services'), value: statsData ? statsData.servicesCount + '+' : '…', accent: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})` },
    { icon: <Users style={{ color: '#fff', width: 24, height: 24 }} />,  label: t('landing.stats.citizens'),  value: statsData ? formatCount(statsData.usersCount) : '…', accent: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
    { icon: <Zap style={{ color: '#fff', width: 24, height: 24 }} />,    label: t('landing.stats.processing'), value: statsData ? statsData.avgProcessingDays + ' ' + t('time.days') : '…', accent: 'linear-gradient(135deg, #10b981, #059669)' },
    { icon: <Globe style={{ color: '#fff', width: 24, height: 24 }} />,  label: t('landing.stats.uptime'),    value: statsData ? statsData.uptime + '%' : '…', accent: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  ];

  const badgeDefs = [
    { label: t('landing.services.badges.popular'),  color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    { label: t('landing.services.badges.fastTrack'), color: theme.colors.accent.gold, bg: 'rgba(212,175,55,0.15)' },
    { label: t('landing.services.badges.available'), color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { label: t('landing.services.badges.new'),       color: '#a78bfa', bg: 'rgba(167,139,250,0.15)' },
  ];

  const featureIconBgs = [
    `${theme.colors.accent.gold}25`,
    'rgba(59,130,246,0.2)',
    'rgba(16,185,129,0.2)',
    'rgba(167,139,250,0.2)',
    'rgba(245,158,11,0.2)',
    'rgba(239,68,68,0.2)',
  ];

  const features = [
    { icon: <Bot style={{ color: theme.colors.accent.gold, width: 24, height: 24 }} />,       title: t('landing.features.ai.title'),        description: t('landing.features.ai.description') },
    { icon: <FileText style={{ color: '#60a5fa', width: 24, height: 24 }} />,                 title: t('landing.features.documents.title'),  description: t('landing.features.documents.description') },
    { icon: <CreditCard style={{ color: '#10b981', width: 24, height: 24 }} />,               title: t('landing.features.payments.title'),   description: t('landing.features.payments.description') },
    { icon: <CheckCircle style={{ color: '#a78bfa', width: 24, height: 24 }} />,              title: t('landing.features.tracking.title'),   description: t('landing.features.tracking.description') },
    { icon: <Clock style={{ color: '#f59e0b', width: 24, height: 24 }} />,                    title: t('landing.features.speed.title'),      description: t('landing.features.speed.description') },
    { icon: <Shield style={{ color: '#ef4444', width: 24, height: 24 }} />,                   title: t('landing.features.security.title'),   description: t('landing.features.security.description') },
  ];

  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
    color: '#0f172a', fontWeight: 700, fontSize: '0.95rem',
    textDecoration: 'none', transition: 'opacity 0.2s',
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };

  const btnSecondary = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '12px 28px', borderRadius: 14,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontWeight: 600, fontSize: '0.95rem',
    textDecoration: 'none', transition: 'background 0.2s',
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };

  return (
    <div style={{ backgroundColor: landingTheme.footer?.background || '#0c1120', minHeight: '100vh', textAlign }}>

      {/* Hero */}
      <section style={{
        background: landingTheme.hero?.background || 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(212,175,55,0.12) 0%, transparent 70%), linear-gradient(180deg, #0f172a 0%, #0c1120 100%)',
        padding: '96px 24px 80px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', padding: '5px 16px', borderRadius: 999,
            fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: landingTheme.hero?.badgeText || theme.colors.accent.gold, background: landingTheme.hero?.badgeBackground || 'rgba(212,175,55,0.1)',
            border: `1px solid ${landingTheme.hero?.badgeBorder || 'rgba(212,175,55,0.22)'}30`, marginBottom: 24,
          }}>
            {t('landing.badge')}
          </span>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 700, color: landingTheme.hero?.text || '#fff', lineHeight: 1.15, marginBottom: 20 }}>
            {t('landing.hero.title1')}{' '}
            <span style={{ background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldLight})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {t('landing.hero.title2')}
            </span>
          </h1>

          <p style={{ color: theme.colors.neutral[400], fontSize: '1.1rem', maxWidth: 540, margin: '0 auto 40px', lineHeight: 1.7 }}>
            {t('landing.hero.description')}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/chat" style={btnPrimary}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('landing.hero.startAssistant')} <ArrowRight style={{ width: 16, height: 16 }} />
              </Link>
            ) : (
              <>
                <Link to="/chat" style={btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {t('landing.hero.startAssistant')} <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link to="/login" style={btnSecondary}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  {t('landing.hero.signIn')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ padding: '0 24px', marginTop: -20 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {stats.map((s, i) => <StatCard key={i} {...s} isRTL={isRTL} landingTheme={landingTheme} />)}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      {user ? null : (
        <section style={{ padding: '60px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ color: theme.colors.accent.gold, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                {t('landing.quickAccess.label')}
              </p>
              <h2 style={{ color: '#fff', fontSize: '1.875rem', fontWeight: 700 }}>{t('landing.quickAccess.title')}</h2>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Link to="/chat" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: '20px 28px', textDecoration: 'none',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${theme.colors.accent.gold}50`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${theme.colors.accent.gold}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot style={{ color: theme.colors.accent.gold, width: 24, height: 24 }} />
                </div>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{t('landing.quickAccess.chatTitle')}</h3>
                  <p style={{ color: theme.colors.neutral[400], fontSize: '0.8rem' }}>{t('landing.quickAccess.chatDesc')}</p>
                </div>
              </Link>

              {user && user.role === 'ADMIN' && (
                <Link to="/admin" style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '20px 28px', textDecoration: 'none',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${theme.colors.accent.gold}50`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: 'rgba(59,130,246,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Settings style={{ color: '#60a5fa', width: 24, height: 24 }} />
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{t('landing.quickAccess.adminTitle')}</h3>
                    <p style={{ color: theme.colors.neutral[400], fontSize: '0.8rem' }}>{t('landing.quickAccess.adminDesc')}</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section style={{ padding: '80px 24px', background: landingTheme.services?.background || 'transparent' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ color: landingTheme.services?.label || theme.colors.accent.gold, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {t('landing.services.label')}
            </p>
            <h2 style={{ color: landingTheme.services?.title || '#fff', fontSize: '1.875rem', fontWeight: 700 }}>{t('landing.services.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {loadingServices
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '24px', height: 220,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                ))
              : services.map((service, i) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    badge={badgeDefs[i % badgeDefs.length]}
                    isRTL={isRTL}
                    textAlign={textAlign}
                    feeLabel={t('payments.fee')}
                    daysLabel={t('time.days')}
                    lang={i18n.language}
                    landingTheme={landingTheme}
                  />
                ))
            }
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: landingTheme.features?.background || 'linear-gradient(180deg, transparent 0%, rgba(212,175,55,0.03) 50%, transparent 100%)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ color: landingTheme.features?.label || theme.colors.accent.gold, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              {t('landing.features.label')}
            </p>
            <h2 style={{ color: landingTheme.features?.title || '#fff', fontSize: '1.875rem', fontWeight: 700 }}>{t('landing.features.title')}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} iconBg={featureIconBgs[i]} isRTL={isRTL} textAlign={textAlign} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{
            borderRadius: '24px', padding: '60px 48px',
            background: landingTheme.cta?.background || 'rgba(255,255,255,0.03)',
            border: `1px solid ${landingTheme.cta?.border || 'rgba(212,175,55,0.25)'}`,
            backdropFilter: 'blur(12px)', textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
              width: 400, height: 200, pointerEvents: 'none',
              background: `radial-gradient(ellipse, ${theme.colors.accent.gold}15 0%, transparent 70%)`,
            }} />
            <h2 style={{ color: landingTheme.cta?.title || '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: 12, position: 'relative' }}>
              {t('landing.cta.title')}
            </h2>
            <p style={{ color: landingTheme.cta?.description || theme.colors.neutral[400], fontSize: '1rem', maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7, position: 'relative' }}>
              {t('landing.cta.description')}
            </p>
            {!user && (
              <Link to="/register" style={{ ...btnPrimary, padding: '13px 32px', fontSize: '1rem', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('landing.cta.createAccount')} <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            )}
            {user && (
              <Link to="/chat" style={{ ...btnPrimary, padding: '13px 32px', fontSize: '1rem', position: 'relative' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {t('landing.cta.chatAssistant')} <ArrowRight style={{ width: 18, height: 18 }} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
