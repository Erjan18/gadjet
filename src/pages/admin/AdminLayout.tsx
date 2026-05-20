import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LayoutDashboard, Package, ShoppingBag, LogOut, Menu, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin'); return; }
      const { data: admin } = await supabase.from('admins').select('id').eq('user_id', session.user.id).maybeSingle();
      if (!admin) { navigate('/admin'); return; }
      setChecking(false);
    })();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { to: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Дашборд' },
    { to: '/admin/products', icon: <Package className="w-4 h-4" />, label: 'Товары' },
    { to: '/admin/orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Заказы' },
  ];

  const Sidebar = () => (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col h-full">
      <div className="p-5 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-base font-black text-white">GAD<span className="text-cyan-400">JET</span></span>
        </Link>
        <p className="text-xs text-gray-600 mt-1 ml-9">Admin Panel</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setSideOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              location.pathname === item.to ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-56 fixed inset-y-0 left-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {sideOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 flex flex-col">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/60" onClick={() => setSideOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-40 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSideOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-black text-white">GAD<span className="text-cyan-400">JET</span> Admin</span>
          <div />
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
