import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Spinner } from '../components/ui/States';

const EMPTY = { firstName: '', lastName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' };

export default function Register() {
  const { t } = useTranslation();
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signup(form);
      toast.success(t('common.success'));
      navigate('/confirm-email', { state: { email: form.email } });
    } catch (e2) {
      toast.error(apiError(e2, 'Registration failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.createAccount')} subtitle={t('auth.registerSubtitle')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('auth.firstName')}</label>
            <input required value={form.firstName} onChange={update('firstName')} className="input" />
          </div>
          <div>
            <label className="label">{t('auth.lastName')}</label>
            <input required value={form.lastName} onChange={update('lastName')} className="input" />
          </div>
        </div>
        <div>
          <label className="label">{t('auth.username')}</label>
          <input required value={form.username} onChange={update('username')} className="input" />
        </div>
        <div>
          <label className="label">{t('auth.email')}</label>
          <input type="email" required value={form.email} onChange={update('email')} className="input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">{t('auth.phone')}</label>
          <input required value={form.phone} onChange={update('phone')} className="input" placeholder="01xxxxxxxxx" />
        </div>
        <div>
          <label className="label">{t('auth.password')}</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={update('password')} className="input pe-10" />
            <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute end-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-400">{t('auth.passwordHint')}</p>
        </div>
        <div>
          <label className="label">{t('auth.confirmPassword')}</label>
          <input type={showPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={update('confirmPassword')} className="input" />
        </div>
        <button disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
          {submitting && <Spinner className="h-4 w-4" />} {t('auth.signUp')}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs uppercase tracking-wider text-zinc-400">{t('auth.orContinueWith')}</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <GoogleSignInButton />

      <p className="mt-8 text-center text-sm text-zinc-500">
        {t('auth.haveAccount')} <Link to="/login" className="font-medium text-accent-600 hover:underline">{t('auth.signIn')}</Link>
      </p>
    </AuthLayout>
  );
}
