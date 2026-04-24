import StudentHomeClient from '@/components/layout/student-home-client';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function StudentHomePage() {
  const supabase = createClient();
  const now = new Date().toISOString();

  console.log(`[${now}] INICIANDO BUSCA DE DADOS NA HOME`);
  
  // Teste simples de contagem
  const { count: totalModules } = await supabase.from('modules').select('*', { count: 'exact', head: true });
  console.log('CONTAGEM DIRETA DE MÓDULOS:', totalModules);

  // Busca configuração da Home
  const { data: configRow } = await supabase
    .from('app_config')
    .select('data')
    .eq('id', 'home')
    .single();

  // Busca módulos publicados (com a coluna de ordem correta)
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('order', { ascending: true });

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
