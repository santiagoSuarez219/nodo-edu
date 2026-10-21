alter table public.profiles
  add column first_name        text    not null default '',
  add column last_name         text    not null default '',
  add column name_needs_review boolean not null default false;

create index on public.profiles (last_name, first_name);

-- spec-062 D3: única implementación de la heurística de separación.
create or replace function public.propose_name_split(p_full_name text)
returns table (first_name text, last_name text)
language plpgsql
immutable
set search_path = public
as $$
declare
  v_norm   text := btrim(regexp_replace(coalesce(p_full_name, ''), '\s+', ' ', 'g'));
  v_tokens text[] := '{}';
  v_buf    text := '';
  v_tok    text;
  n        int;
begin
  if v_norm = '' then
    return query select ''::text, ''::text;
    return;
  end if;

  if position('@' in v_norm) > 0 then
    return query select v_norm, ''::text;
    return;
  end if;

  foreach v_tok in array string_to_array(v_norm, ' ') loop
    if lower(v_tok) in ('de', 'del', 'la', 'las', 'los', 'y', 'san', 'da', 'van', 'von') then
      v_buf := v_buf || v_tok || ' ';
    else
      v_tokens := v_tokens || (v_buf || v_tok);
      v_buf := '';
    end if;
  end loop;
  if v_buf <> '' then
    v_tokens := v_tokens || btrim(v_buf);
  end if;

  n := coalesce(array_length(v_tokens, 1), 0);

  if n = 1 then
    return query select v_tokens[1], ''::text;
  elsif n = 2 then
    return query select v_tokens[1], v_tokens[2];
  elsif n = 3 then
    return query select v_tokens[1], v_tokens[2] || ' ' || v_tokens[3];
  else
    return query select array_to_string(v_tokens[1:n - 2], ' '),
                        v_tokens[n - 1] || ' ' || v_tokens[n];
  end if;
end;
$$;

-- spec-062 D2: full_name derivado; escritores legados re-proponen partes.
create or replace function public.sync_profile_names()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_first text;
  v_last  text;
  v_parts_written boolean;
begin
  if tg_op = 'INSERT' then
    v_parts_written := btrim(new.first_name) <> '' or btrim(new.last_name) <> '';
  else
    v_parts_written := new.first_name is distinct from old.first_name
                    or new.last_name  is distinct from old.last_name;
  end if;

  if not v_parts_written
     and btrim(coalesce(new.full_name, '')) <> ''
     and (tg_op = 'INSERT' or new.full_name is distinct from old.full_name) then
    select s.first_name, s.last_name into v_first, v_last
    from public.propose_name_split(new.full_name) s;
    new.first_name := v_first;
    new.last_name := v_last;
    new.name_needs_review := true;
  end if;

  new.first_name := btrim(new.first_name);
  new.last_name := btrim(new.last_name);

  if new.first_name <> '' or new.last_name <> '' then
    new.full_name := btrim(concat_ws(' ', nullif(new.first_name, ''), nullif(new.last_name, '')));
  end if;

  return new;
end;
$$;

create trigger sync_profile_names
  before insert or update on public.profiles
  for each row execute function public.sync_profile_names();

-- Backfill (D3): todo lo automático queda por revisar.
update public.profiles p
set (first_name, last_name) = (
      select s.first_name, s.last_name from public.propose_name_split(p.full_name) s
    ),
    name_needs_review = true
where btrim(p.full_name) <> ''
  and p.first_name = ''
  and p.last_name = '';
