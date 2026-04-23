-- users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- courses/modules (depending on how it's used, here it's generic)
CREATE TABLE IF NOT EXISTS public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_vertical TEXT,
  banner_image_horizontal TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  thumbnail TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  UNIQUE(user_id, module_id)
);

-- progress
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  UNIQUE(user_id, lesson_id)
);

-- config (for dynamic UI)
CREATE TABLE IF NOT EXISTS public.app_config (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
