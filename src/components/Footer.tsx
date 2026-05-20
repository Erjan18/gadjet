import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black text-white">GAD<span className="text-cyan-400">JET</span></span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Лучший магазин гаджетов в Кыргызстане. Оригинальные товары с гарантией.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Каталог</h4>
            <ul className="space-y-2">
              {['Смартфоны', 'Ноутбуки', 'Наушники', 'Смарт-часы', 'Планшеты', 'Аксессуары'].map((cat) => (
                <li key={cat}>
                  <Link to={`/catalog?category=${cat}`} className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Покупателям</h4>
            <ul className="space-y-2">
              {['Каталог', 'Корзина', 'Избранное', 'Оформление заказа'].map((item) => (
                <li key={item}>
                  <Link to="/catalog" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                +996 700 123 456
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                info@gadjet.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                Бишкек, пр. Манаса 40
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2024 GADJET. Все права защищены.</p>
          <p className="text-xs text-gray-600">Цены указаны в сомах (с)</p>
        </div>
      </div>
    </footer>
  );
}
