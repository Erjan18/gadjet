import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft, Check, Truck, Shield, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../components/ProductCard';
import ProductCard from '../components/ProductCard';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleFavorite, favorites, cart } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const isFav = product ? favorites.includes(product.id) : false;
  const inCart = product ? cart.some((i) => i.product.id === product.id) : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase.from('products').select('*, categories(*)').eq('id', id).maybeSingle().then(({ data }) => {
      if (data) {
        setProduct(data as Product);
        setActiveImg(0);
        supabase.from('products').select('*, categories(*)').eq('category_id', (data as Product).category_id!).neq('id', id).limit(4).then(({ data: rel }) => {
          if (rel) setRelated(rel as Product[]);
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-1/4" />
              <div className="h-8 bg-gray-800 rounded w-3/4" />
              <div className="h-8 bg-gray-800 rounded w-1/2" />
              <div className="h-24 bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-400 mb-4">Товар не найден</h2>
          <Link to="/catalog" className="px-4 py-2 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-400 transition-colors">
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image_url];
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Назад в каталог
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              <img src={images[activeImg] || images[0]} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-rose-500 text-white text-sm font-black rounded-full">
                  -{discount}%
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImg((a) => (a - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-gray-900/80 rounded-xl text-white hover:bg-gray-800 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setActiveImg((a) => (a + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-900/80 rounded-xl text-white hover:bg-gray-800 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-cyan-500' : 'border-gray-800 hover:border-gray-600'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">{product.brand}</span>
              {product.is_new && <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">НОВИНКА</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-black mb-4 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-400">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">({product.reviews_count} отзывов)</span>
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-black">{formatPrice(product.price)}</span>
              {product.old_price && (
                <span className="text-xl text-gray-500 line-through mb-0.5">{formatPrice(product.old_price)}</span>
              )}
            </div>

            <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                {product.stock > 0 ? `В наличии (${product.stock} шт.)` : 'Нет в наличии'}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-700 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-lg font-bold">−</button>
                <span className="w-12 text-center text-white font-bold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-lg font-bold">+</button>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  added ? 'bg-emerald-500 text-white' :
                  product.stock === 0 ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
                  'bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50'
                }`}
              >
                {added ? <><Check className="w-4 h-4" /> Добавлено!</> : <><ShoppingCart className="w-4 h-4" /> {inCart ? 'Ещё в корзину' : 'В корзину'}</>}
              </button>
              <button
                onClick={() => toggleFavorite(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${isFav ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-700 text-gray-400 hover:border-rose-500 hover:text-rose-500'}`}
              >
                <Heart className="w-5 h-5" fill={isFav ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Truck className="w-4 h-4" />, text: 'Доставка 1-2 дня' },
                { icon: <Shield className="w-4 h-4" />, text: 'Гарантия 1 год' },
                { icon: <Package className="w-4 h-4" />, text: 'Оригинал' },
              ].map((f) => (
                <div key={f.text} className="flex flex-col items-center gap-1.5 p-3 bg-gray-900 border border-gray-800 rounded-xl text-center">
                  <div className="text-cyan-400">{f.icon}</div>
                  <p className="text-xs text-gray-400">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-16">
            <h2 className="text-xl font-black mb-6">Характеристики</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div key={key} className={`flex items-center py-3 px-1 gap-4 ${i % 2 !== 1 || i === Object.keys(product.specs).length - 1 ? 'border-b border-gray-800' : 'border-b border-gray-800'}`}>
                  <span className="text-sm text-gray-500 w-36 shrink-0">{key}</span>
                  <span className="text-sm text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-black mb-6">Похожие товары</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
