import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase, Order } from '../../lib/supabase';
import { formatPrice } from '../../components/ProductCard';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const statusLabels: Record<string, string> = {
  pending: 'Новый',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prodRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);
      const total = ordersRes.data?.reduce((s, o) => s + Number(o.total), 0) || 0;
      setStats({
        products: prodRes.count || 0,
        orders: ordersRes.data?.length || 0,
        revenue: total,
      });
      setRecentOrders((ordersRes.data || []).slice(0, 8) as Order[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black">Дашборд</h1>
        <Link to="/" target="_blank" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
          Открыть сайт <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Товаров', value: stats.products, icon: <Package className="w-5 h-5" />, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Заказов', value: stats.orders, icon: <ShoppingBag className="w-5 h-5" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Выручка', value: formatPrice(stats.revenue), icon: <TrendingUp className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{s.label}</p>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${s.bg} ${s.color}`}>{s.icon}</div>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{loading ? '—' : s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" /> Последние заказы
          </h2>
          <Link to="/admin/orders" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Все заказы</Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Заказов пока нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Покупатель</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Сумма</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Статус</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-white font-medium">{order.customer_name}</p>
                      <p className="text-xs text-gray-500">{order.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-white">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[order.status] || statusColors.pending}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
