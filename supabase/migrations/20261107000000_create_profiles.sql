-- ==============================================================================
-- Migração Inicial da Tabela profiles — Feature 001: Authentication & User Profiles
-- Data: 07/11/2026
-- Hardening: SEC-001, SEC-002, SEC-003 incorporados
-- ==============================================================================

-- 1. Criação da Tabela public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT NULL,
  bio TEXT NULL,
  is_profile_public BOOLEAN NOT NULL DEFAULT false,
  is_library_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Restrições de Integridade e Validação de Formato
ALTER TABLE public.profiles
  ADD CONSTRAINT chk_profiles_username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 20),
  ADD CONSTRAINT chk_profiles_username_chars CHECK (username ~ '^[a-zA-Z0-9_-]+$'),
  ADD CONSTRAINT chk_profiles_display_name_length CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50),
  ADD CONSTRAINT chk_profiles_bio_length CHECK (bio IS NULL OR char_length(bio) <= 300);

-- 3. Índice Único Case-Insensitive para Username (SEC-002)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(username));

-- 4. Função e Trigger para Atualização Automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Função e Trigger de Imutabilidade do Username (SEC-003)
-- Impede que qualquer usuário altere o username pós-cadastro, mesmo via SDK do cliente
CREATE OR REPLACE FUNCTION public.protect_username_immutability()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.username <> OLD.username THEN
    RAISE EXCEPTION 'O nome de usuário não pode ser alterado após o cadastro.' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_username_immutability() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.protect_username_immutability() TO postgres, authenticated;

DROP TRIGGER IF EXISTS on_profiles_username_update ON public.profiles;
CREATE TRIGGER on_profiles_username_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_username_immutability();

-- 6. Função e Trigger de Inicialização Atômica de Perfil (SEC-001)
-- Executa com SECURITY DEFINER e search_path fixado para evitar hijacking
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
DECLARE
  v_raw_username TEXT;
  v_final_username TEXT;
  v_raw_display_name TEXT;
BEGIN
  -- Extrair metadados passados no signUp
  v_raw_username := NEW.raw_user_meta_data->>'username';
  v_raw_display_name := NEW.raw_user_meta_data->>'display_name';

  -- Fallback seguro se não fornecido
  IF v_raw_username IS NULL OR char_length(trim(v_raw_username)) < 3 THEN
    v_final_username := 'user_' || substr(NEW.id::text, 1, 8);
  ELSE
    v_final_username := lower(trim(v_raw_username));
  END IF;

  IF v_raw_display_name IS NULL OR char_length(trim(v_raw_display_name)) < 2 THEN
    v_raw_display_name := v_final_username;
  END IF;

  -- Inserção atômica na tabela profiles (Privacidade Privada por Padrão)
  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio,
    is_profile_public,
    is_library_public,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    v_final_username,
    v_raw_display_name,
    NULL,
    NULL,
    false, -- Padrão estrito: PRIVADO
    false, -- Padrão estrito: PRIVADO
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  RETURN NEW;
END;
$$;

-- Restrição estrita de privilégios de execução (SEC-001)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Políticas de Segurança — Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Leitura: Proprietário vê tudo; terceiros veem apenas se is_profile_public = true
DROP POLICY IF EXISTS "Perfis visíveis pelo próprio dono ou se públicos" ON public.profiles;
CREATE POLICY "Perfis visíveis pelo próprio dono ou se públicos"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR
    is_profile_public = true
  );

-- Inserção: Restrita ao próprio usuário ou via trigger do sistema
DROP POLICY IF EXISTS "Usuários só inserem seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários só inserem seu próprio perfil"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Atualização: Usuário só atualiza seu próprio perfil (protegido pelo trigger de imutabilidade)
DROP POLICY IF EXISTS "Usuários só atualizam seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários só atualizam seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Exclusão: Usuário só exclui seu próprio perfil
DROP POLICY IF EXISTS "Usuários só excluem seu próprio perfil" ON public.profiles;
CREATE POLICY "Usuários só excluem seu próprio perfil"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = id);

