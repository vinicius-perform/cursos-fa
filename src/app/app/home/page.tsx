import StudentHomeClient from '@/components/layout/student-home-client';
import { createClient } from '@/lib/supabase-server';

export default async function StudentHomePage() {
  const supabase = createClient();

  // Busca configurações dinâmicas da home
  const { data: configRow } = await supabase
    .from('app_config')
    .select('data')
    .eq('id', 'home')
    .single();

  // Busca todos os módulos (teste de visibilidade)
  const { data: modules } = await supabase
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true });

  return (
    <StudentHomeClient 
      config={configRow?.data || {}} 
      modulesToUse={modules || []} 
    />
  );
}
