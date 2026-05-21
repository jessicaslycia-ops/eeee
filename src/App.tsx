import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Users, ShieldCheck, Sparkles, X, Check, Trash2, Eye, ChevronLeft, Globe, MapPin, RefreshCw, Camera, Save, Pencil, User, Lock } from 'lucide-react';
import './index.css';
import BorderGlow from './BorderGlow';

type Tab = 'buy' | 'clients' | 'admin';
type BuyView = 'select' | 'local' | 'international';
type Locale = 'id' | 'en';

interface Commission {
  id: number;
  name: string;
  reference_link: string;
  pose_outfit: string;
  notes: string;
  sfw: boolean;
  nsfw: boolean;
  checked: boolean;
  accepted: boolean;
  progress: number;
  created_at: string;
}

interface Setting {
  key: string;
  value: string;
}

const MAX_SLOTS = 5;

const COMMISSION_TYPES_EN = [
  { id: 'half', label: 'Half Body', price: '$49' },
  { id: 'knee', label: 'Knee Up', price: '$59' },
  { id: 'full', label: 'Full Body', price: '$70' },
];

const COMMISSION_TYPES_ID = [
  { id: 'half', label: 'Half Body', price: 'Rp. 55.000' },
  { id: 'knee', label: 'Knee Up', price: 'Rp. 70.000' },
  { id: 'full', label: 'Full Body', price: 'Rp. 90.000' },
];

const glassStyle = {
  background: 'rgba(25, 20, 35, 0.45)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
};

const textGlow = {
  textShadow: '0 0 20px rgba(192, 132, 252, 0.4)',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('buy');
  const [buyView, setBuyView] = useState<BuyView>('select');
  const [lang, setLang] = useState<Locale>('id');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  const [termsEn, setTermsEn] = useState('');
  const [termsId, setTermsId] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [localLocked, setLocalLocked] = useState(false);
  const [internationalLocked, setInternationalLocked] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Commission | null>(null);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/commissions');
      if (!res.ok) throw new Error('Failed to fetch data');
      const data = await res.json();
      setCommissions(data);
      setFetchError(null);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      setFetchError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data: Setting[] = await res.json();
      data.forEach(s => {
        if (s.key === 'terms_en') setTermsEn(s.value);
        if (s.key === 'terms_id') setTermsId(s.value);
        if (s.key === 'profile_photo') setProfilePhoto(s.value);
        if (s.key === 'lock_local') setLocalLocked(s.value === 'true');
        if (s.key === 'lock_intl') setInternationalLocked(s.value === 'true');
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCommissions();
    fetchSettings();
    const t = localStorage.getItem('admin_token');
    if (t) {
      setAdminToken(t);
      setAdminLoggedIn(true);
    }
  }, []);

  const handleRegionClick = (region: 'local' | 'international') => {
    if (region === 'local' && !localLocked) {
      setLang('id');
      setBuyView('local');
    } else if (region === 'international' && !internationalLocked) {
      setLang('en');
      setBuyView('international');
    }
  };

  const getLocale = (): Locale => lang;
  const getTerms = () => (lang === 'id' ? termsId : termsEn);

  const t = {
    id: {
      title: 'KENTZIN COMMISSION',
      subtitle: 'Slot Terbatas • Proses Transparan',
      navBuy: 'Beli',
      navClients: 'Klien',
      navAdmin: 'Admin',
      slots: 'Slot Terisi',
    },
    en: {
      title: 'KENTZIN COMMISSION',
      subtitle: 'Limited Slots • Transparent Process',
      navBuy: 'Order',
      navClients: 'Clients',
      navAdmin: 'Admin',
      slots: 'Slots Filled',
    },
  }[lang];

  const acceptedCount = commissions.filter(c => c.accepted).length;

  return (
    <div className="min-h-screen bg-[#0B0813] text-gray-100 font-sans relative overflow-x-hidden selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-950/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 pt-12 pb-6 text-center px-4">
        <div className="relative inline-block mb-4 group">
          <div className="absolute inset-0 bg-gradient-to-r provinces bg-purple-500 to-pink-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-all duration-700 scale-110" />
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Avatar"
              className="w-24 h-24 rounded-full border border-white/10 p-1 bg-[#120F1D] relative z-10 object-cover shadow-2xl"
            />
          ) : (
            <div className="w-24 h-24 rounded-full border border-white/10 p-1 bg-[#120F1D] relative z-10 flex items-center justify-center shadow-2xl">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          )}
        </div>
        <h1
          className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-gray-200 to-gray-500 mb-2"
          style={textGlow}
        >
          {t.title}
        </h1>
        <p className="text-xs md:text-sm font-medium text-gray-400 max-w-md mx-auto tracking-wide">
          {t.subtitle}
        </p>

        {/* Slot Progress */}
        <div className="mt-6 inline-flex flex-col items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/[0.04] backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <span>{t.slots}</span>
            <span className="text-purple-400 font-mono text-sm bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
              {acceptedCount} / {MAX_SLOTS}
            </span>
          </div>
          <div className="w-32 h-1.5 bg-white/[0.05] rounded-full overflow-hidden p-0.5 border border-white/[0.02]">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              style={{ width: `${Math.min((acceptedCount / MAX_SLOTS) * 100, 100)}%` }}
            />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-center gap-1 max-w-sm mx-auto mb-8 p-1.5 rounded-2xl bg-white/[0.01] border border-white/[0.03] backdrop-blur-md px-4">
        <button
          onClick={() => {
            setActiveTab('buy');
            setBuyView('select');
          }}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'buy'
              ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 text-white shadow-xl shadow-black/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <PenLine className="w-3.5 h-3.5" />
          {t.navBuy}
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'clients'
              ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 text-white shadow-xl shadow-black/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {t.navClients}
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === 'admin'
              ? 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/10 text-white shadow-xl shadow-black/20'
              : 'text-gray-400 hover:text-gray-200 border border-transparent'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          {t.navAdmin}
        </button>
      </nav>

      {/* Content */}
      <div className="relative z-10 px-4 pb-20 max-w-4xl mx-auto">
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="#120F17"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
        >
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'buy' && (
                <BuySection
                  key="buy"
                  view={buyView}
                  setView={setBuyView}
                  locale={getLocale()}
                  termsText={getTerms()}
                  adminLoggedIn={adminLoggedIn}
                  onTermsUpdate={fetchSettings}
                  localLocked={localLocked}
                  internationalLocked={internationalLocked}
                  onRegionClick={handleRegionClick}
                />
              )}
              {activeTab === 'clients' && (
                <ClientList
                  key="clients"
                  commissions={commissions}
                  loading={loading}
                  error={fetchError}
                  lastUpdated={lastUpdated}
                  onRefresh={() => {
                    fetchCommissions();
                    fetchSettings();
                  }}
                  locale={getLocale()}
                />
              )}
              {activeTab === 'admin' && (
                <AdminSection
                  key="admin"
                  adminLoggedIn={adminLoggedIn}
                  setAdminLoggedIn={setAdminLoggedIn}
                  adminToken={adminToken}
                  setAdminToken={setAdminToken}
                  commissions={commissions}
                  loading={loading}
                  error={fetchError}
                  lastUpdated={lastUpdated}
                  onRefresh={() => {
                    fetchCommissions();
                    fetchSettings();
                  }}
                  selectedClient={selectedClient}
                  setSelectedClient={setSelectedClient}
                  onUpdate={fetchCommissions}
                  termsEn={termsEn}
                  termsId={termsId}
                  profilePhoto={profilePhoto}
                  localLocked={localLocked}
                  internationalLocked={internationalLocked}
                  onSettingsUpdate={fetchSettings}
                />
              )}
            </AnimatePresence>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
}

function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className} style={glassStyle}>
      {children}
    </div>
  );
}

function BuySection({ view, setView, locale, termsText, adminLoggedIn, onTermsUpdate, localLocked, internationalLocked, onRegionClick }: {
  view: BuyView;
  setView: (v: BuyView) => void;
  locale: Locale;
  termsText: string;
  adminLoggedIn: boolean;
  onTermsUpdate: () => void;
  localLocked: boolean;
  internationalLocked: boolean;
  onRegionClick: (r: 'local' | 'international') => void;
}) {
  const txt = {
    id: {
      selectRegion: 'PILIH WILAYAH ANDA',
      selectDesc: 'Silakan pilih lokasi domisili Anda untuk penyesuaian mata uang dan metode pembayaran.',
      local: 'Indonesia (IDR)',
      intl: 'International (USD)',
      back: 'Kembali',
      locked: 'Sesi Pemesanan Ditutup',
    },
    en: {
      selectRegion: 'SELECT YOUR REGION',
      selectDesc: 'Please choose your country of residence for currency and payment method adjustments.',
      local: 'Indonesia (IDR)',
      intl: 'International (USD)',
      back: 'Back',
      locked: 'Order Session Closed',
    },
  }[locale];

  if (view === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="max-w-md mx-auto text-center"
      >
        <h2 className="text-sm font-black tracking-widest text-purple-400 uppercase mb-3">{txt.selectRegion}</h2>
        <p className="text-xs text-gray-400 mb-8 leading-relaxed max-w-xs mx-auto">{txt.selectDesc}</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onRegionClick('local')}
            disabled={localLocked}
            className={`w-full py-4 px-6 rounded-2xl border font-bold text-sm tracking-wide transition-all flex items-center justify-between group ${
              localLocked
                ? 'bg-red-950/10 border-red-500/10 text-gray-500 cursor-not-allowed'
                : 'bg-white/[0.02] border-white/[0.05] text-white hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className={`w-4 h-4 ${localLocked ? 'text-red-500/40' : 'text-purple-400'}`} />
              <span>{txt.local}</span>
            </div>
            {localLocked && <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">{txt.locked}</span>}
          </button>
          <button
            onClick={() => onRegionClick('international')}
            disabled={internationalLocked}
            className={`w-full py-4 px-6 rounded-2xl border font-bold text-sm tracking-wide transition-all flex items-center justify-between group ${
              internationalLocked
                ? 'bg-red-950/10 border-red-500/10 text-gray-500 cursor-not-allowed'
                : 'bg-white/[0.02] border-white/[0.05] text-white hover:bg-white/[0.05] hover:border-white/10 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className={`w-4 h-4 ${internationalLocked ? 'text-red-500/40' : 'text-pink-400'}`} />
              <span>{txt.intl}</span>
            </div>
            {internationalLocked && <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">{txt.locked}</span>}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setView('select')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-white/[0.02] border border-white/[0.05] px-3 py-1.5 rounded-xl transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {txt.back}
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400/70 bg-purple-500/5 border border-purple-500/10 px-2.5 py-1 rounded-lg">
          {view === 'local' ? 'IDR MODE' : 'USD MODE'}
        </span>
      </div>
      <CommissionForm region={view} locale={locale} termsText={termsText} adminLoggedIn={adminLoggedIn} onTermsUpdate={onTermsUpdate} />
    </motion.div>
  );
}

function CommissionForm({ region, locale, termsText, adminLoggedIn, onTermsUpdate }: {
  region: 'local' | 'international';
  locale: Locale;
  termsText: string;
  adminLoggedIn: boolean;
  onTermsUpdate: () => void;
}) {
  const [activeFormTab, setActiveFormTab] = useState<'terms' | 'form'>('terms');
  const [formData, setFormData] = useState({
    name: '',
    reference_link: '',
    pose_outfit: '',
    notes: '',
    sfw: true,
    nsfw: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [editedTerms, setEditedTerms] = useState(termsText);

  useEffect(() => {
    setEditedTerms(termsText);
  }, [termsText]);

  const txt = {
    id: {
      tabTerms: 'Ketentuan',
      tabForm: 'Formulir',
      typeTitle: 'Pilihan Jenis Komisi',
      nameLabel: 'Nama Anda / Username',
      refLabel: 'Link Referensi Gambar',
      refDesc: 'Tautan Google Drive, Imgur, atau Pinterest berisi aset karakter.',
      poseLabel: 'Pose & Pakaian',
      notesLabel: 'Catatan Tambahan',
      sfwLabel: 'SFW (Aman)',
      nsfwLabel: 'NSFW (18+)',
      submit: 'Kirim Pesanan Komisi',
      success: 'Pesanan berhasil dikirim! Silakan tunggu konfirmasi melalui kontak Anda.',
      agreeCheck: 'Saya telah membaca dan menyetujui semua ketentuan di atas.',
      next: 'Lanjutkan',
    },
    en: {
      tabTerms: 'Terms of Service',
      tabForm: 'Order Form',
      typeTitle: 'Commission Types Available',
      nameLabel: 'Your Name / Username',
      refLabel: 'Reference Image Link',
      refDesc: 'Google Drive, Imgur, or Pinterest link containing character assets.',
      poseLabel: 'Pose & Outfit Details',
      notesLabel: 'Additional Notes',
      sfwLabel: 'SFW (Safe)',
      nsfwLabel: 'NSFW (18+)',
      submit: 'Submit Commission Order',
      success: 'Order submitted successfully! Please wait for confirmation via your contact info.',
      agreeCheck: 'I have read and agree to all the terms specified above.',
      next: 'Proceed',
    },
  }[locale];

  const types = region === 'local' ? COMMISSION_TYPES_ID : COMMISSION_TYPES_EN;

  const handleSaveTerms = async () => {
    try {
      const key = locale === 'id' ? 'terms_id' : 'terms_en';
      const token = localStorage.getItem('admin_token');
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value: editedTerms }),
      });
      if (!res.ok) throw new Error('Failed to update terms');
      setIsEditingTerms(false);
      onTermsUpdate();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setFormError(locale === 'id' ? 'Nama wajib diisi' : 'Name is required');
    try {
      setSubmitting(true);
      setFormError(null);
      const res = await fetch('/api/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, region }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }
      setSuccessMsg(txt.success);
      setFormData({ name: '', reference_link: '', pose_outfit: '', notes: '', sfw: true, nsfw: false });
    } catch (err: any) {
      setFormError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <GlassCard className="p-8 rounded-3xl text-center border border-emerald-500/20 bg-emerald-950/5">
        <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-emerald-200 leading-relaxed max-w-sm mx-auto">{successMsg}</p>
        <button
          onClick={() => setSuccessMsg(null)}
          className="mt-6 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white transition-all bg-white/[0.02] border border-white/[0.05] px-4 py-2 rounded-xl"
        >
          Ok
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Kiri: Daftar Harga */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase px-1">{txt.typeTitle}</h3>
        {types.map(t => (
          <GlassCard key={t.id} className="p-4 rounded-2xl flex items-center justify-between border border-white/[0.02] hover:border-purple-500/10 transition-all group">
            <div>
              <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{t.label}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Digital Artwork</p>
            </div>
            <span className="text-sm font-black font-mono text-purple-400 bg-purple-500/5 px-3 py-1 rounded-xl border border-purple-500/10 shadow-inner">
              {t.price}
            </span>
          </GlassCard>
        ))}
      </div>

      {/* Kanan: Form/Terms Area */}
      <div className="lg:col-span-8">
        {/* Sub Tabs */}
        <div className="flex gap-2 border-b border-white/[0.04] mb-6 pb-2">
          <button
            onClick={() => setActiveFormTab('terms')}
            className={`pb-2 px-1 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeFormTab === 'terms' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {txt.tabTerms}
          </button>
          <button
            onClick={() => setActiveFormTab('form')}
            className={`pb-2 px-1 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
              activeFormTab === 'form' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {txt.tabForm}
          </button>
        </div>

        {activeFormTab === 'terms' ? (
          <GlassCard className="p-6 rounded-2xl border border-white/[0.02] relative">
            {adminLoggedIn && (
              <div className="absolute top-4 right-4 z-20">
                {isEditingTerms ? (
                  <div className="flex gap-2">
                    <button onClick={handleSaveTerms} className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs">
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setIsEditingTerms(false)} className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-gray-400 text-xs">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingTerms(true)} className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/20 transition-all">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {isEditingTerms ? (
              <textarea
                value={editedTerms}
                onChange={e => setEditedTerms(e.target.value)}
                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-xs font-mono text-gray-300 focus:outline-none focus:border-purple-500/50"
              />
            ) : (
              <div className="prose prose-invert max-w-none text-xs md:text-sm text-gray-400 leading-relaxed whitespace-pre-wrap max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {termsText || (locale === 'id' ? 'Belum ada ketentuan.' : 'No terms specified.')}
              </div>
            )}

            {!isEditingTerms && (
              <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-end">
                <button
                  onClick={() => setActiveFormTab('form')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-purple-500/10"
                >
                  {txt.next}
                </button>
              </div>
            )}
          </GlassCard>
        ) : (
          <GlassCard className="p-6 rounded-2xl border border-white/[0.02]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {formError && <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium">{formError}</div>}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{txt.nameLabel} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all"
                  placeholder="e.g. KentzinArt"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{txt.refLabel}</label>
                <p className="text-[10px] text-gray-500 mb-2 leading-normal">{txt.refDesc}</p>
                <input
                  type="url"
                  value={formData.reference_link}
                  onChange={e => setFormData({ ...formData, reference_link: e.target.value })}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{txt.poseLabel}</label>
                <textarea
                  value={formData.pose_outfit}
                  onChange={e => setFormData({ ...formData, pose_outfit: e.target.value })}
                  rows={3}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all resize-none"
                  placeholder="e.g. Standing pose, black hoodie, looking at camera..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{txt.notesLabel}</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500/40 focus:bg-white/[0.04] transition-all resize-none"
                  placeholder="..."
                />
              </div>

              <div className="flex gap-6 py-2 px-1 border-y border-white/[0.03]">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.sfw}
                    onChange={e => setFormData({ ...formData, sfw: e.target.checked })}
                    className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.02] text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-wider">{txt.sfwLabel}</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.nsfw}
                    onChange={e => setFormData({ ...formData, nsfw: e.target.checked })}
                    className="w-4 h-4 rounded border-white/[0.08] bg-white/[0.02] text-purple-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-xs font-bold text-gray-400 group-hover:text-gray-200 transition-colors uppercase tracking-wider">{txt.nsfwLabel}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 disabled:from-purple-800 disabled:to-pink-800 text-white font-bold text-xs uppercase tracking-widest hover:opacity-95 active:scale-[0.99] transition-all shadow-lg shadow-purple-500/10 flex items-center justify-center gap-2 mt-2"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                {txt.submit}
              </button>
            </form>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

function ClientList({ commissions, loading, error, lastUpdated, onRefresh, locale }: {
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onRefresh: () => void;
  locale: Locale;
}) {
  const txt = {
    id: {
      title: 'DAFTAR PROSES KOMISI',
      desc: 'Transparansi antrean dan status pengerjaan karya seni secara real-time.',
      empty: 'Beluk ada data antrean komisi saat ini.',
    },
    en: {
      title: 'COMMISSION QUEUE LIST',
      desc: 'Real-time transparency of the active commission queue and progress status.',
      empty: 'There are no active commission queues at the moment.',
    },
  }[locale];

  const activeClients = commissions.filter(c => c.accepted);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-6">
        <div>
          <h2 className="text-sm font-black tracking-widest text-purple-400 uppercase">{txt.title}</h2>
          <p className="text-[11px] text-gray-500 mt-1 leading-normal">{txt.desc}</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium mb-4">{error}</div>}

      {activeClients.length === 0 ? (
        <GlassCard className="p-8 rounded-2xl text-center border border-dashed border-white/[0.04]">
          <p className="text-xs text-gray-500">{txt.empty}</p>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3.5">
          {activeClients.map((c, index) => (
            <GlassCard key={c.id} className="p-5 rounded-2xl border border-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs font-bold text-gray-600 bg-white/[0.01] border border-white/[0.03] w-7 h-7 rounded-lg flex items-center justify-center shadow-inner">
                  #{String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white tracking-wide">{c.name}</h4>
                  <div className="flex gap-3 mt-1">
                    {c.sfw && <span className="text-[9px] font-black tracking-wider text-emerald-400 uppercase bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">SFW</span>}
                    {c.nsfw && <span className="text-[9px] font-black tracking-wider text-pink-400 uppercase bg-pink-500/5 px-1.5 py-0.5 rounded border border-pink-500/10">NSFW</span>}
                  </div>
                </div>
              </div>

              {/* Progress Bar Right Side */}
              <div className="flex flex-col items-end gap-1.5 sm:min-w-[140px]">
                <div className="flex justify-between w-full text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  <span>Progress</span>
                  <span className="font-mono text-purple-400 font-semibold">{c.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/[0.04] rounded-full overflow-hidden p-0.5 border border-white/[0.01]">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {lastUpdated && <p className="text-center text-[10px] font-mono text-gray-600 mt-6 uppercase tracking-wider">Sync: {lastUpdated}</p>}
    </motion.div>
  );
}

function AdminSection({
  adminLoggedIn, setAdminLoggedIn, adminToken, setAdminToken, commissions, loading, error, lastUpdated, onRefresh,
  selectedClient, setSelectedClient, onUpdate, termsEn, termsId, profilePhoto, localLocked, internationalLocked, onSettingsUpdate
}: {
  adminLoggedIn: boolean;
  setAdminLoggedIn: (l: boolean) => void;
  adminToken: string | null;
  setAdminToken: (t: string | null) => void;
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onRefresh: () => void;
  selectedClient: Commission | null;
  setSelectedClient: (c: Commission | null) => void;
  onUpdate: () => void;
  termsEn: string;
  termsId: string;
  profilePhoto: string;
  localLocked: boolean;
  internationalLocked: boolean;
  onSettingsUpdate: () => void;
}) {
  const [password, setPassword] = useState('');
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoggingIn(true);
      setLoginErr(null);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Invalid Credentials');
      const data = await res.json();
      localStorage.setItem('admin_token', data.token);
      setAdminToken(data.token);
      setAdminLoggedIn(true);
    } catch (err: any) {
      setLoginErr(err.message || 'Login failed');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAdminToken(null);
    setAdminLoggedIn(false);
    setSelectedClient(null);
  };

  if (!adminLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="max-w-xs mx-auto"
      >
        <GlassCard className="p-6 rounded-2xl border border-white/[0.02]">
          <h2 className="text-xs font-black tracking-widest text-center text-purple-400 uppercase mb-4">ADMIN ACCESS</h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            {loginErr && <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-medium">{loginErr}</div>}
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/40"
                placeholder="🔑 Access Key..."
              />
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-bold text-xs uppercase tracking-wider text-white"
            >
              {loggingIn ? 'Verifying...' : 'Unlock Panel'}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
    >
      {/* Kiri: List Antrean Masuk */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <AdminSettingsCard profilePhoto={profilePhoto} localLocked={localLocked} internationalLocked={internationalLocked} token={adminToken} onUpdate={onSettingsUpdate} onLogout={handleLogout} />
        <AdminQueueList commissions={commissions} loading={loading} error={error} lastUpdated={lastUpdated} onRefresh={onRefresh} onSelect={setSelectedClient} activeId={selectedClient?.id || null} />
      </div>

      {/* Kanan: Detail & Aksi Manajemen */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {selectedClient ? (
            <AdminClientDetail key={selectedClient.id} client={selectedClient} token={adminToken} onUpdate={() => { onUpdate(); setSelectedClient(null); }} onClose={() => setSelectedClient(null)} />
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <GlassCard className="p-8 rounded-2xl border border-dashed border-white/[0.04] text-center text-gray-500 text-xs">
                Silakan pilih antrean klien di sebelah kiri untuk mengelola status, mengubah progres, atau meninjau formulir.
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function AdminSettingsCard({ profilePhoto, localLocked, internationalLocked, token, onUpdate, onLogout }: {
  profilePhoto: string;
  localLocked: boolean;
  internationalLocked: boolean;
  token: string | null;
  onUpdate: () => void;
  onLogout: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(profilePhoto);
  const [localLockOn, setLocalLockOn] = useState(localLocked);
  const [intlLockOn, setIntlLockOn] = useState(internationalLocked);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPhotoUrl(profilePhoto);
    setLocalLockOn(localLocked);
    setIntlLockOn(internationalLocked);
  }, [profilePhoto, localLocked, internationalLocked]);

  const saveSettings = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error('Update failed');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    await saveSettings('profile_photo', photoUrl);
    await saveSettings('lock_local', String(localLockOn));
    await saveSettings('lock_intl', String(intlLockOn));
    setSaving(false);
    onUpdate();
  };

  return (
    <GlassCard className="p-4 rounded-2xl border border-white/[0.02]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/[0.03]">
        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">System Controls</span>
        <button onClick={onLogout} className="text-[10px] font-bold text-red-400 uppercase bg-red-500/5 px-2 py-1 rounded border border-red-500/10">Logout</button>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Avatar URL</label>
          <div className="relative">
            <Camera className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-500" />
            <input
              type="url"
              value={photoUrl}
              onChange={e => setPhotoUrl(e.target.value)}
              className="w-full bg-white/[0.01] border border-white/[0.05] rounded-xl pl-9 pr-4 py-1.5 text-xs text-gray-300 focus:outline-none"
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => setLocalLockOn(!localLockOn)}
            className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-2 ${
              localLockOn ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-white/[0.01] border-white/[0.05] text-gray-400'
            }`}
          >
            <Lock className="w-3 h-3" />
            Local {localLockOn ? 'Locked' : 'Open'}
          </button>
          <button
            type="button"
            onClick={() => setIntlLockOn(!intlLockOn)}
            className={`flex-1 py-2 px-3 rounded-xl text-[11px] font-bold tracking-wider uppercase border transition-all flex items-center justify-center gap-2 ${
              intlLockOn ? 'bg-red-500/10 border-red-500/20 text-red-300' : 'bg-white/[0.01] border-white/[0.05] text-gray-400'
            }`}
          >
            <Lock className="w-3 h-3" />
            Intl {intlLockOn ? 'Locked' : 'Open'}
          </button>
          <button onClick={handleSaveAll} disabled={saving} className="px-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center">
            {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function AdminQueueList({ commissions, loading, error, lastUpdated, onRefresh, onSelect, activeId }: {
  commissions: Commission[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  onRefresh: () => void;
  onSelect: (c: Commission) => void;
  activeId: number | null;
}) {
  const [adminTab, setAdminTab] = useState<'inbox' | 'active'>('inbox');
  const inboxItems = commissions.filter(c => !c.accepted);
  const activeItems = commissions.filter(c => c.accepted);
  const currentList = adminTab === 'inbox' ? inboxItems : activeItems;

  return (
    <GlassCard className="p-4 rounded-2xl border border-white/[0.02]">
      <div className="flex items-center justify-between border-b border-white/[0.03] pb-2 mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setAdminTab('inbox')}
            className={`text-xs font-black tracking-wider uppercase pb-1 border-b-2 transition-all ${
              adminTab === 'inbox' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500'
            }`}
          >
            Inbox ({inboxItems.length})
          </button>
          <button
            onClick={() => setAdminTab('active')}
            className={`text-xs font-black tracking-wider uppercase pb-1 border-b-2 transition-all ${
              adminTab === 'active' ? 'border-purple-500 text-white' : 'border-transparent text-gray-500'
            }`}
          >
            Active ({activeItems.length})
          </button>
        </div>
        <button onClick={onRefresh} disabled={loading} className="p-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-gray-500 hover:text-white">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
        {currentList.length === 0 ? (
          <p className="text-center text-[10px] text-gray-600 py-6 uppercase tracking-wider">Kosong</p>
        ) : (
          currentList.map(c => (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                activeId === c.id
                  ? 'bg-purple-500/10 border-purple-500/30 text-white shadow-md'
                  : 'bg-white/[0.01] border-white/[0.03] text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
              }`}
            >
              <div className="truncate max-w-[140px]">
                <p className="font-bold truncate text-white">{c.name}</p>
                <p className="text-[9px] text-gray-500 mt-0.5 font-mono">{new Date(c.created_at).toLocaleDateString()}</p>
              </div>
              {adminTab === 'active' ? (
                <span className="font-mono text-[10px] font-bold text-purple-400 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">{c.progress}%</span>
              ) : (
                <span className={`w-2 h-2 rounded-full ${c.checked ? 'bg-gray-600' : 'bg-blue-400 animate-pulse'}`} />
              )}
            </button>
          ))
        )}
      </div>
    </GlassCard>
  );
}

function AdminClientDetail({ client, token, onUpdate, onClose }: {
  client: Commission;
  token: string | null;
  onUpdate: () => void;
  onClose: () => void;
}) {
  const [prog, setProg] = useState(client.progress);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setProg(client.progress);
    if (!client.checked) {
      fetch(`/api/commissions/${client.id}/check`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(console.error);
    }
  }, [client]);

  const handleAccept = async () => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/commissions/${client.id}/accept`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Action failed');
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/commissions/${client.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ progress: prog }),
      });
      if (!res.ok) throw new Error('Progress update failed');
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus selamanya pesanan ini?')) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/commissions/${client.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Delete failed');
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
      <GlassCard className="p-6 rounded-2xl border border-white/[0.02]">
        {/* Header Aksi */}
        <div className="flex items-center justify-between border-b border-white/[0.03] pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded border ${
              client.accepted ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
            }`}>
              {client.accepted ? 'Active Queue' : 'Inbox New'}
            </span>
          </div>
          <div className="flex gap-1.5">
            <button onClick={handleDelete} disabled={updating} className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formulir Details */}
        <div className="flex flex-col gap-4 mb-6 bg-black/10 p-4 rounded-xl border border-white/[0.01]">
          <DetailRow label="Client Name" value={client.name} />
          <DetailRow label="Reference Link" value={client.reference_link} isLink />
          <DetailRow label="Pose & Outfit" value={client.pose_outfit} />
          <DetailRow label="Notes" value={client.notes} />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Content Rating</p>
            <div className="flex gap-2">
              {client.sfw && <span className="text-[10px] font-bold text-emerald-400">SFW (Aman)</span>}
              {client.nsfw && <span className="text-[10px] font-bold text-pink-400">NSFW (18+)</span>}
            </div>
          </div>
        </div>

        {/* Manajemen Status Utama */}
        <div className="pt-4 border-t border-white/[0.03]">
          {!client.accepted ? (
            <button
              onClick={handleAccept}
              disabled={updating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold text-xs uppercase tracking-widest text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Masukkan ke Antrean Utama
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                <label>Atur Progres Kerja</label>
                <span className="font-mono text-purple-400">{prog}%</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={prog}
                  onChange={e => setProg(Number(e.target.value))}
                  className="flex-1 accent-purple-500 bg-white/[0.05] h-1 rounded-lg cursor-pointer"
                />
                <button
                  onClick={handleUpdateProgress}
                  disabled={updating || prog === client.progress}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider hover:bg-purple-500/30 transition-all disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

function DetailRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline break-all font-medium inline-flex items-center gap-1">
          <Eye className="w-3 h-3 flex-shrink-0" /> Lihat Dokumen / Aset Gambar
        </a>
      ) : (
        <p className="text-xs text-gray-200 leading-relaxed font-medium whitespace-pre-wrap">{value}</p>
      )}
    </div>
  );
}
