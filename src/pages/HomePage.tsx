import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, Laptop, Headphones, Watch, Tablet, Package, Zap, Shield, Truck } from 'lucide-react';
import { supabase, Product, Category } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

const categoryIcons: Record<string, React.ReactNode> = {
  smartphone: <Smartphone className="w-6 h-6" />,
  laptop: <Laptop className="w-6 h-6" />,
  headphones: <Headphones className="w-6 h-6" />,
  watch: <Watch className="w-6 h-6" />,
  tablet: <Tablet className="w-6 h-6" />,
  package: <Package className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  smartphones: 'from-blue-500 to-cyan-500',
  laptops: 'from-emerald-500 to-teal-500',
  headphones: 'from-rose-500 to-pink-500',
  smartwatches: 'from-amber-500 to-orange-500',
  tablets: 'from-violet-500 to-purple-500',
  accessories: 'from-gray-500 to-slate-500',
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [featRes, newRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(*)').eq('is_featured', true).limit(8),
        supabase.from('products').select('*, categories(*)').eq('is_new', true).limit(4),
        supabase.from('categories').select('*'),
      ]);
      if (featRes.data) setFeatured(featRes.data as Product[]);
      if (newRes.data) setNewProducts(newRes.data as Product[]);
      if (catRes.data) setCategories(catRes.data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-600/10" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Лучшие гаджеты по лучшим ценам
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
              Технологии
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                будущего
              </span>
              <br />
              уже здесь
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-xl">
              Смартфоны, ноутбуки, наушники и многое другое. Оригинальная техника с гарантией от официальных дилеров.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/catalog"
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
              >
                Смотреть каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/catalog?featured=true"
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all border border-gray-700"
              >
                Хиты продаж
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Truck className="w-5 h-5" />, title: 'Быстрая доставка', desc: 'По всему Бишкеку за 1-2 дня' },
              { icon: <Shield className="w-5 h-5" />, title: 'Гарантия качества', desc: 'Только оригинальная техника' },
              { icon: <Zap className="w-5 h-5" />, title: 'Лучшие цены', desc: 'Цены в сомах без скрытых комиссий' },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Категории</h2>
          <Link to="/catalog" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
            Все товары <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-2xl hover:border-cyan-500/50 hover:bg-gray-800 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categoryColors[cat.slug] || 'from-gray-500 to-slate-500'} flex items-center justify-center text-white shadow-lg`}>
                {categoryIcons[cat.icon] || <Package className="w-6 h-6" />}
              </div>
              <span className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">Популярные товары</h2>
          <Link to="/catalog?featured=true" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
            Все хиты <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                  <div className="h-4 bg-gray-800 rounded" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                  <div className="h-6 bg-gray-800 rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* New Products */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black">Новинки</h2>
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">NEW</span>
            </div>
            <Link to="/catalog?new=true" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
              Все новинки <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-700 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <p className="text-sm font-bold text-cyan-200 uppercase tracking-wider mb-2">Специальное предложение</p>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">Скидки до 30% на топовые гаджеты</h3>
            <p className="text-cyan-200 mb-6 max-w-md">Успейте купить по выгодным ценам. Акция ограничена по времени.</p>
            <Link
              to="/catalog?sale=true"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-cyan-700 font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-lg"
            >
              Смотреть акции <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
