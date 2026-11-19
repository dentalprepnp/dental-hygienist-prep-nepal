-- HL Preparation: student phone number for admin guidance
-- Run this entire script in Supabase Dashboard > SQL Editor.

alter table public.admin_student_directory
  add column if not exists phone text;

create or replace function public.hlp_sync_auth_user_to_directory()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.admin_student_directory(user_id,email,display_name,phone,created_at,last_sign_in_at)
  values(new.id,new.email,new.raw_user_meta_data->>'name',new.raw_user_meta_data->>'phone',coalesce(new.created_at,now()),new.last_sign_in_at)
  on conflict(user_id) do update set
    email=excluded.email,
    display_name=coalesce(excluded.display_name,public.admin_student_directory.display_name),
    phone=coalesce(excluded.phone,public.admin_student_directory.phone),
    last_sign_in_at=excluded.last_sign_in_at;
  return new;
end;
$$;

drop trigger if exists hlp_auth_user_directory_trigger on auth.users;
create trigger hlp_auth_user_directory_trigger
after insert or update of email,last_sign_in_at,raw_user_meta_data on auth.users
for each row execute function public.hlp_sync_auth_user_to_directory();

update public.admin_student_directory d
set phone=u.raw_user_meta_data->>'phone'
from auth.users u
where d.user_id=u.id
  and nullif(u.raw_user_meta_data->>'phone','') is not null;

-- Phone numbers remain visible only through the existing admin-only SELECT policy.
select display_name,email,phone,created_at
from public.admin_student_directory
order by created_at desc
limit 20;
