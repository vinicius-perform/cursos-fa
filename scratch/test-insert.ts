import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kvejllchojvniqvawhmo.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2ZWpsbGNob2p2bmlxdmF3aG1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MTE0NDAsImV4cCI6MjA5MjQ4NzQ0MH0.dBur9sMKjjrjjinPA6qOAhifli7hiSirI0aO9shnZqM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testInsert() {
  console.log('Tentando inserir config manual...')
  const { data, error } = await supabase
    .from('app_config')
    .upsert({ 
      id: 'home', 
      data: { 
        banner_title: 'TESTE FORÇADO',
        banner_subtitle: 'Se você ler isso, a gravação manual funcionou.',
        banner_image_url: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=1920&q=80',
        sections: []
      } 
    }, { onConflict: 'id' })

  if (error) {
    console.error('ERRO NA GRAVAÇÃO:', error.message)
    console.error('Detalhes:', error)
  } else {
    console.log('GRAVAÇÃO MANUAL CONCLUÍDA COM SUCESSO!')
  }
}

testInsert()
