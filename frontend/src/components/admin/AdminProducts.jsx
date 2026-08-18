import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Search,
  Check,
  Star,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import api, { apiError } from '../../lib/api';
import { Modal, ConfirmDialog, Badge, Pagination } from '../ui/Atoms';
import { TableRowSkeleton } from '../ui/Skeletons';
import { EmptyState, ErrorState, Spinner } from '../ui/States';

const EMPTY = {
  title: '',
  description: '',
  price: '',
  discountPrice: '',
  category: '',
  brand: '',
  images: [],
  stock: '',
  sku: '',
  lowStockThreshold: '5',
  isActive: true,
};

export default function AdminProducts() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, loading, error, refetch } = useFetch(`/product?page=${page}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`, {
    deps: [page, searchTerm],
  });
  const { data: categories } = useFetch('/category?limit=100');
  const { data: brands } = useFetch('/brand?limit=100');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const openCreate = () => {
    setForm(EMPTY);
    setEditing(null);
    setUrlInput('');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      discountPrice: p.discountPrice ?? '',
      category: typeof p.category === 'object' ? p.category?._id : p.category || '',
      brand: typeof p.brand === 'object' ? p.brand?._id : p.brand || '',
      images: p.images || [],
      stock: p.stock ?? '',
      sku: p.sku || '',
      lowStockThreshold: p.lowStockThreshold ?? '5',
      isActive: p.isActive ?? true,
    });
    setEditing(p);
    setUrlInput('');
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadingImage(true);
    let successCount = 0;

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const imageUrl = res.data?.data?.url || res.data?.data?.secure_url;
        if (imageUrl) {
          setForm((f) => ({ ...f, images: [...f.images, imageUrl] }));
          successCount++;
        }
      } catch (err) {
        toast.error(apiError(err, `Failed to upload ${file.name}`));
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} image(s) uploaded!`);
    }

    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addImageUrl = () => {
    if (!urlInput.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, urlInput.trim()] }));
    setUrlInput('');
    toast.success('Image URL added');
  };

  const removeImage = (index) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const setCoverImage = (index) => {
    setForm((f) => {
      const copy = [...f.images];
      const [selected] = copy.splice(index, 1);
      return { ...f, images: [selected, ...copy] };
    });
    toast.success('Set as primary cover image');
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.images.length) {
      toast.error('Please add at least one product image');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        brand: form.brand,
        images: form.images,
        stock: Number(form.stock),
        sku: form.sku.trim(),
        isActive: form.isActive,
      };
      if (form.discountPrice !== '' && form.discountPrice != null) {
        payload.discountPrice = Number(form.discountPrice);
      }
      if (form.lowStockThreshold !== '' && form.lowStockThreshold != null) {
        payload.lowStockThreshold = Number(form.lowStockThreshold);
      }

      if (editing) {
        await api.patch(`/product/${editing._id}`, payload);
        toast.success('Product updated successfully');
      } else {
        await api.post('/product', payload);
        toast.success('Product created successfully');
      }
      setModalOpen(false);
      refetch();
    } catch (e2) {
      toast.error(apiError(e2));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await api.delete(`/product/${deleteTarget._id}`);
      toast.success(t('common.success'));
      setDeleteTarget(null);
      refetch();
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setDeleting(false);
    }
  };

  const discountPercent =
    form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price)
      ? Math.round(((Number(form.price) - Number(form.discountPrice)) / Number(form.price)) * 100)
      : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-white">
            {t('admin.products') || 'Product Catalog'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Add new products, manage stock levels, update pricing, and upload media assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="input ps-8 py-2 text-xs rounded-xl w-44 sm:w-56"
            />
          </div>

          <button onClick={openCreate} className="btn-primary gap-2 text-xs font-bold py-2 px-4 shadow-glow shrink-0">
            <Plus size={15} /> {t('admin.addProduct') || 'Add Product'}
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-3.5 text-start font-semibold">Product</th>
              <th className="px-4 py-3.5 text-start font-semibold">Category / Brand</th>
              <th className="px-4 py-3.5 text-start font-semibold">Price</th>
              <th className="px-4 py-3.5 text-start font-semibold">Stock</th>
              <th className="px-4 py-3.5 text-start font-semibold">Status</th>
              <th className="px-4 py-3.5 text-end font-semibold">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
            ) : data?.docs?.length ? (
              data.docs.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-zinc-50 last:border-0 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Product title + Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/50 dark:border-zinc-700/50">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80'}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                        {p.images?.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/70 text-[9px] font-bold text-white px-1 rounded">
                            +{p.images.length - 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1 max-w-[220px]">
                          {p.title}
                        </span>
                        <p className="text-[11px] font-mono text-zinc-400">SKU: {p.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Category & Brand */}
                  <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {p.category?.name || 'Uncategorized'}
                    </span>
                    <p className="text-[11px] text-zinc-400">{p.brand?.name || 'No brand'}</p>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-zinc-900 dark:text-white">
                        ${(p.discountPrice || p.price)?.toFixed(2)}
                      </span>
                      {p.discountPrice && p.discountPrice < p.price && (
                        <span className="text-[11px] line-through text-zinc-400 font-mono">
                          ${p.price?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold text-xs ${
                        p.stock === 0
                          ? 'text-rose-600'
                          : p.stock <= (p.lowStockThreshold ?? 5)
                          ? 'text-amber-600'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge tone={p.isActive ? 'success' : 'default'}>
                      {p.isActive ? t('common.active') || 'Active' : t('common.inactive') || 'Draft'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="btn-icon h-8 w-8 min-h-[32px] min-w-[32px] text-zinc-400 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/30"
                        title="Edit product"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="btn-icon h-8 w-8 min-h-[32px] min-w-[32px] text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : null}
          </tbody>
        </table>

        {!loading && error && (
          <div className="p-8">
            <ErrorState onRetry={refetch} />
          </div>
        )}
        {!loading && !error && !data?.docs?.length && (
          <div className="p-8">
            <EmptyState title={t('shop.noResults') || 'No products found'} />
          </div>
        )}
      </div>

      <Pagination page={data?.currentPage || page} pages={data?.pages} onChange={setPage} />

      {/* Product Creation / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit Product: ${editing.title}` : (t('admin.addProduct') || 'Create New Product')}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={save} className="space-y-5">
          {/* Section 1: Basic Info */}
          <div>
            <label className="label text-xs font-bold uppercase tracking-wider">{t('admin.title') || 'Product Title'}</label>
            <input
              required
              placeholder="e.g. Classic Silk Blend Bomber Jacket"
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              className="input rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="label text-xs font-bold uppercase tracking-wider">{t('admin.description') || 'Description'}</label>
            <textarea
              required
              rows={3}
              placeholder="Crafted with tailored proportions, water-repellent finishing, and custom hardware..."
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              className="input rounded-xl text-sm"
            />
          </div>

          {/* Section 2: Pricing & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">
                {t('common.price') || 'Regular Price ($)'}
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="149.00"
                value={form.price}
                onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
                className="input rounded-xl text-sm"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="label text-xs font-bold uppercase tracking-wider">
                  {t('admin.discountPrice') || 'Discounted Sale Price ($)'}
                </label>
                {discountPercent && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Optional (leave empty for regular price)"
                value={form.discountPrice}
                onChange={(e) => setForm((s) => ({ ...s, discountPrice: e.target.value }))}
                className="input rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Section 3: Categories & Brands */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">{t('product.category') || 'Category'}</label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                className="input rounded-xl text-sm"
              >
                <option value="">Select a Category</option>
                {(categories?.docs || []).map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">{t('product.brand') || 'Brand'}</label>
              <select
                required
                value={form.brand}
                onChange={(e) => setForm((s) => ({ ...s, brand: e.target.value }))}
                className="input rounded-xl text-sm"
              >
                <option value="">Select a Brand</option>
                {(brands?.docs || []).map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 4: Inventory & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">{t('common.stock') || 'Stock Quantity'}</label>
              <input
                required
                type="number"
                min="0"
                placeholder="50"
                value={form.stock}
                onChange={(e) => setForm((s) => ({ ...s, stock: e.target.value }))}
                className="input rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                placeholder="5"
                value={form.lowStockThreshold}
                onChange={(e) => setForm((s) => ({ ...s, lowStockThreshold: e.target.value }))}
                className="input rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="label text-xs font-bold uppercase tracking-wider">{t('admin.sku') || 'SKU Code'}</label>
              <input
                required
                placeholder="TOKO-JKT-001"
                value={form.sku}
                onChange={(e) => setForm((s) => ({ ...s, sku: e.target.value }))}
                className="input rounded-xl text-sm font-mono"
              />
            </div>
          </div>

          {/* Section 5: Media & Image Assets */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="label text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={15} className="text-accent-500" />
                Product Media & Images ({form.images.length})
              </label>
              <span className="text-[11px] text-zinc-400">First image is the primary cover</span>
            </div>

            {/* Image Gallery Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {form.images.map((img, i) => (
                <div
                  key={i}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border-2 bg-zinc-100 dark:bg-zinc-800 ${
                    i === 0 ? 'border-accent-500 ring-2 ring-accent-500/30' : 'border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  <img src={img} alt="Product" className="object-cover w-full h-full" />
                  
                  {/* Primary Badge */}
                  {i === 0 && (
                    <span className="absolute top-2 start-2 bg-accent-600 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm">
                      Cover
                    </span>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => setCoverImage(i)}
                        className="btn-icon h-7 w-7 min-h-[28px] min-w-[28px] bg-white/90 text-zinc-900 hover:bg-white"
                        title="Set as Cover"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="btn-icon h-7 w-7 min-h-[28px] min-w-[28px] bg-rose-600 text-white hover:bg-rose-700"
                      title="Remove image"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Upload Drop Button */}
              <label className="aspect-square border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-accent-500 hover:bg-accent-50/20 dark:hover:border-accent-500 text-zinc-400 hover:text-accent-500 transition-all p-3 text-center">
                {uploadingImage ? (
                  <Spinner className="w-6 h-6 mb-1" />
                ) : (
                  <>
                    <Upload size={22} className="mb-1.5" />
                    <span className="text-xs font-bold">Upload Photos</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">JPEG, PNG, WEBP</span>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>

            {/* Direct Image URL input */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Or paste an image URL (e.g. https://images.unsplash.com/...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                className="input py-2 text-xs rounded-xl flex-1"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="btn-outline py-2 px-4 text-xs font-bold rounded-xl shrink-0"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Section 6: Status toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Product Visibility</p>
              <p className="text-[11px] text-zinc-400">Make this product publicly visible in the online store</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((s) => ({ ...s, isActive: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-accent-600"></div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-ghost text-xs font-bold px-4 py-2.5"
            >
              {t('common.cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary text-xs font-bold px-7 py-2.5 shadow-glow flex items-center gap-2"
            >
              {saving ? <Spinner className="h-4 w-4" /> : <Check size={16} />}
              {editing ? 'Save Changes' : 'Publish Product'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={deleting}
        title="Delete Product?"
        description={deleteTarget ? `Are you sure you want to permanently delete "${deleteTarget.title}"? This action cannot be undone.` : ''}
      />
    </div>
  );
}
