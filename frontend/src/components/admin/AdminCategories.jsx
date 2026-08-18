import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AdminResourceManager from './AdminResourceManager';
import useFetch from '../../hooks/useFetch';
import { Badge } from '../ui/Atoms';

export default function AdminCategories() {
  const { t } = useTranslation();
  const { data: categories } = useFetch('/category?limit=100');

  const fields = [
    { key: 'name', label: t('common.name'), type: 'text', required: true },
    { key: 'image', label: t('admin.logo'), type: 'text' },
    {
      key: 'parent',
      label: t('admin.parentCategory'),
      type: 'select',
      options: (categories?.docs || []).map((c) => ({ value: c._id, label: c.name })),
    },
    { key: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const columns = [
    { key: 'name', label: t('common.name') },
    { key: 'isActive', label: t('common.status'), render: (item) => <Badge tone={item.isActive ? 'success' : 'default'}>{item.isActive ? t('common.active') : t('common.inactive')}</Badge> },
  ];

  return <AdminResourceManager resource={t('admin.categories')} endpoint="/category" columns={columns} fields={fields} />;
}
