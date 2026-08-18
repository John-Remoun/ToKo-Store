import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { Spinner } from '../components/ui/States';

export default function ConfirmEmail() {
  const { t } = useTranslation();
  const { confirmEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await confirmEmail(email, otp);
      toast.success(t('common.success'));
      navigate('/login');
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t('auth.confirmEmail')} subtitle={t('auth.confirmEmailBody')}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">{t('auth.email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label">{t('auth.otp')}</label>
          <input
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="input text-center text-xl tracking-[0.6em]"
            placeholder="000000"
          />
        </div>
        <button disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5">
          {submitting && <Spinner className="h-4 w-4" />} {t('auth.verify')}
        </button>
        <Link to="/login" className="block text-center text-sm text-accent-600 hover:underline">{t('auth.backToLogin')}</Link>
      </form>
    </AuthLayout>
  );
}
