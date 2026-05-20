import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';
  const isFeatured = searchParams.get('featured') === 'true';
  const isNew = searchParams.get('new') === 'true';
  const isSale = searchParams.get('sale') === 'true';
  const minPrice = Number(searchParams.get('minPrice') || 0);
  const maxPrice = Number(searchParams.get('maxPrice') || 999999);
  const sortBy = searchParams.get('sort') || 'created_at';

  const [priceMin, setPriceMin] = useState(minPrice || 0);
  const [priceMax, setPriceMax] = useState(maxPrice === 999999 ? '' : String(maxPrice));

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, categories(*)');

    if (search) query = query.ilike('name', `%${search}%`);
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug || c.name === categorySlug);
      if (cat) query = query.eq('category_id', cat.id);
    }
    if (isFeatured) query = query.eq('is_featured', true);
    if (isNew) query = query.eq('is_new', true);
    if (isSale) query = query.not('old_price', 'is', null);
    if (minPrice > 0) query = query.gte('price', minPrice);
    if (maxPrice < 999999) query = query.lte('price', maxPrice);

    const orderMap: Record<string, { col: string; asc: boolean }> = {
      created_at: { col: 'created_at', asc: false },
      price_asc: { col: 'price', asc: true },
      price_desc: { col: 'price', asc: false },
      rating: { col: 'rating', asc: false },
    };
    const order = orderMap[sortBy] || orderMap['created_at'];
    query = query.order(order.col, { ascending: order.asc });

    const { data } = await query;
    setProducts((data as Product[]) || []);
    setLoading(false);
  }, [search, categorySlug, isFeatured, isNew, isSale, minPrice, maxPrice, sortBy, categories]);

  useEffect(() => {
    if (categories.length > 0 || !categorySlug) {
      loadProducts();
    }
  }, [loadProducts, categories, categorySlug]);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value); else params.delete(key);
    setSearchParams(params);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams);
    if (priceMin > 0) params.set('minPrice', String(priceMin)); else params.delete('minPrice');
    if (priceMax) params.set('maxPrice', priceMax); else params.delete('maxPrice');
    setSearchParams(params);
    setFiltersOpen(false);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPriceMin(0);
    setPriceMax('');
  };

  const activeFiltersCount = [search, categorySlug, isFeatured, isNew, isSale, minPrice > 0, !!priceMax].filter(Boolean).length;

  const pageTitle = () => {
    if (search) return `Поиск: «${search}»`;
    if (categorySlug) {
      const cat = categories.find((c) => c.slug === categorySlug || c.name === categorySlug);
      return cat?.name || 'Каталог';
    }
    if (isFeatured) return 'Популярные товары';
    if (isNew) return 'Новинки';
    if (isSale) return 'Акции и скидки';
    return 'Все товары';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">{pageTitle()}</h1>
            {!loading && <p className="text-sm text-gray-500 mt-0.5">{products.length} товаров</p>}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setParam('sort', e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="created_at">Новые</option>
              <option value="price_asc">Цена: низкая</option>
              <option value="price_desc">Цена: высокая</option>
              <option value="rating">По рейтингу</option>
            </select>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${filtersOpen ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-cyan-500'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-white text-cyan-600 rounded-full text-xs font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
                <X className="w-4 h-4" /> Сбросить
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-6 sticky top-24">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Категории</h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => setParam('category', '')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!categorySlug ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                    >
                      Все категории
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setParam('category', cat.slug)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${categorySlug === cat.slug ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-800 pt-5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Цена (сом)</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    placeholder="От"
                    value={priceMin || ''}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="w-1/2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="number"
                    placeholder="До"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={applyPriceFilter}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Применить
                </button>
              </div>

              <div className="border-t border-gray-800 pt-5 space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Фильтры</h3>
                {[
                  { key: 'featured', label: 'Популярные', active: isFeatured },
                  { key: 'new', label: 'Новинки', active: isNew },
                  { key: 'sale', label: 'Со скидкой', active: isSale },
                ].map((f) => (
                  <label key={f.key} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={f.active}
                      onChange={(e) => setParam(f.key, e.target.checked ? 'true' : '')}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/50"
                    />
                    <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{f.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-800" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-800 rounded w-1/3" />
                      <div className="h-4 bg-gray-800 rounded" />
                      <div className="h-6 bg-gray-800 rounded w-1/2 mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-400 mb-2">Товары не найдены</h3>
                <p className="text-sm text-gray-600 mb-4">Попробуйте изменить параметры поиска или фильтры</p>
                <button onClick={clearFilters} className="px-4 py-2 bg-cyan-500 text-white text-sm font-bold rounded-xl hover:bg-cyan-400 transition-colors">
                  Сбросить фильтры
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
