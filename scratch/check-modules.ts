import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvejllchojvniqvawhmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZWpsbGNob2p2bmlxdmF3aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTE0NDAsImV4cCI6MjA5MjQ4NzQ0MH0.dBur9sMKjjrjjinPA6qOAhifli7hiSirI0aO9shnZqM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkModules() {
  console.log('Buscando módulos e categorias...')
  
  const { data: modules } = await supabase.from('modules').select('id, title, status, category_id')
  const { data: categories } = await supabase.from('categories').select('id, name')
  const { data: config } = await supabase.from('app_config').select('*').eq('id', 'home').single()

  console.log('MÓDULOS ENCONTRADOS:', JSON.stringify(modules, null, 2))
  console.log('CATEGORIAS ENCONTRADAS:', JSON.stringify(categories, null, 2))
  console.log('CONFIGURAÇÃO DA HOME:', JSON.stringify(config?.data?.sections, null, 2))
}

checkModules()
