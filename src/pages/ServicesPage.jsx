import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getAllServices, createService, updateService, deleteService } from '../services/apiService';
import { FileText, Plus, Edit2, Trash2, X, Clock, Building2, Check } from 'lucide-react';
import theme from '../theme';
import { CURRENCIES, formatFee } from '../lib/currency';

const ALL_DOCUMENTS = [
  'passport_photo', 'current_passport', 'existing_passport', 'proof_of_address',
  'birth_certificate', 'national_id_photo', 'photo_id', 'id_proof',
  'vehicle_registration', 'drivers_license', 'previous_insurance',
  'business_plan', 'premises_lease', 'tax_certificate', 'address_proof',
  'proof_of_relationship',
];

const DocPicker = ({ selected, onChange, t }) => {
  const [customInput, setCustomInput] = useState('');

  const remove = (doc) => onChange(selected.filter(d => d !== doc));
  const add = (doc) => { if (!selected.includes(doc)) onChange([...selected, doc]); };

  const addCustom = () => {
    const key = customInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (key && !selected.includes(key)) {
      onChange([...selected, key]);
    }
    setCustomInput('');
  };

  const available = ALL_DOCUMENTS.filter(d => !selected.includes(d));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {selected.map(doc => (
            <span key={doc} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999,
              background: `${theme.colors.accent.gold}20`,
              border: `1px solid ${theme.colors.accent.gold}50`,
              color: theme.colors.accent.gold, fontSize: '0.75rem', fontWeight: 600,
            }}>
              {t(`documents.${doc}`, doc.replace(/_/g, ' '))}
              <button type="button" onClick={() => remove(doc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.accent.gold, display: 'flex', padding: 0, lineHeight: 1 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      {selected.length > 0 && available.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
      )}

      {/* Available pills (only unselected) */}
      {available.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {available.map(doc => (
            <button key={doc} type="button" onClick={() => add(doc)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 999, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: theme.colors.neutral[400], transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.colors.accent.gold}50`; e.currentTarget.style.color = theme.colors.accent.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = theme.colors.neutral[400]; }}
            >
              <Plus style={{ width: 11, height: 11 }} />
              {t(`documents.${doc}`, doc.replace(/_/g, ' '))}
            </button>
          ))}
        </div>
      )}

      {/* Custom document input */}
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={t('services.details.customDocument', 'Add custom document...')}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.15)',
            borderRadius: 8, color: '#fff', padding: '7px 12px', fontSize: '0.78rem', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = `${theme.colors.accent.gold}50`}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
        />
        <button type="button" onClick={addCustom} disabled={!customInput.trim()} style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 8,
          background: customInput.trim() ? `${theme.colors.accent.gold}20` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${customInput.trim() ? theme.colors.accent.gold + '50' : 'rgba(255,255,255,0.08)'}`,
          color: customInput.trim() ? theme.colors.accent.gold : theme.colors.neutral[600],
          cursor: customInput.trim() ? 'pointer' : 'not-allowed', fontSize: '0.75rem', fontWeight: 600,
          transition: 'all 0.15s',
        }}>
          <Plus style={{ width: 13, height: 13 }} />
          {t('common.add', 'Add')}
        </button>
      </div>
    </div>
  );
};

const card = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12,
  backdropFilter: 'blur(12px)',
};

const inputStyle = {
  background: 'rgba(15, 23, 42, 0.6)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#fff',
  padding: '12px 14px',
  fontSize: '0.9rem',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  color: theme.colors.neutral[400],
  fontSize: '0.8rem',
  fontWeight: 500,
  marginBottom: 8,
  display: 'block',
};

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isArabic = i18n.language === 'ar';
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', name_ar: '', description: '', description_ar: '',
    fee: '', currency: 'USD', department: '', processingTimeDays: '',
    requiredDocuments: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await getAllServices();
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setForm({
        name: service.name || '',
        name_ar: service.name_ar || '',
        description: service.description || '',
        description_ar: service.description_ar || '',
        fee: service.fee?.toString() || '',
        currency: service.currency || 'USD',
        department: service.department || '',
        processingTimeDays: service.processing_time_days?.toString() || '',
        requiredDocuments: service.required_documents || [],
      });
    } else {
      setEditingId(null);
      setForm({
        name: '',
        name_ar: '',
        description: '',
        description_ar: '',
        fee: '', currency: 'USD', department: '', processingTimeDays: '',
        requiredDocuments: [],
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        name_ar: form.name_ar,
        description: form.description,
        description_ar: form.description_ar,
        fee: parseFloat(form.fee),
        currency: form.currency,
        department: form.department,
        processingTimeDays: parseInt(form.processingTimeDays),
        requiredDocuments: form.requiredDocuments,
      };

      if (editingId) {
        await updateService(editingId, payload);
      } else {
        await createService(payload);
      }
      await fetchServices();
      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('common.confirmDelete') || 'Are you sure you want to delete this service?')) {
      return;
    }
    try {
      await deleteService(id);
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const getName = (service) => {
    return isArabic && service.name_ar ? service.name_ar : service.name;
  };

  return (
    <div style={{ padding: '32px', maxWidth: 1000, margin: '0 auto', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
            {t('services.catalog.title')}
          </h1>
          <p style={{ color: theme.colors.neutral[500], marginTop: 6, fontSize: '0.9rem' }}>
            {t('admin.label')}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 20px', borderRadius: 10,
            background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
            border: 'none', color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(234, 179, 8, 0.25)',
          }}
        >
          <Plus style={{ width: 18, height: 18 }} />
          {t('common.create') || 'Add Service'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: theme.colors.neutral[500], fontSize: '0.95rem' }}>
          {t('common.loading')}
        </div>
      ) : services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: theme.colors.neutral[500], fontSize: '0.95rem' }}>
          {t('services.catalog.noServices')}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {services.map((service) => (
            <div key={service.id} style={{ 
              ...card, padding: '20px 24px', 
              display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', 
              alignItems: 'center', gap: 16 
            }}>
              <div>
                <div style={{ ...labelStyle, marginBottom: 4 }}>{t('common.serviceName')}</div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{getName(service)}</div>
                <div style={{ fontSize: '0.8rem', color: theme.colors.neutral[500], marginTop: 4 }}>
                  {service.name}
                </div>
              </div>
              <div>
                <div style={{ ...labelStyle, marginBottom: 4 }}>{t('services.details.fee')}</div>
                <span style={{ color: theme.colors.success, fontWeight: 700, fontSize: '1.1rem' }}>
                  {formatFee(service.fee, service.currency)}
                </span>
              </div>
              <div>
                <div style={{ ...labelStyle, marginBottom: 4 }}>{t('services.details.department')}</div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: theme.colors.neutral[300], fontSize: '0.9rem' }}>
                  <Building2 style={{ width: 14, height: 14, color: theme.colors.neutral[500] }} />
                  {service.department}
                </span>
              </div>
              <div>
                <div style={{ ...labelStyle, marginBottom: 4 }}>{t('services.details.processingTime')}</div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.accent.gold, fontSize: '0.9rem' }}>
                  <Clock style={{ width: 14, height: 14 }} />
                  {service.processing_time_days} {t('time.days')}
                </span>
              </div>
              <div>
                <div style={{ ...labelStyle, marginBottom: 8, textAlign: 'center' }}>{t('common.actions')}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openModal(service)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer',
                      color: theme.colors.neutral[400], padding: '10px', borderRadius: 8,
                      display: 'flex', transition: 'all 0.2s',
                    }}
                    title={t('common.edit')}
                  >
                    <Edit2 style={{ width: 18, height: 18 }} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer',
                      color: '#f87171', padding: '10px', borderRadius: 8,
                      display: 'flex', transition: 'all 0.2s',
                    }}
                    title={t('common.delete')}
                  >
                    <Trash2 style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#1e293b', width: '100%', maxWidth: 560, maxHeight: '90vh',
            borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                {editingId ? t('common.edit') : t('common.create')}
              </h2>
              <button 
                onClick={closeModal} 
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', 
                  color: theme.colors.neutral[400], padding: 4, borderRadius: 6,
                  display: 'flex', transition: 'color 0.2s',
                }}
              >
                <X style={{ width: 22, height: 22 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(90vh - 80px)' }}>
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ ...labelStyle }}>{t('auth.register.firstName')} (English) *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle }}>{t('auth.register.firstName')} (العربية) *</label>
                  <input
                    type="text"
                    value={form.name_ar}
                    onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                    style={{ ...inputStyle, textAlign: 'right' }}
                    required
                    dir="rtl"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle }}>{t('services.details.description')} (English)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle }}>{t('services.details.description')} (العربية)</label>
                  <textarea
                    value={form.description_ar}
                    onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical', textAlign: 'right' }}
                    dir="rtl"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ ...labelStyle }}>{t('services.details.fee')} *</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select
                        value={form.currency}
                        onChange={(e) => setForm({ ...form, currency: e.target.value })}
                        style={{ ...inputStyle, width: 'auto', minWidth: 110, cursor: 'pointer' }}
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        value={form.fee}
                        onChange={(e) => setForm({ ...form, fee: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...labelStyle }}>{t('services.details.processingTime')} *</label>
                    <input
                      type="number"
                      value={form.processingTimeDays}
                      onChange={(e) => setForm({ ...form, processingTimeDays: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ ...labelStyle }}>{t('services.details.department')} *</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={inputStyle}
                    required
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle }}>{t('services.details.requiredDocuments')}</label>
                  <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 14px' }}>
                    <DocPicker
                      selected={form.requiredDocuments}
                      onChange={(docs) => setForm({ ...form, requiredDocuments: docs })}
                      t={t}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1, padding: '14px', borderRadius: 10,
                    background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
                    border: 'none', color: '#0f172a', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;