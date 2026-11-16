-- =====================================================================
-- AYOLLAR HUB — Supabase bazasi (v1)
-- Supabase → SQL Editor → shu faylni to'liq qo'yib "Run" bosing.
-- Qayta ishga tushirsa ham xavfsiz (idempotent).
-- =====================================================================

-- ---------- 1. PROFILLAR ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text,
  phone       text,
  birth_date  date,
  lang        text not null default 'uz',
  interest    text,
  shop_name   text,
  shop_phone  text,
  shop_tg     text,
  role        text not null default 'user' check (role in ('user','admin')),
  is_blocked  boolean not null default false,
  onboarded   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Yordamchi funksiyalar (RLS ichida rekursiyasiz ishlashi uchun security definer)
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_active_user() returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() is not null
     and not exists(select 1 from profiles where id = auth.uid() and is_blocked);
$$;

-- Yangi foydalanuvchi ro'yxatdan o'tganda profil avtomatik yaratiladi
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, email, phone, lang)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name',''),
          new.email,
          new.raw_user_meta_data->>'phone',
          coalesce(new.raw_user_meta_data->>'lang','uz'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Oddiy foydalanuvchi o'ziga admin rolini bera olmaydi
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
    new.email := old.email;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile before update on public.profiles
for each row execute function public.protect_profile();

alter table public.profiles enable row level security;
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (id = auth.uid() or is_admin());
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using (id = auth.uid() or is_admin());

-- Birinchi admin: hali admin yo'q bo'lsa, chaqirgan odam admin bo'ladi
create or replace function public.claim_first_admin() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists(select 1 from profiles where role = 'admin') then return false; end if;
  update profiles set role = 'admin' where id = auth.uid();
  return true;
end $$;

create or replace function public.admin_exists() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where role = 'admin');
$$;

-- ---------- 2. MAHSULOTLAR ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid references auth.users(id) on delete cascade,  -- null = platforma
  owner_name  text not null default 'Ayollar Hub do''koni',
  cat         text not null,
  name        text not null check (char_length(name) between 2 and 80),
  price       integer not null check (price > 0),
  descr       text default '' check (char_length(descr) <= 500),
  recipe      text default '' check (char_length(recipe) <= 1500),
  img_url     text default '',
  tone        text default '#f3c5d4',
  tg          text default '',
  phone       text default '',
  stock       boolean not null default true,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  sort        integer not null default 100,
  created_at  timestamptz not null default now()
);

create or replace function public.protect_product() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending';
      new.owner := auth.uid();
    else
      new.status := old.status;
      new.owner := old.owner;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_product on public.products;
create trigger protect_product before insert or update on public.products
for each row execute function public.protect_product();

alter table public.products enable row level security;
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products for select
  using (status = 'approved' or owner = auth.uid() or is_admin());
drop policy if exists "products_insert" on public.products;
create policy "products_insert" on public.products for insert
  with check (is_active_user());
drop policy if exists "products_update" on public.products;
create policy "products_update" on public.products for update
  using (owner = auth.uid() or is_admin());
drop policy if exists "products_delete" on public.products;
create policy "products_delete" on public.products for delete
  using (owner = auth.uid() or is_admin());

-- ---------- 3. BUYURTMALAR ----------
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  buyer       uuid not null references auth.users(id) on delete cascade default auth.uid(),
  seller      uuid references auth.users(id) on delete set null,   -- null = platforma
  seller_name text default '',
  seller_tg   text default '',
  items       jsonb not null,
  total       integer not null default 0,
  buyer_name  text not null,
  phone       text not null,
  delivery    boolean not null default true,
  region      text default '',
  addr        text default '',
  landmark    text default '',
  map_url     text default '',
  note        text default '',
  status      text not null default 'yangi' check (status in ('yangi','tayyor','yetdi','bekor')),
  created_at  timestamptz not null default now()
);

create or replace function public.old_with_status(o public.orders, s text) returns public.orders
language plpgsql immutable as $$
begin o.status := s; return o; end $$;

create or replace function public.protect_order() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.buyer := auth.uid(); new.status := 'yangi';
    return new;
  end if;
  if old.seller = auth.uid() then
    if new.status not in ('tayyor','yetdi','bekor') then raise exception 'Noto''g''ri holat'; end if;
    return old_with_status(old, new.status);
  end if;
  if old.buyer = auth.uid() and old.status = 'yangi' and new.status = 'bekor' then
    return old_with_status(old, 'bekor');
  end if;
  raise exception 'Ruxsat yo''q';
end $$;

drop trigger if exists protect_order on public.orders;
create trigger protect_order before insert or update on public.orders
for each row execute function public.protect_order();

alter table public.orders enable row level security;
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders for select
  using (buyer = auth.uid() or seller = auth.uid() or is_admin());
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders for insert
  with check (is_active_user());
drop policy if exists "orders_update" on public.orders;
create policy "orders_update" on public.orders for update
  using (buyer = auth.uid() or seller = auth.uid() or is_admin());

-- ---------- 4. POSTLAR (psixologik taxta, fikrlar, so'rovlar) ----------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  board       text not null check (board in ('psych','feedback','request')),
  text        text not null check (char_length(text) between 2 and 600),
  author      uuid references auth.users(id) on delete set null default auth.uid(),
  hidden      boolean not null default false,
  hearts      integer not null default 0,
  reports     integer not null default 0,
  created_at  timestamptz not null default now()
);


alter table public.posts enable row level security;
drop policy if exists "posts_select" on public.posts;
create policy "posts_select" on public.posts for select
  using (hidden = false or is_admin());
drop policy if exists "posts_insert" on public.posts;
create policy "posts_insert" on public.posts for insert
  with check (is_active_user());
drop policy if exists "posts_update" on public.posts;
create policy "posts_update" on public.posts for update using (is_admin());
drop policy if exists "posts_delete" on public.posts;
create policy "posts_delete" on public.posts for delete using (is_admin());

-- Anonimlik: muallif ID'si oddiy foydalanuvchilarga umuman berilmaydi
revoke select on public.posts from anon, authenticated;
grant select (id, board, text, hidden, hearts, reports, created_at) on public.posts to anon, authenticated;
grant insert (board, text) on public.posts to authenticated;
grant update (hidden) on public.posts to authenticated;
grant delete on public.posts to authenticated;

-- Admin uchun: post muallifini bloklash (ID ko'rsatmasdan)
create or replace function public.admin_block_post_author(p_post uuid) returns boolean
language plpgsql security definer set search_path = public as $$
declare a uuid;
begin
  if not is_admin() then raise exception 'Ruxsat yo''q'; end if;
  select author into a from posts where id = p_post;
  if a is null then return false; end if;
  update profiles set is_blocked = true where id = a and role <> 'admin';
  update posts set hidden = true where author = a;
  return true;
end $$;

-- ---------- 5. YURAKCHALAR (har kim bir marta) ----------
create table if not exists public.post_hearts (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  primary key (post_id, user_id)
);
alter table public.post_hearts enable row level security;
drop policy if exists "hearts_own" on public.post_hearts;
create policy "hearts_own" on public.post_hearts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid() and is_active_user());

-- posts ga to'g'ridan-to'g'ri update protect_post'ga tushmasligi uchun
create or replace function public.protect_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.author := auth.uid(); new.hearts := 0; new.reports := 0; new.hidden := false;
  elsif not is_admin() and current_setting('ah.sys', true) is distinct from '1' then
    raise exception 'Ruxsat yo''q';
  end if;
  return new;
end $$;
drop trigger if exists protect_post on public.posts;
create trigger protect_post before insert or update on public.posts
for each row execute function public.protect_post();

create or replace function public.sync_hearts() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.post_id, old.post_id);
begin
  perform set_config('ah.sys','1',true);
  update posts set hearts = (select count(*) from post_hearts where post_id = pid) where id = pid;
  perform set_config('ah.sys','0',true);
  return null;
end $$;
drop trigger if exists sync_hearts on public.post_hearts;
create trigger sync_hearts after insert or delete on public.post_hearts
for each row execute function public.sync_hearts();

-- ---------- 6. SHIKOYATLAR ----------
create table if not exists public.reports (
  post_id    uuid references public.posts(id) on delete cascade,
  user_id    uuid references auth.users(id) on delete cascade default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.reports enable row level security;
drop policy if exists "reports_insert" on public.reports;
create policy "reports_insert" on public.reports for insert
  with check (user_id = auth.uid() and is_active_user());
drop policy if exists "reports_admin" on public.reports;
create policy "reports_admin" on public.reports for select using (is_admin() or user_id = auth.uid());

create or replace function public.sync_reports() returns trigger
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform set_config('ah.sys','1',true);
  select count(*) into n from reports where post_id = new.post_id;
  -- 3 ta shikoyatdan keyin post avtomatik yashiriladi (admin qayta ochishi mumkin)
  update posts set reports = n, hidden = (hidden or n >= 3) where id = new.post_id;
  perform set_config('ah.sys','0',true);
  return null;
end $$;
drop trigger if exists sync_reports on public.reports;
create trigger sync_reports after insert on public.reports
for each row execute function public.sync_reports();

-- ---------- 7. SEVIMLILAR ----------
create table if not exists public.favorites (
  user_id    uuid references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid references public.products(id) on delete cascade,
  primary key (user_id, product_id)
);
alter table public.favorites enable row level security;
drop policy if exists "fav_own" on public.favorites;
create policy "fav_own" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 8. RASMLAR (Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('products','products', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

drop policy if exists "prod_img_read" on storage.objects;
create policy "prod_img_read" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "prod_img_insert" on storage.objects;
create policy "prod_img_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'products' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user());
drop policy if exists "prod_img_delete" on storage.objects;
create policy "prod_img_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'products' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- ---------- 9. ADMIN STATISTIKA ----------
create or replace function public.admin_stats() returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Ruxsat yo''q'; end if;
  return json_build_object(
    'users',     (select count(*) from profiles),
    'users_7d',  (select count(*) from profiles where created_at > now() - interval '7 days'),
    'products',  (select count(*) from products where status='approved'),
    'pending',   (select count(*) from products where status='pending'),
    'orders',    (select count(*) from orders),
    'orders_new',(select count(*) from orders where status='yangi'),
    'revenue',   (select coalesce(sum(total),0) from orders where status='yetdi'),
    'posts',     (select count(*) from posts),
    'reported',  (select count(*) from posts where reports > 0 and not hidden)
  );
end $$;

-- ---------- 10. REALTIME ----------
do $$ begin
  begin alter publication supabase_realtime add table public.posts; exception when others then null; end;
  begin alter publication supabase_realtime add table public.orders; exception when others then null; end;
  begin alter publication supabase_realtime add table public.products; exception when others then null; end;
end $$;

-- ---------- 11. BOSHLANG'ICH MAHSULOTLAR (platforma do'koni) ----------
insert into public.products (id, owner, owner_name, cat, name, price, descr, img_url, tone, tg, status, sort)
select * from (values
 ('00000000-0000-4000-8000-000000000000'::uuid, null::uuid, 'Ayollar Hub do''koni','atir','Pushti bantli gulli atir',189000,'Pushti bantli, nafis va yumshoq hidli atir.','img/products/b0.jpg','#f3c5d4','jasmin_311','approved',0),
 ('00000000-0000-4000-8000-000000000001', null, 'Ayollar Hub do''koni','atir','Eclat Mademoiselle (Oriflame) atiri',129000,'Yengil gulli, kundalik foydalanish uchun.','img/products/b1.jpg','#e6dff3','jasmin_311','approved',1),
 ('00000000-0000-4000-8000-000000000002', null, 'Ayollar Hub do''koni','atir','Gulli shishali atir',99000,'Chiroyli gul shakldagi shisha — sovg''a uchun ayni muddao.','img/products/b2.jpg','#f7ddb4','jasmin_311','approved',2),
 ('00000000-0000-4000-8000-000000000003', null, 'Ayollar Hub do''koni','bijuteriya','Pushti toshli bilakuzuklar to''plami',119000,'5 xil bilakuzuk: yonca, bant, oqqush, barg.','img/products/b3.jpg','#d9e8f5','jasmin_311','approved',3),
 ('00000000-0000-4000-8000-000000000004', null, 'Ayollar Hub do''koni','bijuteriya','Pushti oqqushli marjon',79000,'Sovg''a qutisi bilan.','img/products/b4.jpg','#f3c5d4','jasmin_311','approved',4),
 ('00000000-0000-4000-8000-000000000005', null, 'Ayollar Hub do''koni','bijuteriya','Yaltiroq toshli set (zanjir, sirg''a, uzuk)',119000,'Bayram va to''y uchun.','img/products/b5.jpg','#e6dff3','jasmin_311','approved',5),
 ('00000000-0000-4000-8000-000000000006', null, 'Ayollar Hub do''koni','bijuteriya','Kapalakli set (bilakuzuk, sirg''a, zanjir)',89000,'Oltin rangli, yengil va nafis.','img/products/b6.jpg','#f7ddb4','jasmin_311','approved',6),
 ('00000000-0000-4000-8000-000000000007', null, 'Ayollar Hub do''koni','bijuteriya','Qora yoncha bilakuzuk',49000,'Kundalik taqish uchun.','img/products/b7.jpg','#d9e8f5','jasmin_311','approved',7),
 ('00000000-0000-4000-8000-000000000008', null, 'Ayollar Hub do''koni','bijuteriya','Kumush bantli set',99000,'Bilakuzuk, zanjir va sirg''a.','img/products/b8.jpg','#f3c5d4','jasmin_311','approved',8),
 ('00000000-0000-4000-8000-000000000009', null, 'Ayollar Hub do''koni','bijuteriya','Bilakuzuklar kolleksiyasi',39000,'Turli uslubdagi bilakuzuklardan tanlang.','img/products/b9.jpg','#e6dff3','jasmin_311','approved',9),
 ('00000000-0000-4000-8000-000000000010', null, 'Ayollar Hub do''koni','bijuteriya','Pushti toshli bargli bilakuzuk',69000,'Nafis bargli dizayn.','img/products/b10.jpg','#f7ddb4','jasmin_311','approved',10),
 ('00000000-0000-4000-8000-000000000011', null, 'Ayollar Hub do''koni','bijuteriya','Yashil toshli set (zanjir, sirg''a, uzuk)',149000,'Sovg''a qutisida.','img/products/b11.jpg','#d9e8f5','jasmin_311','approved',11),
 ('00000000-0000-4000-8000-000000000012', null, 'Ayollar Hub do''koni','aksessuar','Ayollar soati (pushti-oltin)',229000,'Tosh bezakli, charm tasmali zamonaviy soat.','img/products/b12.jpg','#f3c5d4','jasmin_311','approved',12)
) as v
on conflict (id) do nothing;
