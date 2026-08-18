import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useTheme, PALETTES } from '../../context/ThemeContext';
import api, { apiError } from '../../lib/api';
import { Spinner } from '../ui/States';
import { Save, Palette, Moon, Sun, Monitor } from 'lucide-react';

export default function AdminSettings() {
  const { t } = useTranslation();
  const { mode, palette, setMode, setPalette } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: 'TokoStore',
    themeMode: 'system',
    primaryColor: 'emerald',
  });

  useEffect(() => {
    api.get('/settings').then(res => {
      const data = res.data?.data || res.data;
      if (data) {
        setForm({
          storeName: data.storeName || 'TokoStore',
          themeMode: data.themeMode || 'system',
          primaryColor: data.primaryColor || 'emerald',
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', form);
      toast.success(t('common.success') || 'Settings saved');
      // Apply theme locally
      setPalette(form.primaryColor);
      if (form.themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setMode(isDark ? 'dark' : 'light');
      } else {
        setMode(form.themeMode);
      }
    } catch (err) {
      toast.error(apiError(err, 'Failed to save settings'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><Spinner className="w-8 h-8 text-accent-600" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Store Settings</h2>
        <p className="text-sm text-zinc-500">Manage appearance and general preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        
        {/* Store Name */}
        <div>
          <label className="label">Store Name</label>
          <input 
            type="text" 
            value={form.storeName} 
            onChange={(e) => setForm(f => ({ ...f, storeName: e.target.value }))}
            className="input" 
          />
        </div>

        {/* Theme Mode */}
        <div>
          <label className="label mb-3">Theme Mode</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'light', icon: Sun, label: 'Light' },
              { id: 'dark', icon: Moon, label: 'Dark' },
              { id: 'system', icon: Monitor, label: 'System' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, themeMode: m.id }))}
                className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  form.themeMode === m.id
                    ? 'border-accent-600 bg-accent-50 dark:bg-accent-900/20 text-accent-600'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <m.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Primary Color Palette */}
        <div>
          <label className="label mb-3">Primary Color</label>
          <div className="flex flex-wrap gap-3">
            {PALETTES.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, primaryColor: p.id }))}
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-transform ${
                  form.primaryColor === p.id ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent hover:scale-105'
                }`}
              >
                <span className="h-8 w-8 rounded-full shadow-sm" style={{ backgroundColor: p.swatch }} />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 w-full justify-center">
            {saving ? <Spinner className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            Save Settings
          </button>
        </div>

      </form>
    </div>
  );
}
