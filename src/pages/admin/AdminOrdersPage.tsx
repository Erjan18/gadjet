import React, { useEffect, useState } from 'react';
import { X, Eye } from 'lucide-react';
import { supabase, Order, OrderItem } from '../../lib/supabase';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<(Order & { order_items: OrderItem[] }) | null>(null);
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openOrder = async (order: Order) => {
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setSelected({ ...order, order_items: (data || []) as OrderItem[] });
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdating(true);
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId);
    await load();
    if (selected?.id === orderId) setSelected((s) => s ? { ...s, status } : null);
    setUpdating(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-black mb-8">Заказы</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Заказов пока нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Покупатель</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Контакт</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Сумма</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Статус</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Дата</th>
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-white font-medium">{order.customer_name}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">{order.id.slice(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                      <p className="text-xs text-gray-600">{order.customer_email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm font-black text-white">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={updating}
                        className={`px-2 py-1 text-xs font-medium rounded-lg border bg-transparent focus:outline-none cursor-pointer ${statusColors[order.status] || statusColors.pending}`}
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val} className="bg-gray-900 text-white">{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => openOrder(order)} className="p-1.5 text-gray-500 hover:text-cyan-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div>
                <h3 className="text-lg font-bold">Заказ</h3>
                <p className="text-xs text-gray-500 font-mono">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Покупатель</p>
                  <p className="text-sm text-white font-medium">{selected.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Телефон</p>
                  <p className="text-sm text-white">{selected.customer_phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="text-sm text-white">{selected.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Дата</p>
                  <p className="text-sm text-white">{new Date(selected.created_at).toLocaleString('ru-RU')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Адрес</p>
                  <p className="text-sm text-white">{selected.customer_address}</p>
                </div>
                {selected.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Комментарий</p>
                    <p className="text-sm text-gray-300">{selected.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-800 pt-4">
                <p className="text-sm font-bold mb-3">Товары</p>
                <div className="space-y-2">
                  {selected.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 bg-gray-800 rounded-xl overflow-hidden shrink-0">
                        {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium line-clamp-1">{item.product_name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} шт. × {formatPrice(item.price)}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 flex justify-between items-center">
                <span className="font-bold">Итого</span>
                <span className="font-black text-xl text-cyan-400">{formatPrice(selected.total)}</span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2">Статус заказа</p>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={updating}
                  className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {Object.entries(statusLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
