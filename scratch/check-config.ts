import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvejllchojvniqvawhmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZWpsbGNob2p2bmlxdmF3aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTE0NDAsImV4cCI6MjA5MjQ4NzQ0MH0.dBur9sMKjjrjjinPA6qOAhifli7hiSirI0aO9shnZqM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkConfig() {
  const { data, error } = await supabase
    .from('app_config')
    .select('*')

  if (error) {
    console.error('Erro ao buscar config:', error.message)
  } else {
    console.log('Todas as configurações encontradas:', JSON.stringify(data, null, 2))
  }
}

checkConfig()
