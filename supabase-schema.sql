-- ============================================================
-- TASKFLOW TODO APP — SUPABASE SCHEMA
-- Jalankan file ini di Supabase SQL Editor (satu per satu)
-- ============================================================

-- 1. Buat tabel todos
CREATE TABLE IF NOT EXISTS public.todos (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 150),
  description TEXT        CHECK (char_length(description) <= 600),
  status      TEXT        NOT NULL DEFAULT 'Pending'
                          CHECK (status IN ('Pending', 'Completed', 'Failed')),
  deadline    TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_todos_user_id   ON public.todos (user_id);
CREATE INDEX IF NOT EXISTS idx_todos_status    ON public.todos (status);
CREATE INDEX IF NOT EXISTS idx_todos_deadline  ON public.todos (deadline);

-- 3. Aktifkan Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — user hanya bisa akses data miliknya sendiri
CREATE POLICY "select_own_todos" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_todos" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_todos" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_todos" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Trigger auto-update kolom updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_todos_updated_at
  BEFORE UPDATE ON public.todos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Fungsi server-side auto-fail todos yang melewati deadline
--    Dipanggil dari client setiap fetch, atau bisa dijadwal via pg_cron
CREATE OR REPLACE FUNCTION public.auto_fail_overdue_todos(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.todos
  SET    status = 'Failed'
  WHERE  user_id = p_user_id
    AND  status  = 'Pending'
    AND  deadline < NOW();
END;
$$;

-- 7. (Opsional) Jadwalkan auto-fail global setiap menit via pg_cron
--    Aktifkan extension pg_cron di Supabase terlebih dahulu jika ingin pakai ini
-- SELECT cron.schedule(
--   'auto-fail-todos-cron',
--   '* * * * *',
--   $$ UPDATE public.todos SET status = 'Failed'
--      WHERE status = 'Pending' AND deadline < NOW(); $$
-- );
