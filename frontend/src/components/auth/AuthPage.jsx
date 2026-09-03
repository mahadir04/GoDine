import React, { useState, useEffect, useRef } from 'react';
import useStore, { IMAGES } from '../../store/store';
import {
  Eye, EyeOff, Building, User, ArrowLeft,
  CheckCircle, Settings, HelpCircle, X, Loader2, ShieldCheck, Mail, Lock
} from 'lucide-react';

const DEFAULT_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '697332021047-ggc1ogomnaeba7h9rdk1bqnjan5i75s2.apps.googleusercontent.com';

const AuthPage = ({ onBackToLanding }) => {
  const {
    loginAsync,
    registerAsync,
    oauthLoginAsync,
    googleOAuthLoginAsync,
    setActiveTab
  } = useStore();

  // Form state
  const [email, setEmail] = useState('diner@godine.com');
  const [password, setPassword] = useState('diner123');
  const [fullName, setFullName] = useState('Mahir Hasan');
  const [role, setRole] = useState('DINER');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Google OAuth state
  const [googleClientId, setGoogleClientId] = useState(
    localStorage.getItem('godine_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID
  );
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(googleClientId);

  const googleBtnRef = useRef(null);
  const gsiScriptRef = useRef(null);

  // ─── Initialize Google GSI SDK ──────────────────────────────────────────────
  const initGSI = (clientId) => {
    if (!clientId || !window.google?.accounts?.id) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (googleBtnRef.current) {
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 380,
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
      });
      setIsGsiLoaded(true);
    }
  };

  useEffect(() => {
    if (!googleClientId) {
      setIsGsiLoaded(false);
      return;
    }

    if (window.google?.accounts?.id) {
      initGSI(googleClientId);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => initGSI(googleClientId);
    script.onerror = () => {
      console.warn('Could not load Google Identity Services SDK.');
      setIsGsiLoaded(false);
    };
    document.head.appendChild(script);
    gsiScriptRef.current = script;

    return () => {
      if (gsiScriptRef.current && document.head.contains(gsiScriptRef.current)) {
        document.head.removeChild(gsiScriptRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleClientId]);

  // ─── Real Google Credential Handler ───────────────────────────────────────
  const handleGoogleCredential = async (response) => {
    if (!response?.credential) return;
    setIsLoading(true);
    setStatusMsg('Verifying Google account with server…');
    setErrorMsg('');
    try {
      await googleOAuthLoginAsync(response.credential);
      setActiveTab('home');
    } catch (err) {
      setErrorMsg(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
      setStatusMsg('');
    }
  };

  // ─── Manual Fallback / Prompt Trigger ─────────────────────────────────────
  const handleGoogleSignIn = () => {
    if (window.google?.accounts?.id && googleClientId) {
      setStatusMsg('Opening Google sign-in…');
      window.google.accounts.id.prompt((notification) => {
        setStatusMsg('');
        if (notification.isNotDisplayed()) {
          setErrorMsg(
            `Google One Tap was suppressed (${notification.getNotDisplayedReason()}). ` +
            'Please use the primary sign-in form.'
          );
        }
      });
    } else {
      handleMockOAuth();
    }
  };

  // ─── JWT Email/Password Login & Register ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      if (isSignUp) {
        await registerAsync({ email, password, full_name: fullName, role });
      } else {
        await loginAsync(email, password);
      }
      setActiveTab('home');
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Demo OAuth Fallback ─────────────────────────────────────────────────
  const handleMockOAuth = async () => {
    setErrorMsg('');
    setIsLoading(true);
    setStatusMsg('Connecting to Google…');
    try {
      const mockPayload = {
        provider: 'google',
        email: 'google.demo@godine.app',
        full_name: 'Google User',
        avatar_url: IMAGES.alexAvatar,
        provider_id: 'demo_google_001',
      };
      await oauthLoginAsync(mockPayload);
      setActiveTab('home');
    } catch (err) {
      setErrorMsg(err.message || 'Google OAuth failed.');
    } finally {
      setIsLoading(false);
      setStatusMsg('');
    }
  };

  const saveClientId = () => {
    const id = clientIdInput.trim();
    setGoogleClientId(id);
    if (id) {
      localStorage.setItem('godine_google_client_id', id);
    } else {
      localStorage.removeItem('godine_google_client_id');
    }
    setShowGoogleSetup(false);
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] selection:bg-[#FF5A5F] selection:text-white">

      {/* ── Left Hero Panel ──────────────────────────────────────────────── */}
      <div className="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen bg-zinc-950 overflow-hidden flex flex-col justify-between p-8 md:p-14 text-white">
        <img
          src={IMAGES.restaurantHero}
          alt="Atmospheric Restaurant"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-700 hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-zinc-950/40" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A5F] to-rose-400 flex items-center justify-center text-white font-black shadow-md shadow-[#FF5A5F]/20">
              G
            </div>
            <span className="text-2xl font-black tracking-tight text-white">GoDine</span>
          </div>

          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer border border-white/15 hover:border-white/30"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Bottom Headline */}
        <div className="relative z-10 max-w-lg space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF5A5F]/20 border border-[#FF5A5F]/40 text-[#FF5A5F] text-xs font-extrabold shadow-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure JWT Token & Google OAuth 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight text-white">
            Discover, Stay & Dine at Great Places Nearby
          </h1>

          <p className="text-sm text-zinc-300 font-medium leading-relaxed max-w-md">
            Join thousands of foodies and venue owners. Get real-time deals, instant bookings, and personalized recommendations.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <div className="w-8 h-1.5 rounded-full bg-[#FF5A5F]" />
            <div className="w-2 h-1.5 rounded-full bg-white/30" />
            <div className="w-2 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 my-auto">
        <div className="max-w-md w-full space-y-6">

          {/* Card Container */}
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-7 md:p-9 shadow-xl shadow-zinc-200/50 relative">

            {/* Top Setup Button */}
            <button
              onClick={() => { setShowGoogleSetup(!showGoogleSetup); setClientIdInput(googleClientId); }}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 flex items-center gap-1.5 text-[11px] font-bold cursor-pointer bg-zinc-100 hover:bg-zinc-200/80 px-2.5 py-1.5 rounded-xl transition-all"
              title="Configure Google OAuth Client ID"
            >
              <Settings className="w-3.5 h-3.5 text-zinc-500" />
              <span>OAuth Setup</span>
            </button>

            {/* Header Text */}
            <div className="text-left mb-6 pr-20">
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight mb-1">
                {isSignUp ? 'Create account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {isSignUp ? 'Join the hospitality & dining network' : 'Sign in to access your profile & reservations'}
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold flex items-start gap-2.5">
                <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Status Message */}
            {statusMsg && !errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* ── OAuth Section ── */}
            <div className="space-y-3 mb-6">
              {/* Google GSI official container — shown if GSI SDK is ready */}
              <div
                ref={googleBtnRef}
                className={`w-full overflow-hidden rounded-full min-h-[44px] flex items-center justify-center transition-all ${isGsiLoaded ? 'block' : 'hidden'
                  }`}
              />

              {/* Single Fallback Google Button — shown ONLY if GSI SDK is NOT ready */}
              {!isGsiLoaded && (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full border border-zinc-200/90 hover:border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200/80" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-extrabold text-zinc-400 tracking-wider">
                <span className="bg-white px-3">or sign in with email</span>
              </div>
            </div>

            {/* Role Selector (Sign-up only) */}
            {isSignUp && (
              <div className="flex items-center gap-2 mb-5 p-1 bg-zinc-100/80 rounded-2xl border border-zinc-200/60">
                {[
                  { id: 'DINER', label: 'Diner Explorer', icon: User },
                  { id: 'OWNER', label: 'Business Owner', icon: Building },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setRole(id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${role === id
                      ? id === 'OWNER'
                        ? 'bg-[#FF5A5F] text-white shadow-xs'
                        : 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mahir Hasan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs text-zinc-950 p-3 pl-10 rounded-2xl border border-zinc-200/90 focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs text-zinc-950 p-3 pl-10 rounded-2xl border border-zinc-200/90 focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button type="button" className="text-[11px] font-bold text-[#FF5A5F] hover:underline">
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs text-zinc-950 p-3 pl-10 pr-10 rounded-2xl border border-zinc-200/90 focus:border-[#FF5A5F] focus:ring-2 focus:ring-[#FF5A5F]/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-zinc-400 hover:text-zinc-700 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF5A5F] hover:bg-[#E0484D] text-white text-xs font-bold py-3.5 rounded-2xl shadow-md shadow-[#FF5A5F]/20 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating…</>
                ) : (
                  isSignUp ? 'Create Account & Sign In' : 'Sign In with JWT'
                )}
              </button>
            </form>

            {/* Toggle Sign up / Log in */}
            <div className="text-center mt-6 text-xs text-zinc-500 font-medium">
              <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"} </span>
              <button
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="font-bold text-[#FF5A5F] hover:underline cursor-pointer ml-1"
              >
                {isSignUp ? 'Log In' : 'Sign up'}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 text-center shadow-xs space-y-2">
            <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Quick Demo Credentials</p>
            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => { setEmail('diner@godine.com'); setPassword('diner123'); setIsSignUp(false); }}
                className="text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                🍽 Diner Account
              </button>
              <button
                type="button"
                onClick={() => { setEmail('owner@godine.com'); setPassword('owner123'); setIsSignUp(false); }}
                className="text-[11px] font-bold bg-[#FFF0F1] hover:bg-[#FFE2E4] text-[#FF5A5F] px-3.5 py-2 rounded-xl transition-all cursor-pointer"
              >
                🏨 Owner Account
              </button>
            </div>
          </div>

          <p className="text-center text-[11px] text-zinc-400 font-medium">
            © 2024 GoDine · Secure JWT + Google OAuth 2.0
          </p>

        </div>
      </div>

      {/* ── OAuth Setup Modal ──────────────────────────────────────────────── */}
      {showGoogleSetup && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowGoogleSetup(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 p-1.5 rounded-full hover:bg-zinc-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 tracking-tight">Google OAuth Setup</h3>
                <p className="text-xs text-zinc-500 font-medium">Configure your Google Client ID for real sign-in</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>How to set up Google Client ID:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] font-medium leading-relaxed text-amber-800">
                <li>Go to <strong>Google Cloud Console → Credentials</strong></li>
                <li>Create an <strong>OAuth 2.0 Client ID</strong> (Web Application)</li>
                <li>Add Authorized JS origin: <code className="bg-amber-100 px-1 py-0.5 rounded">http://localhost:5173</code></li>
                <li>Paste your Client ID below or set <code className="bg-amber-100 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> in <code className="bg-amber-100 px-1 py-0.5 rounded">frontend/.env</code></li>
              </ol>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                Google Client ID
              </label>
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="xxxxxxxx-xxxx.apps.googleusercontent.com"
                className="w-full text-xs text-zinc-900 p-3.5 rounded-2xl border border-zinc-200 focus:border-[#FF5A5F] focus:outline-none font-mono"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={saveClientId}
                className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold py-3 rounded-2xl cursor-pointer transition-colors shadow-sm"
              >
                Save Client ID
              </button>
              <button
                type="button"
                onClick={() => { setClientIdInput(''); saveClientId(); }}
                className="text-xs font-bold text-zinc-600 hover:text-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200/90 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
