import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { apiError } from '../lib/api';
import { PageLoader } from '../components/ui/States';
import { Badge } from '../components/ui/Atoms';

export default function Profile() {
  const { t } = useTranslation();
  const { user, loading, changePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  if (loading || !user) return <PageLoader />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await changePassword(form);
      toast.success(t('common.success'));
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app max-w-2xl py-10">
      <h1 className="section-title mb-8">{t('profile.title')}</h1>

      <div className="card mb-8 p-6">
        <div className="mb-5 flex items-center gap-4">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-100 text-lg font-semibold text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          )}
          <div>
            <p className="font-display text-lg font-semibold">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
          <Badge tone={user.role === 'ADMIN' ? 'accent' : 'default'}>{user.role}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 pt-5 text-sm dark:border-zinc-800">
          <div><p className="text-xs text-zinc-400">{t('auth.username')}</p><p className="mt-0.5 font-medium">{user.username || '—'}</p></div>
          <div><p className="text-xs text-zinc-400">{t('auth.phone')}</p><p className="mt-0.5 font-medium">{user.phone || '—'}</p></div>
          <div><p className="text-xs text-zinc-400">{t('profile.memberSince')}</p><p className="mt-0.5 font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p></div>
          <div><p className="text-xs text-zinc-400">{t('common.status')}</p><p className="mt-0.5 font-medium">{user.confirmEmail ? '✓ Verified' : 'Unverified'}</p></div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="mb-5 font-display text-lg font-semibold">{t('profile.changePassword')}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">{t('profile.currentPassword')}</label>
            <input type="password" required value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">{t('auth.newPassword')}</label>
            <input type="password" required value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} className="input" />
            <p className="mt-1 text-xs text-zinc-400">{t('auth.passwordHint')}</p>
          </div>
          <div>
            <label className="label">{t('auth.confirmPassword')}</label>
            <input type="password" required value={form.confirmNewPassword} onChange={(e) => setForm((f) => ({ ...f, confirmNewPassword: e.target.value }))} className="input" />
          </div>
          <button disabled={submitting} className="btn-primary py-3">{t('profile.save')}</button>
        </form>
      </div>
    </div>
  );
}
