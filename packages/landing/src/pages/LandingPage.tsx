import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Smartphone,
  CloudOff,
  Zap,
  Shield,
  Users,
  Layout,
  PenTool,
  Cpu,
  ArrowLeft,
  Database,
  RefreshCw,
  FileText,
  Send,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useTranslation, useDirection } from '@/i18n';
import { LanguageSelector } from '@/components/layout/LanguageSelector';

const NICHES = [
  { id: 'medical', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'technical', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'construction', icon: Layout, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'sales', icon: PenTool, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'security', icon: Users, color: 'text-slate-500', bg: 'bg-slate-50' },
];

const FEATURES = [
  { id: 'pwa', icon: Smartphone },
  { id: 'offlineFirst', icon: CloudOff },
  { id: 'signatureSmoothing', icon: PenTool },
  { id: 'aiDetection', icon: Cpu },
];

export function LandingPage() {
  const t = useTranslation();
  const direction = useDirection();
  const [activeNiche, setActiveNiche] = useState('medical');

  // App URL from environment variable
  const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.rightflow.co.il';

  const isRtl = direction === 'rtl';

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans selection:bg-[#FF6100]/20" dir={direction}>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0A1551] to-[#1E2B7A] rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <span className="text-2xl font-black tracking-tight text-[#0A1551]">
              Right<span className="text-[#FF6100]">Flow</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-[#0A1551] transition-colors">{isRtl ? 'פיצ׳רים' : 'Features'}</a>
            <a href="#use-cases" className="text-sm font-semibold text-slate-600 hover:text-[#0A1551] transition-colors">{isRtl ? 'מקרי שימוש' : 'Use Cases'}</a>
            <a href="#integrations" className="text-sm font-semibold text-slate-600 hover:text-[#0A1551] transition-colors">{isRtl ? 'אינטגרציות' : 'Integrations'}</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSelector />
            <a href={`${APP_URL}/sign-in`} className="hidden sm:block text-sm font-bold text-[#0A1551] hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors">
              {isRtl ? 'התחברות' : 'Login'}
            </a>
            <a href={`${APP_URL}/sign-up`} className="bg-[#FF6100] hover:bg-[#E65700] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 text-sm uppercase tracking-wide">
              {t.getStarted}
            </a>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section - Field Agent Focus */}
        <section className="pt-40 pb-32 md:pt-52 md:pb-40 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.03, 0.05, 0.03],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#0A1551] rounded-full blur-[120px]"
            />
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                x: [0, 100, 0],
                opacity: [0.04, 0.06, 0.04],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FF6100] rounded-full blur-[100px]"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-10"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 text-[#FF6100] text-xs font-black uppercase tracking-widest border-2 border-orange-200 shadow-lg shadow-orange-100"
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="relative flex h-2 w-2"
                  >
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6100]"></span>
                  </motion.span>
                  {isRtl ? 'עובדי שטח → ERP אוטומטי' : 'Field Agents → Auto ERP'}
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-6xl md:text-8xl font-black text-[#0A1551] leading-[0.95] tracking-tight"
                >
                  {isRtl ? (
                    <>
                      <span className="block">טפסים בשטח.</span>
                      <span className="block text-[#FF6100]">נתונים ב-ERP.</span>
                      <span className="block text-5xl md:text-6xl mt-4 text-slate-600">מיידית.</span>
                    </>
                  ) : (
                    <>
                      <span className="block">Field Forms.</span>
                      <span className="block text-[#FF6100]">ERP Data.</span>
                      <span className="block text-5xl md:text-6xl mt-4 text-slate-600">Instantly.</span>
                    </>
                  )}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="text-2xl text-slate-600 leading-relaxed max-w-xl font-medium"
                >
                  {isRtl
                    ? 'עובדי השטח שלך ממלאים טפסים מהמובייל. הנתונים זורמים אוטומטית ישירות למערכת ה-ERP. אפס עבודה ידנית.'
                    : 'Your field agents fill forms on mobile. Data flows automatically straight to your ERP system. Zero manual work.'}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <a
                    href={`${APP_URL}/sign-up`}
                    className="group bg-[#FF6100] hover:bg-[#E65700] text-white text-xl font-black px-12 py-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-orange-500/40 hover:shadow-orange-500/60 hover:scale-105 active:scale-95"
                  >
                    {t.getStarted}
                    <motion.div
                      animate={{ x: isRtl ? [-3, 0] : [0, 3] }}
                      transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
                    >
                      {isRtl ? <ArrowLeft className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
                    </motion.div>
                  </a>
                  <button className="bg-white hover:bg-slate-50 text-[#0A1551] font-black px-12 py-6 rounded-2xl border-2 border-slate-200 transition-all shadow-lg hover:shadow-xl text-xl">
                    {t.viewDemo}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.9 }}
                  className="flex items-center gap-8 pt-8 border-t-2 border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    <div className="text-sm">
                      <div className="font-black text-[#0A1551] text-2xl">95%</div>
                      <div className="text-slate-500 font-bold">{isRtl ? 'חיסכון בזמן' : 'Time Saved'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-blue-600" />
                    <div className="text-sm">
                      <div className="font-black text-[#0A1551] text-2xl">500+</div>
                      <div className="text-slate-500 font-bold">{isRtl ? 'צוותי שטח' : 'Field Teams'}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Hero Image - Field Agent */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative"
              >
                <div className="relative">
                  {/* Main Image */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="relative bg-white p-6 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(10,21,81,0.25)] border-2 border-slate-100 overflow-hidden"
                  >
                    <div className="rounded-[2.5rem] overflow-hidden relative">
                      <img
                        src="/images/scene-1.png"
                        alt="Field Agent with RightFlow"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>

                  {/* Floating Data Card - Top Right */}
                  <motion.div
                    initial={{ opacity: 0, x: 20, y: -20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="absolute -top-6 -right-6 bg-white p-5 rounded-2xl shadow-2xl border-2 border-slate-100"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3"
                    >
                      <RefreshCw className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-xs font-black text-slate-400 uppercase">Auto Sync</div>
                    <div className="text-lg font-black text-[#0A1551]">{isRtl ? 'פעיל' : 'Active'}</div>
                  </motion.div>

                  {/* Floating Form Card - Bottom Left */}
                  <motion.div
                    initial={{ opacity: 0, x: -20, y: 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.4 }}
                    className="absolute -bottom-6 -left-6 bg-gradient-to-br from-[#0A1551] to-[#1E2B7A] p-6 rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-14 h-14 rounded-xl bg-[#FF6100] flex items-center justify-center"
                      >
                        <FileText className="w-7 h-7 text-white" />
                      </motion.div>
                      <div className="text-white">
                        <div className="text-xs font-black text-orange-300 uppercase">Forms Today</div>
                        <div className="text-3xl font-black">247</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Animated Data Flow Section */}
        <section className="py-40 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-black text-[#0A1551] mb-6">
                {isRtl ? 'איך זה עובד?' : 'How it works'}
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
                {isRtl
                  ? 'תהליך פשוט וחכם שחוסך שעות עבודה כל יום'
                  : 'A simple, smart process that saves hours of work every day'}
              </p>
            </motion.div>

            {/* Animated Flow Steps */}
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6100]/20 to-transparent" />

              {/* Step 1: Field Agent */}
              <motion.div
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100 relative z-10 hover:shadow-2xl transition-shadow">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6"
                  >
                    <img src="/images/baseline.png" alt="Field Agent" className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#FF6100] to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    1
                  </div>
                  <h3 className="text-2xl font-black text-[#0A1551] mb-3">
                    {isRtl ? 'עובד שטח ממלא' : 'Agent Fills Form'}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {isRtl
                      ? 'טכנאי, מפקח או נציג מכירות ממלא טופס ישירות מהמובייל - גם ללא אינטרנט'
                      : 'Technician, inspector, or sales rep fills form directly from mobile - even offline'}
                  </p>
                </div>
              </motion.div>

              {/* Step 2: Smart Processing */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-[#0A1551] to-[#1E2B7A] p-8 rounded-[2.5rem] shadow-xl relative z-10 text-white hover:shadow-2xl transition-shadow">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-white/10 backdrop-blur-sm flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="w-24 h-24 rounded-full border-8 border-white/20 border-t-[#FF6100] border-r-[#FF6100]"
                    />
                  </motion.div>
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-[#FF6100] to-orange-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    2
                  </div>
                  <h3 className="text-2xl font-black mb-3">
                    {isRtl ? 'עיבוד חכם' : 'Smart Processing'}
                  </h3>
                  <p className="text-slate-200 leading-relaxed font-medium">
                    {isRtl
                      ? 'RightFlow מנקה, מאמת ומבנה את הנתונים אוטומטית - תמונות, חתימות, שדות'
                      : 'RightFlow automatically cleans, validates, and structures data - images, signatures, fields'}
                  </p>
                </div>
              </motion.div>

              {/* Step 3: ERP Integration */}
              <motion.div
                initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="relative"
              >
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100 relative z-10 hover:shadow-2xl transition-shadow">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 2 }}
                    className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 1 }}
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center"
                    >
                      <Database className="w-16 h-16 text-white" />
                    </motion.div>
                  </motion.div>
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    3
                  </div>
                  <h3 className="text-2xl font-black text-[#0A1551] mb-3">
                    {isRtl ? 'ישירות ל-ERP' : 'Straight to ERP'}
                  </h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {isRtl
                      ? 'הנתונים זורמים אוטומטית למערכת ה-ERP שלך - Priority, SAP, Monday או כל מערכת אחרת'
                      : 'Data flows automatically to your ERP system - Priority, SAP, Monday, or any other platform'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Time Saved Indicator */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-20 text-center"
            >
              <div className="inline-block bg-gradient-to-r from-[#0A1551] to-[#1E2B7A] rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-6">
                  <Clock className="w-12 h-12 text-[#FF6100]" />
                  <div className="text-left">
                    <div className="text-sm font-black text-orange-300 uppercase tracking-wider">
                      {isRtl ? 'זמן ממוצע' : 'Average Time'}
                    </div>
                    <div className="text-4xl font-black text-white">
                      {isRtl ? '2 דקות' : '2 Minutes'}
                    </div>
                    <div className="text-sm text-slate-300 font-bold">
                      {isRtl ? 'מהשטח למערכת' : 'Field to System'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Matrix Grid */}
        <section id="features" className="py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-[#0A1551] mb-6">
                {isRtl ? 'הכלים הנכונים לעבודה בשטח' : 'The right tools for the field'}
              </h2>
              <p className="text-lg text-slate-600 font-medium">
                RightFlow 2.0 {isRtl ? 'נבנה מאפס כדי לתת מענה לאתגרים של עובדי שטח ישראלים.' : 'was built from the ground up to solve the challenges of Israeli field teams.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature) => (
                <motion.div
                  key={feature.id}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#FF6100] transition-all">
                    <feature.icon className="w-7 h-7 text-[#0A1551] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A1551] mb-4">
                    {(t as any)[`${feature.id}Title`]}
                  </h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    {(t as any)[`${feature.id}Desc`]}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Real-World Success Stories */}
        <section id="use-cases" className="py-40 bg-gradient-to-br from-slate-900 via-[#0A1551] to-slate-900 overflow-hidden relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#FF6100] blur-[150px]"
            />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                {isRtl ? 'סיפורי הצלחה מהשטח' : 'Real-World Success'}
              </h2>
              <p className="text-xl text-slate-300 font-medium max-w-2xl mx-auto">
                {isRtl ? 'איך חברות ישראליות מובילות חוסכות שעות עבודה בכל יום' : 'How leading Israeli companies save hours of work every day'}
              </p>
            </motion.div>

            {/* Success Story Cards */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Story 1: Signature & Completion */}
              <motion.div
                initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[3rem] p-8 md:p-10 hover:bg-white/15 transition-all"
              >
                <div className="rounded-[2rem] overflow-hidden mb-8 shadow-2xl">
                  <img
                    src="/images/scene-2.png"
                    alt="Digital Signature"
                    className="w-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6100]/20 text-[#FF6100] text-xs font-black uppercase">
                    <PenTool className="w-3 h-3" />
                    {isRtl ? 'חתימה דיגיטלית' : 'Digital Signature'}
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    {isRtl ? 'חתימות חכמות, תהליך מהיר' : 'Smart Signatures, Fast Process'}
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'טכנאי שטח אוספים חתימות לקוחות ישירות במובייל. אין צורך בסריקה, פקס או העברה ידנית. הכל זורם אוטומטית למערכת.'
                      : 'Field technicians collect customer signatures directly on mobile. No scanning, faxing, or manual transfer needed. Everything flows automatically to the system.'}
                  </p>
                  <div className="pt-4 flex items-center gap-4 border-t border-white/10">
                    <div className="flex-1">
                      <div className="text-4xl font-black text-[#FF6100]">87%</div>
                      <div className="text-sm font-bold text-slate-400">{isRtl ? 'פחות זמן עיבוד' : 'Less Processing Time'}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-4xl font-black text-white">100%</div>
                      <div className="text-sm font-bold text-slate-400">{isRtl ? 'דיגיטלי' : 'Digital'}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Story 2: Client Approval */}
              <motion.div
                initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                whileHover={{ y: -10 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[3rem] p-8 md:p-10 hover:bg-white/15 transition-all"
              >
                <div className="rounded-[2rem] overflow-hidden mb-8 shadow-2xl">
                  <img
                    src="/images/scene-3.png"
                    alt="Client Approval"
                    className="w-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-black uppercase">
                    <CheckCircle2 className="w-3 h-3" />
                    {isRtl ? 'אישור מיידי' : 'Instant Approval'}
                  </div>
                  <h3 className="text-3xl font-black text-white">
                    {isRtl ? 'אישור בשטח, עדכון מיידי' : 'Field Approval, Instant Update'}
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed">
                    {isRtl
                      ? 'נציגי מכירות וטכנאים מקבלים אישור לקוח בזמן אמת. הנתונים מתעדכנים אוטומטית במערכת ה-CRM ללא המתנה או תיעוד ידני.'
                      : 'Sales reps and technicians get client approval in real-time. Data updates automatically in the CRM system without waiting or manual documentation.'}
                  </p>
                  <div className="pt-4 flex items-center gap-4 border-t border-white/10">
                    <div className="flex-1">
                      <div className="text-4xl font-black text-green-400">2 Min</div>
                      <div className="text-sm font-bold text-slate-400">{isRtl ? 'זמן ממוצע' : 'Average Time'}</div>
                    </div>
                    <div className="flex-1">
                      <div className="text-4xl font-black text-white">0</div>
                      <div className="text-sm font-bold text-slate-400">{isRtl ? 'שגיאות ידניות' : 'Manual Errors'}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Industry Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-20 text-center"
            >
              <div className="inline-flex flex-wrap justify-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                {NICHES.map((niche) => (
                  <button
                    key={niche.id}
                    onClick={() => setActiveNiche(niche.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      activeNiche === niche.id
                        ? 'bg-[#FF6100] text-white shadow-lg scale-105'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <niche.icon className="w-4 h-4" />
                    <span className="font-bold text-sm">{(t as any)[`${niche.id}Title`]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="py-40 bg-white relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#0A1551] via-[#1E2B7A] to-[#0A1551] rounded-[4rem] p-12 md:p-24 relative overflow-hidden"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#FF6100]/20 to-transparent pointer-events-none"
              />

              <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div className="space-y-8 text-white">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-orange-300 text-xs font-black uppercase tracking-widest backdrop-blur-sm border border-white/20"
                  >
                    <Send className="w-3 h-3" />
                    {isRtl ? 'אינטגרציה מיידית' : 'Instant Integration'}
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-6xl font-black"
                  >
                    {isRtl ? 'מתחברים לעולם שלכם' : 'Connects to Your World'}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-slate-300 text-xl leading-relaxed font-medium"
                  >
                    {isRtl
                      ? 'הזרם נתונים ישירות ל-Priority, SAP, Monday, Zoho או כל מערכת אחרת. התקנה של דקות, אפס קוד נדרש.'
                      : 'Stream data directly to Priority, SAP, Monday, Zoho, or any other system. Minutes to setup, zero code required.'}
                  </motion.p>

                  <div className="grid grid-cols-2 gap-4 pt-6">
                    {[
                      { name: 'Priority', detail: 'Israeli ERP', color: 'from-blue-500 to-blue-600' },
                      { name: 'SAP', detail: 'Enterprise', color: 'from-purple-500 to-purple-600' },
                      { name: 'Monday.com', detail: 'Project Mgmt', color: 'from-pink-500 to-pink-600' },
                      { name: 'ActivePieces', detail: '3000+ Apps', color: 'from-orange-500 to-orange-600' },
                    ].map((app, i) => (
                      <motion.div
                        key={app.name}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center font-black text-white text-sm shadow-lg`}>
                          {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{app.name}</div>
                          <div className="text-xs text-slate-400 font-bold uppercase tracking-wide">{app.detail}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="aspect-square bg-white rounded-[3rem] p-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 bg-gradient-to-br from-slate-50 to-orange-50 opacity-50"
                    />
                    <div className="relative z-10 text-center space-y-8">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-32 h-32 bg-gradient-to-br from-[#FF6100] to-orange-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/30"
                      >
                        <Database className="text-white w-16 h-16" />
                      </motion.div>
                      <h4 className="text-3xl font-black text-[#0A1551] uppercase tracking-tight">
                        {isRtl ? 'זרימת נתונים אוטומטית' : 'Auto Data Flow'}
                      </h4>
                      <div className="flex justify-center gap-3">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-3 h-3 rounded-full bg-[#FF6100]"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-20 bg-slate-50 border-y border-slate-100">
          <div className="container mx-auto px-6">
            <p className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-12">
              {t.socialProofTitle}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#0A1551]">MED-ISRAEL</div>
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#0A1551]">PHOENIX</div>
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#0A1551]">ELECTRA</div>
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#0A1551]">HAGALGAL</div>
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter text-[#0A1551]">SAFETY-PRO</div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/2 left-0 w-96 h-96 bg-[#FF6100] rounded-full blur-[150px]"
            />
            <motion.div
              animate={{
                x: [0, -100, 0],
                y: [0, -50, 0],
                scale: [1, 1.3, 1],
                opacity: [0.04, 0.08, 0.04],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#0A1551] rounded-full blur-[180px]"
            />
          </div>

          <div className="container mx-auto px-6 text-center space-y-16 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-200 shadow-lg"
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="w-5 h-5 text-[#FF6100] fill-current" />
                </motion.div>
                <span className="text-[#FF6100] font-black uppercase tracking-widest text-sm">
                  {isRtl ? 'הצטרף עכשיו' : 'Join Now'}
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-6xl md:text-8xl font-black text-[#0A1551] leading-[0.95]"
              >
                {isRtl ? (
                  <>
                    <span className="block">הנייר נגמר.</span>
                    <span className="block text-[#FF6100]">התזרים מתחיל.</span>
                  </>
                ) : (
                  <>
                    <span className="block">Paper ends.</span>
                    <span className="block text-[#FF6100]">Flow begins.</span>
                  </>
                )}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
              >
                {isRtl
                  ? 'הצטרפו ל-500+ חברות ישראליות שכבר חסכו אלפי שעות עבודה עם RightFlow.'
                  : 'Join 500+ Israeli companies that have already saved thousands of work hours with RightFlow.'}
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-6"
            >
              <motion.a
                href={`${APP_URL}/sign-up`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-[#FF6100] to-orange-600 hover:from-[#E65700] hover:to-orange-700 text-white text-2xl font-black px-16 py-7 rounded-2xl shadow-2xl shadow-orange-500/50 transition-all leading-none flex items-center justify-center gap-4"
              >
                {t.getStarted}
                <motion.div
                  animate={{ x: isRtl ? [-3, 0, -3] : [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {isRtl ? <ArrowLeft className="w-7 h-7" /> : <ArrowRight className="w-7 h-7" />}
                </motion.div>
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white hover:bg-slate-50 text-[#0A1551] text-2xl font-black px-16 py-7 rounded-2xl border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all leading-none"
              >
                {isRtl ? 'צור קשר' : 'Contact Us'}
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold">{isRtl ? 'אין צורך בכרטיס אשראי' : 'No credit card required'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold">{isRtl ? '14 יום ניסיון חינם' : '14-day free trial'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold">{isRtl ? 'ביטול בכל עת' : 'Cancel anytime'}</span>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 border-b border-white/10 pb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <Zap className="text-[#FF6100] w-6 h-6 fill-current" />
                <span className="text-2xl font-black tracking-tight">
                  Right<span className="text-[#FF6100]">Flow</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                The Israeli Gold Standard for field data collection and smart PDF flows. Built with precision for local teams.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#FF6100]">Product</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">PWA Guide</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#FF6100]">Support</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">RTL Docs</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-[#FF6100]">Legal</h4>
              <ul className="space-y-4 text-slate-400 text-sm font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">GDPR Israeli Addendum</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <p>© 2026 RightFlow Israel. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              System Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
