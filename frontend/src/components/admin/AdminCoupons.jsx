import { useTranslation } from 'react-i18next';
import AdminResourceManager from './AdminResourceManager';
import { Badge } from '../ui/Atoms';

export default function AdminCoupons() {
  const { t } = useTranslation();

  const fields = [
    { key: 'code', label: t('admin.code'), type: 'text', required: true },
    { key: 'type', label: t('admin.type'), type: 'select', required: true, options: [{ value: 'PERCENTAGE', label: 'Percentage' }, { value: 'FIXED', label: 'Fixed Amount' }] },
    { key: 'value', label: t('admin.value'), type: 'number', step: '0.01', required: true },
    { key: 'maxDiscount', label: 'Max Discount ($)', type: 'number', step: '0.01' },
    { key: 'minOrderValue', label: t('admin.minOrderValue'), type: 'number', step: '0.01' },
    { key: 'maxUses', label: t('admin.maxUses'), type: 'number', required: true },
    { key: 'expiresAt', label: t('admin.expiresAt'), type: 'date', required: true },
    { key: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const columns = [
    { key: 'code', label: t('admin.code') },
    { key: 'type', label: t('admin.type') },
    { key: 'value', label: t('admin.value') },
    { key: 'usedCount', label: t('admin.usedCount'), render: (item) => `${item.usedCount ?? 0} / ${item.maxUses}` },
    { key: 'isActive', label: t('common.status'), render: (item) => <Badge tone={item.isActive ? 'success' : 'default'}>{item.isActive ? t('common.active') : t('common.inactive')}</Badge> },
  ];

  return <AdminResourceManager resource={t('admin.coupons')} endpoint="/coupon" columns={columns} fields={fields} />;
}
