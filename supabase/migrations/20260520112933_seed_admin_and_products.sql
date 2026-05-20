/*
  # Seed Admin User and Sample Products

  1. Creates admin@gadjet.com user with password 123456
  2. Registers them in admins table
  3. Inserts 12 sample products if products table is empty
*/

-- Create admin user
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@gadjet.com') THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'admin@gadjet.com',
      crypt('123456', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin"}',
      false, 'authenticated', 'authenticated'
    );
  END IF;

  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@gadjet.com';
  INSERT INTO admins (user_id) VALUES (v_user_id) ON CONFLICT (user_id) DO NOTHING;
END $$;

-- Seed products only if table is empty
DO $$
DECLARE
  cat_smartphones uuid;
  cat_laptops uuid;
  cat_headphones uuid;
  cat_smartwatches uuid;
  cat_tablets uuid;
  cat_accessories uuid;
BEGIN
  IF (SELECT COUNT(*) FROM products) > 0 THEN
    RETURN;
  END IF;

  SELECT id INTO cat_smartphones FROM categories WHERE slug = 'smartphones';
  SELECT id INTO cat_laptops FROM categories WHERE slug = 'laptops';
  SELECT id INTO cat_headphones FROM categories WHERE slug = 'headphones';
  SELECT id INTO cat_smartwatches FROM categories WHERE slug = 'smartwatches';
  SELECT id INTO cat_tablets FROM categories WHERE slug = 'tablets';
  SELECT id INTO cat_accessories FROM categories WHERE slug = 'accessories';

  INSERT INTO products (name, description, price, old_price, category_id, image_url, images, brand, stock, rating, reviews_count, is_featured, is_new, specs) VALUES
  ('iPhone 15 Pro Max', 'Самый мощный iPhone с чипом A17 Pro, камерой 48 МП и титановым корпусом.', 89990, 99990, cat_smartphones, 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Apple', 15, 4.9, 312, true, true, '{"Процессор":"Apple A17 Pro","ОЗУ":"8 ГБ","Память":"256 ГБ","Экран":"6.7 дюйм","Камера":"48 МП"}'::jsonb),
  ('Samsung Galaxy S24 Ultra', 'Флагман Samsung с встроенным стилусом S Pen и камерой 200 МП.', 79990, 89990, cat_smartphones, 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Samsung', 20, 4.8, 245, true, true, '{"Процессор":"Snapdragon 8 Gen 3","ОЗУ":"12 ГБ","Память":"256 ГБ","Экран":"6.8 дюйм","Камера":"200 МП"}'::jsonb),
  ('MacBook Pro 16 M3', 'Профессиональный ноутбук Apple с чипом M3 Pro и дисплеем Liquid Retina XDR.', 149990, null, cat_laptops, 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], 'Apple', 8, 4.9, 187, true, false, '{"Процессор":"Apple M3 Pro","ОЗУ":"18 ГБ","Память":"512 ГБ SSD","Экран":"16.2 дюйм","Видеокарта":"19-core GPU"}'::jsonb),
  ('ASUS ROG Zephyrus G14', 'Игровой ноутбук с AMD Ryzen 9 и RTX 4060, идеален для геймеров.', 109990, 119990, cat_laptops, 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=600'], 'ASUS', 12, 4.7, 134, false, true, '{"Процессор":"AMD Ryzen 9 7940HS","ОЗУ":"16 ГБ","Память":"1 ТБ SSD","Экран":"14 дюйм","Видеокарта":"RTX 4060"}'::jsonb),
  ('Sony WH-1000XM5', 'Лучшие наушники с активным шумоподавлением и Hi-Res Audio.', 34990, 39990, cat_headphones, 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Sony', 30, 4.8, 423, true, false, '{"Тип":"Over-ear","ANC":"Да","Bluetooth":"5.2","Время работы":"30 ч","Быстрая зарядка":"Да"}'::jsonb),
  ('Apple AirPods Pro 2', 'TWS наушники Apple с адаптивным шумоподавлением и пространственным звуком.', 24990, 27990, cat_headphones, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Apple', 45, 4.7, 567, true, false, '{"Тип":"TWS","ANC":"Адаптивный","Chip":"H2","Время работы":"6 ч + 24 ч","MagSafe":"Да"}'::jsonb),
  ('Apple Watch Ultra 2', 'Самые выносливые смарт-часы для экстремальных условий с чипом S9.', 69990, null, cat_smartwatches, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Apple', 10, 4.9, 198, true, true, '{"Экран":"49 мм OLED","GPS":"Двойной","Батарея":"60 ч","Водозащита":"100 м","Чип":"S9"}'::jsonb),
  ('Samsung Galaxy Watch 6 Classic', 'Элегантные смарт-часы Samsung с вращающимся безелем и мониторингом здоровья.', 29990, 34990, cat_smartwatches, 'https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/393047/pexels-photo-393047.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Samsung', 18, 4.6, 215, false, false, '{"Экран":"47 мм AMOLED","Безель":"Вращающийся","Батарея":"44 мАч","ЭКГ":"Да","Давление":"Да"}'::jsonb),
  ('iPad Pro 12.9 M2', 'Мощный планшет Apple с чипом M2, дисплеем Liquid Retina XDR и поддержкой Apple Pencil.', 89990, 99990, cat_tablets, 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Apple', 14, 4.8, 276, true, false, '{"Чип":"Apple M2","Экран":"12.9 дюйм Liquid Retina XDR","Память":"256 ГБ","Камера":"12 МП","Face ID":"Да"}'::jsonb),
  ('Samsung Galaxy Tab S9+', 'Флагманский Android-планшет с AMOLED-дисплеем и стилусом S Pen.', 69990, 74990, cat_tablets, 'https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/7974/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=600'], 'Samsung', 16, 4.7, 189, false, true, '{"Процессор":"Snapdragon 8 Gen 2","Экран":"12.4 дюйм AMOLED","Память":"256 ГБ","S Pen":"В комплекте","IP68":"Да"}'::jsonb),
  ('Anker MagSafe Charger 15W', 'Быстрое беспроводное зарядное устройство MagSafe с мощностью 15 Вт.', 4990, 5990, cat_accessories, 'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Anker', 60, 4.5, 312, false, false, '{"Мощность":"15 Вт","Стандарт":"MagSafe","Кабель":"USB-C","Совместимость":"iPhone 12+"}'::jsonb),
  ('Baseus 65W GaN Charger', 'Компактное GaN-зарядное устройство на 65 Вт с 3 портами для быстрой зарядки.', 3490, null, cat_accessories, 'https://images.pexels.com/photos/5081386/pexels-photo-5081386.jpeg?auto=compress&cs=tinysrgb&w=600', ARRAY['https://images.pexels.com/photos/5081386/pexels-photo-5081386.jpeg?auto=compress&cs=tinysrgb&w=600'], 'Baseus', 80, 4.6, 445, false, true, '{"Мощность":"65 Вт","Порты":"2x USB-C + 1x USB-A","Технология":"GaN","Быстрая зарядка":"PD 3.0"}'::jsonb);
END $$;
