import React, { useEffect, useState } from 'react';
import { Plus, CreditCard as Edit, Trash2, X, Check, Search } from 'lucide-react';
import { supabase, Product, Category } from '../../lib/supabase';
import { formatPrice } from '../../components/ProductCard';

type ProductForm = {
  name: string;
  description: string;
  price: string;
  old_price: string;
  category_id: string;
  image_url: string;
  brand: string;
  stock: string;
  rating: string;
  reviews_count: string;
  is_featured: boolean;
  is_new: boolean;
  specs: string;
};

const emptyForm: ProductForm = {
  name: '', description: '', price: '', old_price: '', category_id: '',
  image_url: '', brand: '', stock: '0', rating: '0', reviews_count: '0',
  is_featured: false, is_new: false, specs: '{}',
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*, categories(*)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ]);
    if (prodRes.data) setProducts(prodRes.data as Product[]);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditId(null); setModalOpen(true); };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      old_price: p.old_price ? String(p.old_price) : '', category_id: p.category_id || '',
      image_url: p.image_url, brand: p.brand, stock: String(p.stock),
      rating: String(p.rating), reviews_count: String(p.reviews_count),
      is_featured: p.is_featured, is_new: p.is_new,
      specs: JSON.stringify(p.specs || {}, null, 2),
    });
    setEditId(p.id);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let specs = {};
    try { specs = JSON.parse(form.specs || '{}'); } catch {}

    const payload = {
      name: form.name, description: form.description,
      price: parseFloat(form.price) || 0,
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      category_id: form.category_id || null,
      image_url: form.image_url, images: form.image_url ? [form.image_url] : [],
      brand: form.brand, stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      reviews_count: parseInt(form.reviews_count) || 0,
      is_featured: form.is_featured, is_new: form.is_new,
      specs, updated_at: new Date().toISOString(),
    };

    if (editId) {
      await supabase.from('products').update(payload).eq('id', editId);
    } else {
      await supabase.from('products').insert(payload);
    }

    await load();
    setModalOpen(false);
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id);
    setDeleteId(null);
    await load();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  const f = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [k]: e.target.value }));
  const fc = (k: keyof ProductForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [k]: e.target.checked }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Товары</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/25">
          <Plus className="w-4 h-4" /> Добавить товар
        </button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Поиск по названию или бренду..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Товар</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Категория</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Цена</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Наличие</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{(p as any).categories?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-bold text-white">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${p.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {p.stock > 0 ? `${p.stock} шт.` : 'Нет'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">Товары не найдены</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-bold">{editId ? 'Редактировать товар' : 'Добавить товар'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Название *</label>
                  <input value={form.name} onChange={f('name')} required className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Бренд</label>
                  <input value={form.brand} onChange={f('brand')} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Категория</label>
                  <select value={form.category_id} onChange={f('category_id')} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500">
                    <option value="">Без категории</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Цена (с) *</label>
                  <input type="number" value={form.price} onChange={f('price')} required min="0" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Старая цена (с)</label>
                  <input type="number" value={form.old_price} onChange={f('old_price')} min="0" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Наличие (шт.)</label>
                  <input type="number" value={form.stock} onChange={f('stock')} min="0" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Рейтинг</label>
                  <input type="number" value={form.rating} onChange={f('rating')} min="0" max="5" step="0.1" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Кол-во отзывов</label>
                  <input type="number" value={form.reviews_count} onChange={f('reviews_count')} min="0" className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">URL изображения</label>
                  <input value={form.image_url} onChange={f('image_url')} placeholder="https://..." className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Описание</label>
                  <textarea value={form.description} onChange={f('description')} rows={3} className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 resize-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Характеристики (JSON)</label>
                  <textarea value={form.specs} onChange={f('specs')} rows={4} placeholder='{"Процессор": "A17", "ОЗУ": "8 ГБ"}' className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 resize-none font-mono" />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={fc('is_featured')} className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500" />
                    <span className="text-sm text-gray-300">Популярный</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_new} onChange={fc('is_new')} className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500" />
                    <span className="text-sm text-gray-300">Новинка</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-800">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm">
                  Отмена
                </button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-50">
                  {saving ? 'Сохранение...' : <><Check className="w-4 h-4" /> Сохранить</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Удалить товар?</h3>
            <p className="text-sm text-gray-500 mb-6">Это действие нельзя отменить.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-colors text-sm">
                Отмена
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
