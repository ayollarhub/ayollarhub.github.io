-- Tuzatish 001: birinchi admin bo'lish ishlamasdi (trigger rolni qaytarardi)
create or replace function public.protect_profile() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_admin() and current_setting('ah.sys', true) is distinct from '1' then
    new.role := old.role;
    new.is_blocked := old.is_blocked;
    new.email := old.email;
  end if;
  return new;
end $$;
create or replace function public.claim_first_admin() returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists(select 1 from profiles where role = 'admin') then return false; end if;
  perform set_config('ah.sys','1',true);
  update profiles set role = 'admin' where id = auth.uid();
  perform set_config('ah.sys','0',true);
  return exists(select 1 from profiles where id = auth.uid() and role = 'admin');
end $$;

