import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Building2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import theme from '../theme';

const inputBase = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 12,
  color: '#fff',
  padding: '12px 16px',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: theme.typography.fontFamily.en,
};

const inputWithIcon = { ...inputBase, paddingLeft: 44 };

const labelStyle = {
  display: 'block',
  color: theme.colors.neutral[400],
  fontSize: '0.72rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 8,
};

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const focusBorder = (e) => { e.target.style.borderColor = `${theme.colors.accent.gold}60`; };
  const blurBorder = (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.errors.passwordMismatch'));
      return;
    }
    if (formData.password.length < 6) {
      setError(t('register.errors.passwordTooShort'));
      return;
    }
    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('register.errors.failed'));
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
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 300, pointerEvents: 'none',
        background: `radial-gradient(ellipse, ${theme.colors.accent.gold}10 0%, transparent 70%)`,
      }} />

      <div style={{
        width: '100%', maxWidth: 500,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '40px 36px',
        backdropFilter: 'blur(12px)', position: 'relative',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 style={{ color: '#0f172a', width: 28, height: 28 }} />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: 6 }}>
            {t('register.title')}
          </h2>
          <p style={{ color: theme.colors.neutral[500], fontSize: '0.875rem' }}>
            {t('register.subtitle')}{' '}
            <Link to="/login" style={{ color: theme.colors.accent.gold, textDecoration: 'none', fontWeight: 600 }}>
              {t('register.signIn')}
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Name row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>{t('register.firstName')}</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none' }} />
                <input name="firstName" type="text" required value={formData.firstName} onChange={handleChange}
                  placeholder="John" style={inputWithIcon} onFocus={focusBorder} onBlur={blurBorder} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>{t('register.lastName')}</label>
              <input name="lastName" type="text" required value={formData.lastName} onChange={handleChange}
                placeholder="Doe" style={inputBase} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>{t('register.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none' }} />
              <input name="email" type="email" required value={formData.email} onChange={handleChange}
                placeholder="you@example.com" style={inputWithIcon} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>{t('register.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none' }} />
              <input name="password" type={showPassword ? 'text' : 'password'} required value={formData.password}
                onChange={handleChange} placeholder="••••••••"
                style={{ ...inputWithIcon, paddingRight: 44 }} onFocus={focusBorder} onBlur={blurBorder} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.neutral[500], display: 'flex',
              }}>
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={labelStyle}>{t('register.confirmPassword')}</label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: theme.colors.neutral[500], pointerEvents: 'none' }} />
              <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required value={formData.confirmPassword}
                onChange={handleChange} placeholder="••••••••" style={inputWithIcon} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 4, padding: '13px', borderRadius: 12,
            background: loading ? 'rgba(212,175,55,0.5)' : `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
            color: '#0f172a', fontWeight: 700, fontSize: '0.95rem',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: theme.typography.fontFamily.en,
          }}>
            {loading ? t('register.submitting') : t('register.submit')}
            {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
