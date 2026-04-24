import StudentHomeClient from '@/components/layout/student-home-client';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function StudentHomePage() {
  const supabase = createClient();

  // Busca configuração da Home
  const { data: configRow } = await supabase
    .from('app_config')
    .select('data')
    .eq('id', 'home')
    .single();

  // Busca módulos publicados
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .eq('status', 'published')
    .order('order', { ascending: true });

  return (
    <StudentHomeClient 
      config={configRow?.data || {}} 
      modulesToUse={modules || []} 
    />
  );
}
