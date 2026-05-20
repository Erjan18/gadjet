import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../components/ProductCard';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useApp();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Корзина пуста</h2>
          <p className="text-gray-500 mb-6">Добавьте товары из каталога</p>
          <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors">
            <ShoppingBag className="w-4 h-4" /> Перейти в каталог
          </Link>
        </div>
      </div>
    );
  }

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-black mb-8">Корзина <span className="text-gray-500 font-normal text-lg">({itemCount} товаров)</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-4 hover:border-gray-700 transition-colors">
                <Link to={`/product/${item.product.id}`} className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors line-clamp-2 mb-1">{item.product.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-500 mb-3">{item.product.brand}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-700 rounded-xl overflow-hidden">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-white text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-3 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-white">{formatPrice(item.product.price * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-gray-600 hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-5">Итого</h3>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Товары ({itemCount})</span>
                  <span className="text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Доставка</span>
                  <span className="text-emerald-400">Бесплатно</span>
                </div>
                <div className="border-t border-gray-800 pt-3 flex justify-between">
                  <span className="font-bold text-white">К оплате</span>
                  <span className="font-black text-xl text-white">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50"
              >
                Оформить заказ <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/catalog" className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-xl transition-colors">
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
