import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  FileText, Clock, CheckCircle, XCircle, Eye, Download,
  Search, RefreshCw, Settings, Check, X, Mail, Building2,
} from 'lucide-react';
import theme from '../theme';
import { formatFee } from '../lib/currency';

const statusStyle = {
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

const StatusBadge = ({ status, label }) => {
  const cfg = statusStyle[status] || statusStyle.pending;
  const { Icon } = cfg;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, color: cfg.color, background: cfg.bg }}>
      <Icon style={{ width: 11, height: 11 }} />
      {label}
    </span>
  );
};

const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, completed: 0, rejected: 0 });

  const statusLabels = {
    pending:    t('status.pending'),
    processing: t('status.processing'),
    completed:  t('status.completed'),
    rejected:   t('status.rejected'),
  };

  const statCards = [
    { key: 'all',        label: t('admin.stats.total'),      accent: 'linear-gradient(135deg, #475569, #334155)', Icon: FileText },
    { key: 'pending',    label: t('admin.stats.pending'),    accent: 'linear-gradient(135deg, #d97706, #b45309)', Icon: Clock },
    { key: 'processing', label: t('admin.stats.processing'), accent: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', Icon: Clock },
    { key: 'completed',  label: t('admin.stats.completed'),  accent: 'linear-gradient(135deg, #10b981, #059669)', Icon: CheckCircle },
    { key: 'rejected',   label: t('admin.stats.rejected'),   accent: 'linear-gradient(135deg, #ef4444, #dc2626)', Icon: XCircle },
  ];

  useEffect(() => { fetchRequests(); }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await axios.get(`http://localhost:5000/api/requests?${params.toString()}`);
      const all = res.data.requests || res.data;
      setRequests(all);
      setStats(res.data.stats || {
        total: all.length,
        pending:    all.filter(r => r.status === 'pending').length,
        processing: all.filter(r => r.status === 'processing').length,
        completed:  all.filter(r => r.status === 'completed').length,
        rejected:   all.filter(r => r.status === 'rejected').length,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId, newStatus, notes = '') => {
    setUpdating(true);
    try {
      await axios.patch(`http://localhost:5000/api/requests/${requestId}`, { status: newStatus, notes, adminId: user.id });
      fetchRequests();
      setSelectedRequest(null);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const filtered = requests.filter(r => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return r.id.toString().includes(q)
      || r.serviceName?.toLowerCase().includes(q)
      || r.user?.firstName?.toLowerCase().includes(q)
      || r.user?.lastName?.toLowerCase().includes(q)
      || r.user?.email?.toLowerCase().includes(q);
  });

  const statValue = (key) => key === 'all' ? stats.total : stats[key] ?? 0;

  const thCell = { padding: '10px 20px', color: theme.colors.neutral[500], fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap' };
  const tdCell = { padding: '14px 20px', color: theme.colors.neutral[300], fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' };

  return (
    <div style={{ backgroundColor: '#0c1120', minHeight: '100vh', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: theme.colors.accent.gold, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              {t('admin.label')}
            </p>
            <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Settings style={{ width: 24, height: 24, color: theme.colors.accent.gold }} />
              {t('admin.title')}
            </h1>
            <p style={{ color: theme.colors.neutral[500], fontSize: '0.875rem', marginTop: 4 }}>{t('admin.subtitle')}</p>
          </div>
          <button onClick={fetchRequests} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 11, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: theme.colors.neutral[300], cursor: 'pointer', fontSize: '0.875rem', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = theme.colors.neutral[300]}
          >
            <RefreshCw style={{ width: 15, height: 15 }} />
            {t('admin.refresh')}
          </button>
        </div>

        {/* Stat Filter Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
          {statCards.map(({ key, label, accent, Icon }) => {
            const isActive = statusFilter === key;
            return (
              <div key={key} onClick={() => setStatusFilter(key)} style={{ ...card, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', border: isActive ? `1px solid ${theme.colors.accent.gold}60` : '1px solid rgba(255,255,255,0.08)', boxShadow: isActive ? `0 0 0 1px ${theme.colors.accent.gold}30` : 'none', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 11, background: accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ color: '#fff', width: 19, height: 19 }} />
                </div>
                <div>
                  <p style={{ color: theme.colors.neutral[400], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</p>
                  <p style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{statValue(key)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table Card */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{t('admin.table.title')}</p>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: theme.colors.neutral[500], pointerEvents: 'none' }} />
              <input type="text" placeholder={t('admin.table.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#fff', padding: '8px 14px 8px 36px', fontSize: '0.82rem', outline: 'none', width: 220, fontFamily: theme.typography.fontFamily.en }}
                onFocus={e => e.target.style.borderColor = `${theme.colors.accent.gold}50`}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, textAlign: 'center', color: theme.colors.neutral[500] }}>{t('admin.table.loading')}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText style={{ color: theme.colors.neutral[600], width: 24, height: 24 }} />
              </div>
              <p style={{ color: theme.colors.neutral[500] }}>{t('admin.table.empty')}</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['id','user','service','fee','status','date','actions'].map(col => (
                      <th key={col} style={thCell}>{t(`admin.table.columns.${col}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(req => (
                    <tr key={req.id}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tdCell, color: theme.colors.accent.gold, fontWeight: 600 }}>#{req.id}</td>
                      <td style={tdCell}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: theme.colors.accent.gold, fontSize: '0.72rem', fontWeight: 700 }}>
                              {req.user?.firstName?.[0]}{req.user?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 500 }}>{req.user?.firstName} {req.user?.lastName}</p>
                            <p style={{ color: theme.colors.neutral[600], fontSize: '0.72rem' }}>{req.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdCell, color: '#fff' }}>{req.serviceName}</td>
                      <td style={{ ...tdCell, color: theme.colors.success, fontWeight: 600 }}>{formatFee(req.fee, req.service?.currency)}</td>
                      <td style={tdCell}><StatusBadge status={req.status} label={statusLabels[req.status] || req.status} /></td>
                      <td style={tdCell}>{formatDate(req.createdAt)}</td>
                      <td style={{ ...tdCell, textAlign: 'right' }}>
                        <button onClick={() => setSelectedRequest(req)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, cursor: 'pointer', color: theme.colors.neutral[300], fontSize: '0.75rem', padding: '5px 10px', transition: 'color 0.2s, border-color 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = theme.colors.accent.gold; e.currentTarget.style.borderColor = `${theme.colors.accent.gold}40`; }}
                          onMouseLeave={e => { e.currentTarget.style.color = theme.colors.neutral[300]; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                        >
                          <Eye style={{ width: 13, height: 13 }} />
                          {t('common.view')}
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 200 }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedRequest(null); }}
        >
          <div style={{ ...card, width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', borderRadius: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#12192e', borderRadius: '24px 24px 0 0' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 600 }}>#{selectedRequest.id}</p>
                <p style={{ color: theme.colors.neutral[500], fontSize: '0.8rem', marginTop: 2 }}>{selectedRequest.serviceName} — {formatDate(selectedRequest.createdAt)}</p>
              </div>
              <button onClick={() => setSelectedRequest(null)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', color: theme.colors.neutral[400], width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Applicant */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                <p style={{ color: theme.colors.neutral[400], fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  {t('admin.modal.applicant')}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: theme.colors.accent.gold, fontWeight: 700, fontSize: '0.85rem' }}>
                        {selectedRequest.user?.firstName?.[0]}{selectedRequest.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</p>
                      <p style={{ color: theme.colors.neutral[500], fontSize: '0.75rem' }}>ID: {selectedRequest.userId}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.neutral[400], fontSize: '0.78rem' }}>
                      <Mail style={{ width: 13, height: 13 }} />{selectedRequest.user?.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: theme.colors.neutral[400], fontSize: '0.78rem' }}>
                      <Building2 style={{ width: 13, height: 13 }} />{selectedRequest.user?.address || t('admin.modal.noAddress')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service details */}
              <div>
                <p style={{ color: theme.colors.neutral[400], fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                  {t('admin.modal.serviceDetails')}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: t('admin.table.columns.service'),  value: selectedRequest.serviceName },
                    { label: t('admin.table.columns.fee'),      value: formatFee(selectedRequest.fee, selectedRequest.service?.currency) },
                    { label: t('admin.table.columns.date'),     value: formatDate(selectedRequest.createdAt) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                      <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{label}</p>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{value}</p>
                    </div>
                  ))}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                    <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{t('admin.table.columns.status')}</p>
                    <StatusBadge status={selectedRequest.status} label={statusLabels[selectedRequest.status] || selectedRequest.status} />
                  </div>
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.documents?.length > 0 && (
                <div>
                  <p style={{ color: theme.colors.neutral[400], fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    {t('admin.modal.documents')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedRequest.documents.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <FileText style={{ color: theme.colors.accent.gold, width: 15, height: 15 }} />
                          <span style={{ color: theme.colors.neutral[300], fontSize: '0.85rem' }}>{typeof doc === 'string' ? doc : doc.name}</span>
                        </div>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.neutral[500] }}>
                          <Download style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.notes && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ color: theme.colors.neutral[500], fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>{t('admin.modal.adminNotes')}</p>
                  <p style={{ color: theme.colors.neutral[300], fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            {/* Footer — status actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', position: 'sticky', bottom: 0, background: '#12192e', borderRadius: '0 0 24px 24px' }}>
              <p style={{ color: theme.colors.neutral[500], fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                {t('admin.modal.updateStatus')}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {selectedRequest.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(selectedRequest.id, 'processing')} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: updating ? 0.6 : 1 }}>
                      <Check style={{ width: 14, height: 14 }} /> {t('admin.modal.startProcessing')}
                    </button>
                    <button onClick={() => updateStatus(selectedRequest.id, 'rejected', 'Request does not meet requirements')} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: updating ? 0.6 : 1 }}>
                      <X style={{ width: 14, height: 14 }} /> {t('admin.modal.reject')}
                    </button>
                  </>
                )}
                {selectedRequest.status === 'processing' && (
                  <>
                    <button onClick={() => updateStatus(selectedRequest.id, 'completed')} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: updating ? 0.6 : 1 }}>
                      <CheckCircle style={{ width: 14, height: 14 }} /> {t('admin.modal.markComplete')}
                    </button>
                    <button onClick={() => updateStatus(selectedRequest.id, 'rejected', 'Request does not meet requirements')} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: updating ? 0.6 : 1 }}>
                      <X style={{ width: 14, height: 14 }} /> {t('admin.modal.reject')}
                    </button>
                  </>
                )}
                {(selectedRequest.status === 'completed' || selectedRequest.status === 'rejected') && (
                  <button onClick={() => updateStatus(selectedRequest.id, 'processing')} disabled={updating} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', opacity: updating ? 0.6 : 1 }}>
                    <RefreshCw style={{ width: 14, height: 14 }} /> {t('admin.modal.reactivate')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
