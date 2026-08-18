import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Spinner } from '../components/ui/States';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(t('common.success'));
      if (data?.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(location.state?.from?.pathname || '/');
      }
    } catch (e2) {
      toast.error(apiError(e2, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.welcomeBack')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <div className="relative">
            <Mail size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input ps-10" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">{t('auth.password')}</label>
            <Link to="/forgot-password" className="mb-1.5 text-xs font-medium text-accent-600 hover:underline">{t('auth.forgotPassword')}</Link>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input type={showPw ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="input ps-10 pe-10" placeholder="••••••••" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
          {submitting && <Spinner className="h-4 w-4" />} {t('auth.signIn')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">{t('auth.orContinueWith')}</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <GoogleSignInButton />

      <p className="mt-8 text-center text-sm text-zinc-500">
        {t('auth.noAccount')} <Link to="/register" className="font-medium text-accent-600 hover:underline">{t('auth.signUp')}</Link>
      </p>
    </AuthLayout>
  );
}
