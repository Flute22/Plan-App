-- =====================================================================
-- flow-Day Admin Panel — Supabase Migration
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================================

-- 1. Profiles table — user profiles with roles & status
-- =====================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'deleted')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Activity log — tracks signups, logins, admin actions
-- =====================================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Trigger: auto-create profile when a new user signs up
-- =====================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );

  INSERT INTO activity_log (user_id, action, details)
  VALUES (
    NEW.id,
    'signup',
    jsonb_build_object('email', NEW.email, 'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 4. Add user_id to app_state if not already present
-- =====================================================================
ALTER TABLE app_state ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 5. Enable Row Level Security
-- =====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies — Profiles
-- =====================================================================
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin reads all profiles" ON profiles;
CREATE POLICY "Admin reads all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin updates all profiles" ON profiles;
CREATE POLICY "Admin updates all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "System inserts profiles" ON profiles;
CREATE POLICY "System inserts profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- 7. RLS Policies — Activity Log
-- =====================================================================
DROP POLICY IF EXISTS "Admin reads all activity" ON activity_log;
CREATE POLICY "Admin reads all activity" ON activity_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Anyone inserts activity" ON activity_log;
CREATE POLICY "Anyone inserts activity" ON activity_log
  FOR INSERT WITH CHECK (true);

-- 8. RLS Policies — App State (user data)
-- =====================================================================
DROP POLICY IF EXISTS "Users read own data" ON app_state;
CREATE POLICY "Users read own data" ON app_state
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin reads all data" ON app_state;
CREATE POLICY "Admin reads all data" ON app_state
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users insert own data" ON app_state;
CREATE POLICY "Users insert own data" ON app_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own data" ON app_state;
CREATE POLICY "Users update own data" ON app_state
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin updates all data" ON app_state;
CREATE POLICY "Admin updates all data" ON app_state
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users delete own data" ON app_state;
CREATE POLICY "Users delete own data" ON app_state
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin deletes all data" ON app_state;
CREATE POLICY "Admin deletes all data" ON app_state
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 9. RPC: Admin stats function
-- =====================================================================
CREATE OR REPLACE FUNCTION admin_get_stats()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: admin only';
  END IF;

  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM profiles WHERE role = 'user'),
    'active_users', (SELECT count(*) FROM profiles WHERE role = 'user' AND status = 'active'),
    'blocked_users', (SELECT count(*) FROM profiles WHERE role = 'user' AND status = 'blocked'),
    'signups_today', (SELECT count(*) FROM profiles WHERE role = 'user' AND created_at::date = CURRENT_DATE),
    'signups_week', (SELECT count(*) FROM profiles WHERE role = 'user' AND created_at >= CURRENT_DATE - INTERVAL '7 days'),
    'signups_month', (SELECT count(*) FROM profiles WHERE role = 'user' AND created_at >= CURRENT_DATE - INTERVAL '30 days'),
    'total_data_entries', (SELECT count(*) FROM app_state)
  ) INTO result;

  RETURN result;
END;
$$;
-- 10. Activity history — permanent records of daily scores
-- =====================================================================
CREATE TABLE IF NOT EXISTS activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER NOT NULL DEFAULT 0,
  details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day)
);

ALTER TABLE activity_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own history" ON activity_history;
CREATE POLICY "Users read own history" ON activity_history
  FOR SELECT USING (auth.uid() = user_id);

-- 11. RPC: Reset daily data & save summary
-- =====================================================================
-- This function calculates the productivity score for a specific date,
-- saves it to history, and then clears the old app_state for that day.
CREATE OR REPLACE FUNCTION calculate_daily_score(target_date TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid UUID := auth.uid();
  priorities_done INTEGER := 0;
  todos_done INTEGER := 0;
  total_todos INTEGER := 0;
  water_glasses INTEGER := 0;
  pomodoro_count INTEGER := 0;
  final_score INTEGER := 0;
  state_record RECORD;
  val JSONB;
BEGIN
  IF uid IS NULL THEN RETURN 0; END IF;

  -- 1. Scan app_state for this user and date to calculate score
  FOR state_record IN 
    SELECT key, value FROM app_state 
    WHERE user_id = uid AND key LIKE '%' || target_date
  LOOP
    val := state_record.value;
    
    IF state_record.key LIKE '%priorities-completed%' THEN
      SELECT count(*) INTO priorities_done FROM jsonb_array_elements(val) x WHERE x::boolean = true;
    ELSIF state_record.key LIKE '%todos%' THEN
      SELECT count(*) INTO total_todos FROM jsonb_array_elements(val);
      SELECT count(*) INTO todos_done FROM jsonb_array_elements(val) x WHERE (x->>'completed')::boolean = true;
    ELSIF state_record.key LIKE '%water-glasses%' THEN
      water_glasses := val::integer;
    ELSIF state_record.key LIKE '%pomodoro-sessions%' THEN
      pomodoro_count := val::integer;
    END IF;
  END LOOP;

  -- 2. Calculate final score (0-100)
  -- Weights: Priorities (40%), Todos (40%), Water (10%), Pomodoro (10%)
  final_score := (priorities_done * 13) + 
                 (CASE WHEN total_todos > 0 THEN (todos_done::float / total_todos * 40)::int ELSE 20 END) +
                 (LEAST(water_glasses, 8) * 1.25) +
                 (LEAST(pomodoro_count, 4) * 2.5);
  
  final_score := LEAST(GREATEST(final_score, 0), 100);

  -- 3. Save to activity_history (upsert)
  INSERT INTO activity_history (user_id, day, score, details)
  VALUES (
    uid, 
    target_date::date, 
    final_score, 
    jsonb_build_object(
      'priorities', priorities_done,
      'todos', todos_done,
      'water', water_glasses,
      'pomos', pomodoro_count
    )
  )
  ON CONFLICT (user_id, day) DO UPDATE SET 
    score = EXCLUDED.score,
    details = EXCLUDED.details,
    created_at = now();

  -- 4. Delete old data (optional, but keeps DB clean)
  -- We don't delete today's keys, just old ones
  DELETE FROM app_state 
  WHERE user_id = uid 
  AND key LIKE '%flowday_%'
  AND key NOT LIKE '%' || to_char(CURRENT_DATE, 'YYYY-MM-DD');

  RETURN final_score;
END;
$$;
