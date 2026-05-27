import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FileText, Clock, CheckCircle, XCircle, Download, Eye, MessageSquare, Plus, Settings } from 'lucide-react';
import theme from '../theme';
import { formatFee } from '../lib/currency';

const statusConfig = {
  pending:    { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  Icon: Clock },
  processing: { color: '#60a5fa', bg: 'rgba(96,165,250,0.15)',  Icon: Clock },
  completed:  { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  Icon: CheckCircle },
  rejected:   { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   Icon: XCircle },
};

const card = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  backdropFilter: 'blur(12px)',
};

const StatCard = ({ icon, label, value, accent }) => (
  <div style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 48, height: 48, borderRadius: 13, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <p style={{ color: theme.colors.neutral[400], fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, lineHeight: 1 }}>{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status, label }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  const { Icon } = cfg;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
      <Icon style={{ width: 11, height: 11 }} />
      {label}
    </span>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const statusLabels = {
    pending:    t('status.pending'),
    processing: t('status.processing'),
    completed:  t('status.completed'),
    rejected:   t('status.rejected'),
  };

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/requests');
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const stats = {
    total:      requests.length,
    pending:    requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    completed:  requests.filter(r => r.status === 'completed').length,
  };

  const thCell = { padding: '10px 20px', color: theme.colors.neutral[500], fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };
  const tdCell = { padding: '14px 20px', color: theme.colors.neutral[300], fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' };

  return (
    <div style={{ backgroundColor: '#0c1120', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ color: theme.colors.accent.gold, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {t('dashboard.welcomeBack')}
            </p>
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700 }}>
              {user?.firstName} {user?.lastName}
            </h1>
            <p style={{ color: theme.colors.neutral[500], fontSize: '0.875rem', marginTop: 4 }}>{t('dashboard.subtitle')}</p>
          </div>

          {user?.role === 'ADMIN' && (
            <Link to="/admin/services" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 12,
              background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`,
              color: '#0f172a', fontWeight: 700, fontSize: '0.875rem',
              textDecoration: 'none', boxShadow: `0 4px 14px ${theme.colors.accent.gold}30`,
              transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Settings style={{ width: 16, height: 16 }} />
              {t('admin.services', 'Manage Services')}
            </Link>
          )}
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          <StatCard icon={<FileText style={{ color: '#fff', width: 22, height: 22 }} />}   label={t('dashboard.stats.total')}      value={stats.total}      accent="linear-gradient(135deg, #475569, #334155)" />
          <StatCard icon={<Clock style={{ color: '#fff', width: 22, height: 22 }} />}      label={t('dashboard.stats.pending')}    value={stats.pending}    accent="linear-gradient(135deg, #d97706, #b45309)" />
          <StatCard icon={<Clock style={{ color: '#fff', width: 22, height: 22 }} />}      label={t('dashboard.stats.processing')} value={stats.processing} accent="linear-gradient(135deg, #3b82f6, #1d4ed8)" />
          <StatCard icon={<CheckCircle style={{ color: '#fff', width: 22, height: 22 }} />} label={t('dashboard.stats.completed')}  value={stats.completed}  accent="linear-gradient(135deg, #10b981, #059669)" />
        </div>

        {/* Requests Table */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{t('dashboard.table.title')}</p>
            <Link to="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`, color: '#0f172a', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}>
              <Plus style={{ width: 14, height: 14 }} />
              {t('dashboard.table.newRequest')}
            </Link>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: theme.colors.neutral[500] }}>{t('dashboard.table.loading')}</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText style={{ color: theme.colors.neutral[600], width: 24, height: 24 }} />
              </div>
              <p style={{ color: theme.colors.neutral[500], marginBottom: 16 }}>{t('dashboard.table.empty')}</p>
              <Link to="/chat" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: theme.colors.accent.gold, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>
                <Plus style={{ width: 14, height: 14 }} />
                {t('dashboard.table.startFirst')}
              </Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['id','service','fee','status','submitted','docs','actions'].map(col => (
                      <th key={col} style={thCell}>{t(`dashboard.table.columns.${col}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr key={req.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdCell, color: theme.colors.accent.gold, fontWeight: 600 }}>#{req.id}</td>
                      <td style={{ ...tdCell, color: '#fff' }}>{req.serviceName}</td>
                      <td style={{ ...tdCell, color: theme.colors.success, fontWeight: 600 }}>{formatFee(req.fee, req.service?.currency)}</td>
                      <td style={tdCell}><StatusBadge status={req.status} label={statusLabels[req.status] || req.status} /></td>
                      <td style={tdCell}>{formatDate(req.createdAt)}</td>
                      <td style={tdCell}>{req.documents?.length || 0} {t('documents.upload').split(' ')[0]}</td>
                      <td style={{ ...tdCell, textAlign: 'right' }}>
                        <button onClick={() => setSelectedRequest(req)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.neutral[500], marginRight: 12, transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = theme.colors.accent.gold}
                          onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[500]}
                        >
                          <Eye style={{ width: 15, height: 15 }} />
                        </button>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.neutral[500], transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = theme.colors.neutral[200]}
                          onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[500]}
                        >
                          <Download style={{ width: 15, height: 15 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 200 }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedRequest(null); }}
        >
          <div style={{ ...card, width: '100%', maxWidth: 560, maxHeight: '85vh', overflowY: 'auto', borderRadius: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#12192e', borderRadius: '24px 24px 0 0' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 600 }}>{t('dashboard.modal.title')}</p>
                <p style={{ color: theme.colors.neutral[500], fontSize: '0.8rem', marginTop: 2 }}>#{selectedRequest.id}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: theme.colors.neutral[400], width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: t('dashboard.table.columns.service'),   value: selectedRequest.serviceName },
                  { label: t('dashboard.table.columns.fee'),       value: formatFee(selectedRequest.fee, selectedRequest.service?.currency) },
                  { label: t('dashboard.table.columns.submitted'), value: formatDate(selectedRequest.createdAt) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</p>
                    <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{value}</p>
                  </div>
                ))}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{t('dashboard.table.columns.status')}</p>
                  <StatusBadge status={selectedRequest.status} label={statusLabels[selectedRequest.status] || selectedRequest.status} />
                </div>
              </div>

              {selectedRequest.documents?.length > 0 && (
                <div>
                  <p style={{ color: theme.colors.neutral[400], fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {t('dashboard.modal.uploadedDocs')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedRequest.documents.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                        <FileText style={{ color: theme.colors.accent.gold, width: 15, height: 15 }} />
                        <span style={{ color: theme.colors.neutral[300], fontSize: '0.85rem' }}>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{t('dashboard.modal.notes')}</p>
                  <p style={{ color: theme.colors.neutral[300], fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'sticky', bottom: 0, background: '#12192e', borderRadius: '0 0 24px 24px' }}>
              <button onClick={() => setSelectedRequest(null)} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: theme.colors.neutral[300], cursor: 'pointer', fontSize: '0.875rem' }}>
                {t('dashboard.modal.close')}
              </button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: `linear-gradient(135deg, ${theme.colors.accent.gold}, ${theme.colors.accent.goldDark})`, border: 'none', color: '#0f172a', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                <MessageSquare style={{ width: 14, height: 14 }} />
                {t('dashboard.modal.support')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
