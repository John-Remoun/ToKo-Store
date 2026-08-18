import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Spinner } from '../components/ui/States';

export default function ResetPassword() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await resetPassword(email, token, newPassword);
      toast.success(t('common.success'));
      navigate('/login');
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.resetPassword')} subtitle="">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">Reset Token</label>
          <input required value={token} onChange={(e) => setToken(e.target.value)} className="input" placeholder="From the email link" />
        </div>
        <div>
          <label className="label">{t('auth.newPassword')}</label>
          <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" />
          <p className="mt-1 text-xs text-zinc-400">{t('auth.passwordHint')}</p>
        </div>
        <button disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
          {submitting && <Spinner className="h-4 w-4" />} {t('auth.resetPassword')}
        </button>
        <Link to="/login" className="block text-center text-sm text-accent-600 hover:underline">{t('auth.backToLogin')}</Link>
      </form>
    </AuthLayout>
  );
}
