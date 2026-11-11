-- ============================================================================
-- Migração: Saved Profiles (Perfis Salvos / Favoritos de Usuários)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.saved_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  saved_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Impede salvar o mesmo perfil duas vezes
  CONSTRAINT uq_saved_profiles UNIQUE (user_id, saved_profile_id),
  -- Impede salvar o próprio perfil
  CONSTRAINT chk_not_self_save CHECK (user_id <> saved_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_profiles_user ON public.saved_profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_profiles_saved ON public.saved_profiles (saved_profile_id);

ALTER TABLE public.saved_profiles ENABLE ROW LEVEL SECURITY;

-- O usuário só visualiza os perfis que ele próprio salvou
CREATE POLICY "Usuários podem visualizar seus próprios perfis salvos"
  ON public.saved_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- O usuário só pode salvar perfis com seu próprio user_id
CREATE POLICY "Usuários podem salvar perfis"
  ON public.saved_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- O usuário só pode remover itens que ele próprio salvou
CREATE POLICY "Usuários podem remover perfis salvos"
  ON public.saved_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

