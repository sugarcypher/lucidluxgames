-- Lucid Lux games, part 4: Vortex Wisdom joins the accounts.
-- For the Lucid Lux project (tsbazrbdkojzhnglakcv). Source of the game: sugarcypher/vortex-wisdom
-- (private), which keeps a copy of this file at supabase/004_vortex_wisdom.sql.
-- Applied 2026-10-30 as migration 20261030123344 "vortex_wisdom_joins_accounts".
--
-- 1. The catalog entry lets ll_save_get / ll_save_put hold a Vortex Wisdom save.
--    The save carries the game's own badges and lifetime totals; settings stay on the device.
-- 2. ll_submit_result accepts a finished drift (kind 'run'), so Vortex Wisdom counts toward
--    the cross-game badges (Wanderer, Explorer). The body is the live 003 definition with one
--    branch added; nothing else changes for Batduko or Resonant.

insert into games.catalog (game, name, live) values ('vortex-wisdom', 'Vortex Wisdom', true)
on conflict (game) do update set live = true;

create or replace function public.ll_submit_result(p_game text, p_kind text, p_level integer,
  p_score integer, p_duration_ms integer, p_won boolean default true, p_version text default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := auth.uid();
  v_gap interval;
  v_last timestamptz;
  v_id bigint;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'reason', 'signed_out'); end if;
  if not exists (select 1 from games.players where id = v_uid) then
    return jsonb_build_object('ok', false, 'reason', 'no_profile');
  end if;
  if p_game = 'batduko' then
    if p_kind <> 'solve' or not coalesce(p_won, false) or coalesce(p_level, 0) not between 1 and 3
       or coalesce(p_score, -1) not between 0 and 20000 or coalesce(p_duration_ms, 0) < 15000
       or p_duration_ms > 21600000 then
      return jsonb_build_object('ok', false, 'reason', 'implausible');
    end if;
    v_gap := interval '10 seconds';
  elsif p_game = 'resonant' then
    if p_kind <> 'round' or coalesce(p_level, 0) not between 1 and 9
       or coalesce(p_score, -1) not between 0 and 100 or coalesce(p_duration_ms, 0) < 3000
       or p_duration_ms > 21600000 then
      return jsonb_build_object('ok', false, 'reason', 'implausible');
    end if;
    v_gap := interval '3 seconds';
  elsif p_game = 'vortex-wisdom' then
    -- One drift: level is the depth reached, score the wisdom gathered. A level lasts
    -- 64 seconds; a strong minute earns ~450 wisdom, so the ceiling is 600 a minute plus
    -- 3,000 of headroom, and a depth beyond the time played is refused.
    if p_kind <> 'run' or coalesce(p_level, 0) not between 1 and 200
       or coalesce(p_score, -1) < 0 or coalesce(p_duration_ms, 0) < 10000
       or p_duration_ms > 21600000
       or p_score > 3000 + p_duration_ms / 100
       or p_level > 1 + p_duration_ms / 60000 then
      return jsonb_build_object('ok', false, 'reason', 'implausible');
    end if;
    v_gap := interval '10 seconds';
  else
    return jsonb_build_object('ok', false, 'reason', 'unknown_game');
  end if;
  if not exists (select 1 from games.catalog where game = p_game and live) then
    return jsonb_build_object('ok', false, 'reason', 'unknown_game');
  end if;

  select max(created_at) into v_last from games.runs where player_id = v_uid and game = p_game;
  if v_last is not null and now() - v_last < v_gap then
    return jsonb_build_object('ok', false, 'reason', 'too_soon');
  end if;

  insert into games.runs (player_id, game, kind, round_id, score, accuracy, combo, level,
                          correct, wrong, duration_ms, finished, client_version)
  values (v_uid, p_game, p_kind, null, p_score, 0, 0, p_level, 0, 0, p_duration_ms,
          coalesce(p_won, false), left(p_version, 24))
  returning id into v_id;

  perform games.award(v_uid, p_game);

  return jsonb_build_object('ok', true, 'id', v_id,
    'new_badges', coalesce((select jsonb_agg(jsonb_build_object('slug', b.slug, 'name', b.name, 'hint', b.hint) order by b.sort)
                              from games.player_badges pb join games.badges b on b.slug = pb.slug
                             where pb.player_id = v_uid and pb.earned_at = now()), '[]'::jsonb));
end $$;

revoke all on function public.ll_submit_result(text, text, integer, integer, integer, boolean, text) from public, anon;
grant execute on function public.ll_submit_result(text, text, integer, integer, integer, boolean, text) to authenticated;
