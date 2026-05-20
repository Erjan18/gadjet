import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { formatPrice } from '../components/ProductCard';

type FormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', address: '', notes: '' });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = 'Введите имя';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Введите корректный email';
    if (!form.phone.trim()) e.phone = 'Введите телефон';
    if (!form.address.trim()) e.address = 'Введите адрес';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || cart.length === 0) return;
    setLoading(true);

    const { data: order, error } = await supabase.from('orders').insert({
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      customer_address: form.address,
      notes: form.notes,
      total: cartTotal,
      status: 'pending',
    }).select().maybeSingle();

    if (error || !order) {
      setLoading(false);
      alert('Ошибка при оформлении заказа. Попробуйте снова.');
      return;
    }

    const items = cart.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image_url,
      quantity: i.quantity,
      price: i.product.price,
    }));

    await supabase.from('order_items').insert(items);
    clearCart();
    setOrderId(order.id);
    setSuccess(true);
    setLoading(false);
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-colors ${
      errors[field]
        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50'
        : 'border-gray-700 focus:border-cyan-500 focus:ring-cyan-500/50'
    }`;

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black mb-4">Корзина пуста</h2>
          <Link to="/catalog" className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-400 transition-colors">
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black mb-3">Заказ оформлен!</h2>
          <p className="text-gray-400 mb-2">Ваш заказ принят в обработку.</p>
          <p className="text-xs text-gray-600 mb-6">ID: {orderId}</p>
          <p className="text-sm text-gray-400 mb-8">Мы свяжемся с вами по указанному номеру телефона для подтверждения доставки.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors">
            <ShoppingBag className="w-4 h-4" /> На главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Назад в корзину
        </Link>
        <h1 className="text-2xl font-black mb-8">Оформление заказа</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-5">Контактные данные</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Имя и фамилия</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Иван Иванов"
                    className={inputClass('name')}
                  />
                  {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="ivan@example.com"
                    className={inputClass('email')}
                  />
                  {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Телефон</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+996 700 000 000"
                    className={inputClass('phone')}
                  />
                  {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold mb-5">Доставка</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Адрес доставки</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="г. Бишкек, ул. Примерная, д. 1, кв. 10"
                    className={inputClass('address')}
                  />
                  {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Комментарий к заказу</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={3}
                    placeholder="Дополнительные пожелания..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-black rounded-xl transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Оформляем...' : 'Подтвердить заказ'}
            </button>
          </form>

          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Ваш заказ</h3>
              <div className="space-y-3 mb-5">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                      <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white font-medium line-clamp-2 leading-tight">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.quantity} шт.</p>
                    </div>
                    <span className="text-xs font-bold text-white shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                <span className="font-bold">Итого</span>
                <span className="font-black text-xl text-cyan-400">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
