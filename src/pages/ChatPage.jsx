import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useDir } from '../hooks/useDir';
import { formatFee } from '../lib/currency';
import axios from 'axios';
import { Bot, Send, Paperclip, X, FileText, Upload, CheckCircle, AlertCircle, Phone, Clock } from 'lucide-react';
import CallSupportModal from '../components/CallSupportModal';
import theme from '../theme';

const services = [
  { id: 1, nameKey: 'services.types.passportRenewal', fee: 50, time: '14 days', documents: ['Passport photo', 'Proof of address', 'Existing passport'] },
  { id: 2, nameKey: 'services.types.nationalId', fee: 25, time: '7 days', documents: ['Birth certificate', 'Proof of address', 'Passport photo'] },
  { id: 3, nameKey: 'services.types.carInsurance', fee: 150, time: '3 days', documents: ['Vehicle registration', 'Driver license', 'ID proof'] },
  { id: 4, nameKey: 'services.types.businessLicense', fee: 200, time: '21 days', documents: ['Business plan', 'ID proof', 'Address proof'] },
];

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  backdropFilter: 'blur(12px)',
};

const ChatPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isRTL } = useDir();
  const isGuest = !user;
  const svcName = (s) => (i18n.language === 'ar' && s?.name_ar) ? s.name_ar : s?.name;
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: t('chat.greeting') + (isGuest ? '\n\n' + t('chat.guestInfo') : ''), timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServices, setShowServices] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [, setServiceRequest] = useState(null);
  const [, setPaymentStatus] = useState(null);
  const [guestPromptedLogin, setGuestPromptedLogin] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/services');
        setServices(res.data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowServices(false);
    const docs = service.required_documents || [];
    const docList = docs.map((doc, i) => `${i + 1}. ${t(`documents.${doc}`)}`).join('\n');
    setMessages(prev => [...prev,
      { id: Date.now(), role: 'user', content: `${t('chat.applyFor')} ${svcName(service)}`, timestamp: new Date() },
    ]);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant', timestamp: new Date(),
        content: `${t('chat.greatChoice')} ${svcName(service)}, ${t('chat.youllNeed')}\n\n${docList}\n\n${t('chat.fee')}${formatFee(service.fee, service.currency)}\n${t('chat.estimatedTime')} ${service.processing_time_days} ${t('time.days')}\n\n${t('chat.uploadDocsGuidance')}`,
      }]);
    }, 500);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter(f => ['image/jpeg', 'image/png', 'application/pdf'].includes(f.type) && f.size <= 10 * 1024 * 1024);
    const newFiles = valid.map(f => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type, file: f }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setMessages(prev => [...prev, {
      id: Date.now(), role: 'assistant', timestamp: new Date(),
      content: t('chat.filesReceived', { count: newFiles.length }),
    }]);
  };

  const removeFile = (fileId) => setUploadedFiles(prev => prev.filter(f => f.id !== fileId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (!selectedService) {
      const matched = services.find(s => input.toLowerCase().includes(s.name.toLowerCase()));
      if (matched) { handleServiceSelect(matched); return; }
    }

    if (selectedService && uploadedFiles.length > 0 && input.toLowerCase().includes('pay')) {
      if (isGuest) {
        setMessages(prev => [...prev, {
          id: Date.now(), role: 'assistant', timestamp: new Date(),
          content: t('chat.loginRequired'),
        }]);
        setGuestPromptedLogin(true);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.post('http://localhost:5000/api/requests', {
          userId: user.id, serviceId: selectedService.id,
          serviceName: selectedService.name, fee: selectedService.fee,
          documents: uploadedFiles.map(f => f.name),
        });
        setServiceRequest(res.data);
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', timestamp: new Date(),
          content: t('chat.submitted', { service: selectedService.name, id: res.data.id }),
        }]);
        setPaymentStatus('success');
      } catch {
        setMessages(prev => [...prev, {
          id: Date.now() + 1, role: 'assistant', timestamp: new Date(),
          content: t('chat.submitError'),
        }]);
      } finally { setLoading(false); }
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        message: input,
        context: { selectedService, uploadedFiles, user: user || null, isGuest }
      });
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: res.data.message, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant', timestamp: new Date(),
        content: t('chat.fallback'),
      }]);
    } finally { setLoading(false); }
  };

  const formatSize = (b) => b < 1024 ? b + ' B' : b < 1024 * 1024 ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB';

  return (
    <div style={{ backgroundColor: '#0c1120', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row' }}>

      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <div style={{
          ...card, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
          padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `${theme.colors.accent.gold}20`, border: `1px solid ${theme.colors.accent.gold}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot style={{ color: theme.colors.accent.gold, width: 18, height: 18 }} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', lineHeight: 1 }}>{t('chat.title')}</p>
            <p style={{ color: theme.colors.success, fontSize: '0.72rem', marginTop: 3 }}>● {t('chat.online')}</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Service Quick Select */}
          {showServices && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ color: theme.colors.neutral[400], fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                {t('chat.quickSelect')}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {services.map(service => (
                  <button key={service.id} onClick={() => handleServiceSelect(service)} style={{
                    ...card, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.08)', transition: 'border-color 0.2s, transform 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.colors.accent.gold}50`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', marginBottom: 6 }}>{svcName(service)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: theme.colors.success, fontSize: '0.75rem', fontWeight: 600 }}>{formatFee(service.fee, service.currency)}</span>
                      <span style={{ color: theme.colors.accent.gold, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Clock style={{ width: 11, height: 11 }} />{service.processing_time_days} {t('time.days')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(message => (
            <div key={message.id} style={{ display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {message.role === 'assistant' && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0, marginTop: 2,
                  background: `${theme.colors.accent.gold}20`, border: `1px solid ${theme.colors.accent.gold}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot style={{ color: theme.colors.accent.gold, width: 14, height: 14 }} />
                </div>
              )}
              <div style={{
                maxWidth: '70%',
                background: message.role === 'user'
                  ? `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`
                  : 'rgba(255,255,255,0.05)',
                border: message.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: message.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                padding: '10px 14px', backdropFilter: 'blur(12px)',
              }}>
                <p style={{ color: message.role === 'user' ? '#0f172a' : '#fff', fontSize: '0.875rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {message.content}
                </p>
                <p style={{ color: message.role === 'user' ? 'rgba(15,23,42,0.6)' : theme.colors.neutral[600], fontSize: '0.7rem', marginTop: 6 }}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${theme.colors.accent.gold}20`, border: `1px solid ${theme.colors.accent.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot style={{ color: theme.colors.accent.gold, width: 14, height: 14 }} />
              </div>
              <div style={{ ...card, padding: '10px 16px', display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: theme.colors.neutral[500], animation: 'bounce 1s infinite', animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File tray */}
        {uploadedFiles.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px', background: 'rgba(255,255,255,0.02)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {uploadedFiles.map(file => (
              <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 10px' }}>
                <FileText style={{ color: theme.colors.accent.gold, width: 13, height: 13 }} />
                <span style={{ color: theme.colors.neutral[300], fontSize: '0.78rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <span style={{ color: theme.colors.neutral[500], fontSize: '0.72rem' }}>({formatSize(file.size)})</span>
                <button onClick={() => removeFile(file.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.neutral[500], display: 'flex' }}>
                  <X style={{ width: 13, height: 13 }} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={handleSubmit} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} multiple accept="image/jpeg,image/png,application/pdf" />
          <button type="button" onClick={() => fileInputRef.current?.click()} style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.colors.neutral[400], transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = theme.colors.accent.gold}
            onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[400]}
          >
            <Paperclip style={{ width: 16, height: 16 }} />
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={t('chat.placeholder')} style={{
            flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, color: '#fff', padding: '10px 16px', fontSize: '0.875rem', outline: 'none',
          }}
            onFocus={e => e.target.style.borderColor = `${theme.colors.accent.gold}50`}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button type="submit" disabled={loading} style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.5 : 1,
          }}>
            <Send style={{ color: '#0f172a', width: 16, height: 16 }} />
          </button>
        </form>
      </div>

      {/* Service Detail Sidebar */}
      {selectedService && (
        <div style={{ width: 280, flexShrink: 0, borderLeft: isRTL ? 'none' : '1px solid rgba(255,255,255,0.07)', borderRight: isRTL ? '1px solid rgba(255,255,255,0.07)' : 'none', padding: '24px 20px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: theme.colors.neutral[400], fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {t('chat.serviceDetails')}
          </p>

          <div style={{ ...card, padding: 16 }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', marginBottom: 10 }}>{svcName(selectedService)}</p>
            <p style={{ color: theme.colors.accent.gold, fontSize: '1.5rem', fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>{formatFee(selectedService.fee, selectedService.currency)}</p>
            <p style={{ color: theme.colors.neutral[500], fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 12, height: 12 }} />{selectedService.processing_time_days} {t('time.days')}
            </p>
          </div>

          <div>
            <p style={{ color: theme.colors.neutral[400], fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              {t('chat.requiredDocuments')}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(selectedService.required_documents || []).map((doc, i) => {
                const translatedDoc = t(`documents.${doc}`);
                const uploaded = uploadedFiles.some(f => f.name.toLowerCase().includes(doc.toLowerCase()));
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {uploaded
                      ? <CheckCircle style={{ width: 15, height: 15, color: theme.colors.success, flexShrink: 0 }} />
                      : <AlertCircle style={{ width: 15, height: 15, color: theme.colors.warning, flexShrink: 0 }} />}
                    <span style={{ color: uploaded ? theme.colors.neutral[300] : theme.colors.neutral[500], fontSize: '0.82rem' }}>{translatedDoc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button onClick={() => fileInputRef.current?.click()} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '10px', borderRadius: 12, background: 'transparent',
            border: `2px dashed rgba(255,255,255,0.15)`, color: theme.colors.neutral[400],
            fontSize: '0.82rem', cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${theme.colors.accent.gold}50`; e.currentTarget.style.color = theme.colors.accent.gold; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = theme.colors.neutral[400]; }}
          >
            <Upload style={{ width: 15, height: 15 }} />
            {t('chat.uploadDocuments')}
          </button>

          {uploadedFiles.length >= (selectedService.required_documents || []).length && (
            <button onClick={() => setInput('I am ready to pay the fee')} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px', borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.colors.success}, #059669)`,
              color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer',
            }}>
              <CheckCircle style={{ width: 16, height: 16 }} />
              {t('chat.proceedPayment')}
            </button>
          )}

          <button onClick={() => setShowCallModal(true)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px', borderRadius: 10, background: 'none', border: 'none',
            color: theme.colors.neutral[500], fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = theme.colors.neutral[300]}
            onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[500]}
          >
            <Phone style={{ width: 14, height: 14 }} />
            {t('chat.talkHuman')}
          </button>
          {showCallModal && <CallSupportModal onClose={() => setShowCallModal(false)} />}
        </div>
      )}
    </div>
  );
};

export default ChatPage;
