import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Store routes */}
          <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
          <Route path="/catalog" element={<StoreLayout><CatalogPage /></StoreLayout>} />
          <Route path="/product/:id" element={<StoreLayout><ProductPage /></StoreLayout>} />
          <Route path="/cart" element={<StoreLayout><CartPage /></StoreLayout>} />
          <Route path="/checkout" element={<StoreLayout><CheckoutPage /></StoreLayout>} />
          <Route path="/favorites" element={<StoreLayout><FavoritesPage /></StoreLayout>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
