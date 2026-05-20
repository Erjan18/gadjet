import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ProductCard';

export default function FavoritesPage() {
  const { favorites } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    supabase.from('products').select('*, categories(*)').in('id', favorites).then(({ data }) => {
      if (data) setProducts(data as Product[]);
      setLoading(false);
    });
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-black">Избранное</h1>
          {favorites.length > 0 && (
            <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold rounded-full">
              {favorites.length}
            </span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-xl font-black text-gray-400 mb-2">Пока нет избранных</h2>
            <p className="text-gray-600 mb-6">Нажмите на сердечко на карточке товара, чтобы добавить в избранное</p>
            <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors">
              <ShoppingBag className="w-4 h-4" /> Перейти в каталог
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: favorites.length }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded" />
                  <div className="h-6 bg-gray-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
