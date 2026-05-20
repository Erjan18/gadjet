import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useApp } from '../context/AppContext';

type Props = {
  product: Product;
};

export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU') + ' с';
}

export default function ProductCard({ product }: Props) {
  const { addToCart, toggleFavorite, favorites } = useApp();
  const isFav = favorites.includes(product.id);

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-800 overflow-hidden">
          <img
            src={product.image_url || 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded-full">НОВИНКА</span>
          )}
          {product.old_price && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
              -{Math.round((1 - product.price / product.old_price) * 100)}%
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); toggleFavorite(product.id); }}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${isFav ? 'bg-rose-500 text-white' : 'bg-gray-800/80 text-gray-400 hover:bg-rose-500 hover:text-white'}`}
        >
          <Heart className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 hover:text-cyan-400 transition-colors">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs text-amber-400 font-medium">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-600">({product.reviews_count})</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-lg font-black text-white">{formatPrice(product.price)}</p>
            {product.old_price && (
              <p className="text-xs text-gray-500 line-through">{formatPrice(product.old_price)}</p>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 px-3 py-2 bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
