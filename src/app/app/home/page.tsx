import StudentHomeClient from '@/components/layout/student-home-client';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function StudentHomePage() {
  const supabase = createClient();

  // Busca configurações dinâmicas da home
  const { data: configRow } = await supabase
    .from('app_config')
    .select('data')
    .eq('id', 'home')
    .single();

  // Busca todos os módulos (teste de visibilidade total)
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .order('order_index', { ascending: true });

  if (modulesError) {
    console.error('ERRO AO BUSCAR MÓDULOS:', modulesError);
  }

  console.log('DADOS BRUTOS DO BANCO:', { 
    count: modules?.length, 
    error: modulesError,
    firstModule: modules?.[0]
  });

  return (
    <StudentHomeClient 
      config={configRow?.data || {}} 
      modulesToUse={modules || []} 
    />
  );
}
