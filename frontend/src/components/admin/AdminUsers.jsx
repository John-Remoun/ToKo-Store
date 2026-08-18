import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldOff, Users, UserPlus, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import api, { apiError } from '../../lib/api';
import { Badge, ConfirmDialog, Modal, Pagination } from '../ui/Atoms';
import { TableRowSkeleton } from '../ui/Skeletons';
import { EmptyState, ErrorState, Spinner } from '../ui/States';

const EMPTY_ADMIN_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
};

export default function AdminUsers() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useFetch(`/user/admin/list?page=${page}&limit=20`, {
    deps: [page],
  });

  const [roleTarget, setRoleTarget] = useState(null); // { user, newRole }
  const [updating, setUpdating] = useState(false);

  // Create Admin Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState(EMPTY_ADMIN_FORM);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const confirmRoleChange = (user, newRole) => {
    setRoleTarget({ user, newRole });
  };

  const applyRoleChange = async () => {
    if (!roleTarget) return;
    setUpdating(true);
    try {
      await api.patch(`/user/admin/${roleTarget.user._id}/role`, {
        role: roleTarget.newRole,
      });
      toast.success(`Role updated to ${roleTarget.newRole}`);
      setRoleTarget(null);
      refetch();
    } catch (e) {
      toast.error(apiError(e, 'Failed to update role'));
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await api.post('/user/admin/create-admin', adminForm);
      toast.success(`Admin account for ${adminForm.email} created successfully!`);
      setCreateModalOpen(false);
      setAdminForm(EMPTY_ADMIN_FORM);
      refetch();
    } catch (err) {
      toast.error(apiError(err, 'Failed to create admin account'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const users = data?.docs ?? [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Users size={20} className="text-accent-600 dark:text-accent-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
              User & Staff Management
            </h1>
            {data?.total != null && (
              <p className="text-xs text-zinc-500 mt-0.5">{data.total} registered users</p>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            setAdminForm(EMPTY_ADMIN_FORM);
            setCreateModalOpen(true);
          }}
          className="btn-primary gap-2 text-xs font-bold py-2.5 px-4 shadow-glow self-start sm:self-auto"
        >
          <UserPlus size={16} /> Create New Admin
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-3.5 text-start font-semibold">User</th>
              <th className="px-4 py-3.5 text-start font-semibold">Email</th>
              <th className="px-4 py-3.5 text-start font-semibold">Role</th>
              <th className="px-4 py-3.5 text-start font-semibold">Verified</th>
              <th className="px-4 py-3.5 text-start font-semibold">Joined</th>
              <th className="px-4 py-3.5 text-end font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={6} />
                ))
              : users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-zinc-50 last:border-0 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                    {/* Name + Avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                          user.role === 'ADMIN'
                            ? 'bg-gradient-to-br from-indigo-500 to-accent-600 ring-2 ring-accent-400/30'
                            : 'bg-gradient-to-br from-zinc-400 to-zinc-600'
                        }`}>
                          {(user.firstName?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                      {user.email}
                    </td>

                    {/* Role badge */}
                    <td className="px-4 py-3">
                      <Badge tone={user.role === 'ADMIN' ? 'warning' : 'default'}>
                        {user.role === 'ADMIN' ? '🛡️ Admin' : 'Customer'}
                      </Badge>
                    </td>

                    {/* Email verified */}
                    <td className="px-4 py-3">
                      <Badge tone={user.confirmEmail ? 'success' : 'default'}>
                        {user.confirmEmail ? 'Verified' : 'Pending'}
                      </Badge>
                    </td>

                    {/* Joined date */}
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {user.role === 'ADMIN' ? (
                          <button
                            onClick={() => confirmRoleChange(user, 'USER')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-rose-400 hover:text-rose-600 transition-colors"
                            title="Demote to User"
                          >
                            <ShieldOff size={13} />
                            Demote to User
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmRoleChange(user, 'ADMIN')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:border-accent-400 hover:text-accent-600 transition-colors"
                            title="Promote to Admin"
                          >
                            <Shield size={13} />
                            Promote to Admin
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && error && (
          <div className="p-8">
            <ErrorState onRetry={refetch} />
          </div>
        )}
        {!loading && !error && !users.length && (
          <div className="p-8">
            <EmptyState icon={Users} title="No users found" />
          </div>
        )}
      </div>

      <Pagination
        page={data?.currentPage ?? page}
        pages={data?.pages}
        onChange={setPage}
      />

      {/* Role Change Confirmation Modal */}
      <ConfirmDialog
        open={!!roleTarget}
        onClose={() => setRoleTarget(null)}
        onConfirm={applyRoleChange}
        loading={updating}
        title={roleTarget?.newRole === 'ADMIN' ? 'Promote to Administrator?' : 'Demote to Customer?'}
        description={
          roleTarget
            ? `Are you sure you want to change ${roleTarget.user.firstName} ${roleTarget.user.lastName}'s role to ${roleTarget.newRole}? They will gain full administrative privileges if promoted.`
            : ''
        }
      />

      {/* Create New Admin Modal */}
      <Modal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Administrator"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">First Name</label>
              <div className="relative">
                <UserIcon size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  required
                  placeholder="John"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm((s) => ({ ...s, firstName: e.target.value }))}
                  className="input ps-9 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">Last Name</label>
              <input
                required
                placeholder="Doe"
                value={adminForm.lastName}
                onChange={(e) => setAdminForm((s) => ({ ...s, lastName: e.target.value }))}
                className="input rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                required
                type="email"
                placeholder="admin.colleague@tokostore.com"
                value={adminForm.email}
                onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))}
                className="input ps-9 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label text-xs font-bold uppercase tracking-wider">Temporary Password</label>
            <div className="relative">
              <Lock size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                required
                type="password"
                minLength={6}
                placeholder="••••••••••••"
                value={adminForm.password}
                onChange={(e) => setAdminForm((s) => ({ ...s, password: e.target.value }))}
                className="input ps-9 rounded-xl text-sm"
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">Minimum 6 characters. The new admin can change this later.</p>
          </div>

          <div>
            <label className="label text-xs font-bold uppercase tracking-wider">Phone Number (Optional)</label>
            <div className="relative">
              <Phone size={15} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                placeholder="+1 (555) 000-0000"
                value={adminForm.phone}
                onChange={(e) => setAdminForm((s) => ({ ...s, phone: e.target.value }))}
                className="input ps-9 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="btn-ghost text-xs font-bold px-4 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creatingAdmin}
              className="btn-primary text-xs font-bold px-6 py-2.5 shadow-glow flex items-center gap-2"
            >
              {creatingAdmin ? <Spinner className="h-4 w-4" /> : <UserPlus size={15} />}
              Create Admin Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
