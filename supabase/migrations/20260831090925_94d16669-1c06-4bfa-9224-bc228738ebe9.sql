-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- restaurants
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL,
  delivery_time TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.restaurants TO anon, authenticated;
GRANT ALL ON public.restaurants TO service_role;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "restaurants_public_read" ON public.restaurants FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "menu_items_public_read" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);

-- addresses
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT NOT NULL,
  full_address TEXT NOT NULL,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses_own" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER addresses_set_updated_at BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- orders
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  restaurant_name TEXT NOT NULL,
  address_text TEXT NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 40,
  total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- seed restaurants
INSERT INTO public.restaurants (id, name, cuisine, rating, delivery_time, image_url) VALUES
('11111111-1111-1111-1111-111111111101','Spice Route','North Indian',4.5,'30-35 min','/images/spice-route.jpg'),
('11111111-1111-1111-1111-111111111102','Tokyo Bowl','Japanese',4.7,'35-40 min','/images/tokyo-bowl.jpg'),
('11111111-1111-1111-1111-111111111103','Napoli Pizza','Italian',4.3,'25-30 min','/images/napoli-pizza.jpg'),
('11111111-1111-1111-1111-111111111104','Green Leaf','Healthy',4.6,'20-25 min','/images/green-leaf.jpg'),
('11111111-1111-1111-1111-111111111105','Burger Barn','American',4.2,'25-30 min','/images/burger-barn.jpg'),
('11111111-1111-1111-1111-111111111106','Chaat Corner','Street Food',4.4,'15-20 min','/images/chaat-corner.jpg');

INSERT INTO public.menu_items (restaurant_id, name, description, price, image_url) VALUES
('11111111-1111-1111-1111-111111111101','Butter Chicken','Creamy tomato gravy with tandoori chicken chunks',349,'/images/dish-north-indian.jpg'),
('11111111-1111-1111-1111-111111111101','Paneer Tikka Masala','Charred paneer cubes in a rich onion masala',299,'/images/dish-north-indian.jpg'),
('11111111-1111-1111-1111-111111111101','Dal Makhani','Slow-cooked black lentils finished with butter',229,'/images/dish-north-indian.jpg'),
('11111111-1111-1111-1111-111111111101','Garlic Naan','Tandoor-baked flatbread with garlic and coriander',59,'/images/dish-north-indian.jpg'),
('11111111-1111-1111-1111-111111111101','Hyderabadi Biryani','Fragrant basmati layered with spiced meat and saffron',379,'/images/dish-north-indian.jpg'),

('11111111-1111-1111-1111-111111111102','Salmon Sushi Set','Eight pieces of fresh salmon nigiri with wasabi',549,'/images/dish-japanese.jpg'),
('11111111-1111-1111-1111-111111111102','Chicken Ramen','Shoyu broth, noodles, egg and braised chicken',389,'/images/dish-japanese.jpg'),
('11111111-1111-1111-1111-111111111102','Veg Gyoza','Pan-fried dumplings with cabbage and sesame',249,'/images/dish-japanese.jpg'),
('11111111-1111-1111-1111-111111111102','Teriyaki Rice Bowl','Glazed chicken over steamed rice and greens',329,'/images/dish-japanese.jpg'),
('11111111-1111-1111-1111-111111111102','Miso Soup','Light miso broth with tofu and spring onion',119,'/images/dish-japanese.jpg'),

('11111111-1111-1111-1111-111111111103','Margherita Pizza','San Marzano tomato, fior di latte and basil',329,'/images/dish-italian.jpg'),
('11111111-1111-1111-1111-111111111103','Pepperoni Pizza','Double pepperoni with mozzarella and oregano',429,'/images/dish-italian.jpg'),
('11111111-1111-1111-1111-111111111103','Penne Alfredo','Penne tossed in a creamy parmesan sauce',309,'/images/dish-italian.jpg'),
('11111111-1111-1111-1111-111111111103','Garlic Bread Sticks','Buttery baked sticks with herbs and cheese dip',149,'/images/dish-italian.jpg'),
('11111111-1111-1111-1111-111111111103','Tiramisu','Coffee-soaked layers with mascarpone cream',199,'/images/dish-italian.jpg'),

('11111111-1111-1111-1111-111111111104','Quinoa Power Bowl','Quinoa, avocado, chickpeas and lemon tahini',299,'/images/dish-healthy.jpg'),
('11111111-1111-1111-1111-111111111104','Grilled Chicken Salad','Greens, cherry tomato and herb-grilled chicken',279,'/images/dish-healthy.jpg'),
('11111111-1111-1111-1111-111111111104','Avocado Toast','Sourdough, smashed avocado and chilli flakes',219,'/images/dish-healthy.jpg'),
('11111111-1111-1111-1111-111111111104','Berry Smoothie','Blended berries, banana and almond milk',179,'/images/dish-healthy.jpg'),
('11111111-1111-1111-1111-111111111104','Falafel Wrap','Baked falafel, hummus and pickled veg',249,'/images/dish-healthy.jpg'),

('11111111-1111-1111-1111-111111111105','Classic Cheeseburger','Beef patty, cheddar, lettuce and house sauce',289,'/images/dish-american.jpg'),
('11111111-1111-1111-1111-111111111105','Crispy Chicken Burger','Buttermilk fried chicken with slaw',269,'/images/dish-american.jpg'),
('11111111-1111-1111-1111-111111111105','Loaded Fries','Fries with cheese sauce, jalapeno and herbs',189,'/images/dish-american.jpg'),
('11111111-1111-1111-1111-111111111105','BBQ Wings','Six wings glazed in smoky barbecue sauce',299,'/images/dish-american.jpg'),
('11111111-1111-1111-1111-111111111105','Chocolate Shake','Thick shake with cocoa and vanilla ice cream',169,'/images/dish-american.jpg'),

('11111111-1111-1111-1111-111111111106','Pani Puri','Six crisp puris with spiced mint water',89,'/images/dish-street-food.jpg'),
('11111111-1111-1111-1111-111111111106','Aloo Tikki Chaat','Potato patties with curd, chutney and sev',109,'/images/dish-street-food.jpg'),
('11111111-1111-1111-1111-111111111106','Pav Bhaji','Buttery mashed vegetables with toasted pav',139,'/images/dish-street-food.jpg'),
('11111111-1111-1111-1111-111111111106','Dahi Puri','Puris filled with curd, potato and tamarind',99,'/images/dish-street-food.jpg'),
('11111111-1111-1111-1111-111111111106','Masala Chai','Slow-brewed tea with ginger and cardamom',49,'/images/dish-street-food.jpg');