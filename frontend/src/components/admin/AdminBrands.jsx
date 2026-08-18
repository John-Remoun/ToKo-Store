import { useTranslation } from 'react-i18next';
import AdminResourceManager from './AdminResourceManager';
import { Badge } from '../ui/Atoms';

export default function AdminBrands() {
  const { t } = useTranslation();

  const fields = [
    { key: 'name', label: t('common.name'), type: 'text', required: true },
    { key: 'logo', label: t('admin.logo'), type: 'text' },
    { key: 'description', label: t('admin.description'), type: 'textarea' },
    { key: 'isActive', label: t('common.active'), type: 'checkbox' },
  ];

  const columns = [
    { key: 'name', label: t('common.name') },
    { key: 'isActive', label: t('common.status'), render: (item) => <Badge tone={item.isActive ? 'success' : 'default'}>{item.isActive ? t('common.active') : t('common.inactive')}</Badge> },
  ];

  return <AdminResourceManager resource={t('admin.brands')} endpoint="/brand" columns={columns} fields={fields} />;
}
