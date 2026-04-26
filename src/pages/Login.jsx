import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import theme from '../theme';

const inputStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#fff',
  padding: '12px 16px 12px 44px',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: theme.typography.fontFamily.en,
};

const labelStyle = {
  display: 'block',
  color: theme.colors.neutral[400],
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('auth.messages.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c1120',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: theme.typography.fontFamily.en,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, pointerEvents: 'none',
        background: `radial-gradient(ellipse, ${theme.colors.accent.gold}10 0%, transparent 70%)`,
      }} />

      <div style={{
        width: '100%',
        maxWidth: 440,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '40px 36px',
        backdropFilter: 'blur(12px)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 style={{ color: '#0f172a', width: 28, height: 28 }} />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>
            {t('auth.login.title')}
          </h2>
          <p style={{ color: theme.colors.neutral[500], fontSize: '0.875rem' }}>
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" style={{ color: theme.colors.accent.gold, textDecoration: 'none', fontWeight: 600 }}>
              {t('auth.login.register')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>{t('auth.login.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none',
              }} />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.login.email')}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = `${theme.colors.accent.gold}60`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>{t('auth.login.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none',
              }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = `${theme.colors.accent.gold}60`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: theme.colors.neutral[500], display: 'flex', alignItems: 'center',
                }}
              >
                {showPassword
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginTop: 4,
              padding: '13px',
              borderRadius: 12,
              background: loading
                ? 'rgba(212,175,55,0.5)'
                : `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
              color: '#0f172a',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: theme.typography.fontFamily.en,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? t('auth.login.submit') + '...' : t('auth.login.submit')}
            {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
