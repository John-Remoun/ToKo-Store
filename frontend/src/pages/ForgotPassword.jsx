import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Spinner } from '../components/ui/States';

export default function ForgotPassword() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.resetPassword')} subtitle={t('auth.resetPasswordBody')}>
      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="mb-4 h-10 w-10 text-emerald-500" />
          <p className="text-sm text-zinc-500">Check your inbox at <strong>{email}</strong> for a reset link.</p>
          <Link to="/login" className="btn-outline mt-6">{t('auth.backToLogin')}</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">{t('auth.email')}</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <button disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
            {submitting && <Spinner className="h-4 w-4" />} {t('auth.sendResetLink')}
          </button>
          <Link to="/login" className="block text-center text-sm text-accent-600 hover:underline">{t('auth.backToLogin')}</Link>
        </form>
      )}
    </AuthLayout>
  );
}
