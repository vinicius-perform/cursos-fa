'use client';

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Play, 
  Trash2, 
  ArrowLeft, 
  GripVertical, 
  Video, 
  Clock,
  Sparkles,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LessonsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: moduleId } = use(params);
  const router = useRouter();
  
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // States for new lesson
  const [newTitle, setNewTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: modData } = await supabase.from('modules').select('*').eq('id', moduleId).single();
      const { data: lessonData } = await supabase.from('lessons').select('*').eq('module_id', moduleId).order('order', { ascending: true });
      
      if (modData) setModule(modData);
      if (lessonData) setLessons(lessonData);
    } catch (err) {
      console.error("Error loading lesson data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const handleCreateLesson = async () => {
    if (!newTitle.trim()) {
      alert("O título da aula é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .insert([{ 
          module_id: moduleId,
          title: newTitle.trim(),
          description: newDescription.trim(),
          video_url: newVideoUrl.trim(),
          order: lessons.length
        }]);

      if (error) {
        console.error("Error creating lesson:", error);
        alert(`Erro ao criar aula: ${error.message}`);
      } else {
        setNewTitle('');
        setNewVideoUrl('');
        setNewDescription('');
        setShowModal(false);
        await loadData();
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Deseja excluir esta aula permanentemente?')) return;
    
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (!error) await loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Carregando conteúdo do módulo...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => router.push('/admin/modules')}
            variant="ghost" 
            size="icon" 
            className="h-10 w-10 rounded-full border border-white/5 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles className="h-3 w-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Módulo: {module?.title}</span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">Gestão de Aulas</h1>
          </div>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          variant="premium" 
          className="h-12 px-6 text-xs font-bold uppercase tracking-widest gap-2"
        >
          <Plus className="h-4 w-4" /> Nova Aula
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {lessons.length === 0 ? (
          <Card className="bg-card border-white/5 p-20 flex flex-col items-center justify-center text-center">
            <Video className="h-12 w-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium">Nenhuma aula cadastrada para este módulo.</p>
            <Button 
              onClick={() => setShowModal(true)}
              variant="outline" 
              className="mt-6 border-primary/20 text-primary"
            >
              Começar a Adicionar
            </Button>
          </Card>
        ) : (
          lessons.map((lesson, index) => (
            <Card key={lesson.id} className="bg-card border-white/5 group hover:border-primary/20 transition-all overflow-hidden">
              <CardContent className="p-0 flex items-center">
                 <div className="w-12 h-20 flex items-center justify-center border-r border-white/5 text-zinc-700 group-hover:text-primary transition-colors">
                    <span className="text-lg font-black">{String(index + 1).padStart(2, '0')}</span>
                 </div>
                 <div className="flex-1 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
                          <Play className="h-5 w-5 text-primary fill-primary/20" />
                       </div>
                       <div>
                          <h3 className="text-white font-bold tracking-wide">{lesson.title}</h3>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Video className="h-3 w-3" /> {lesson.video_url ? 'Vídeo Configurado' : 'Sem vídeo'}
                             </span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white"><Plus className="h-4 w-4" /></Button>
                       <Button 
                         onClick={() => handleDeleteLesson(lesson.id)}
                         variant="ghost" 
                         size="icon" 
                         className="text-zinc-500 hover:text-destructive hover:bg-destructive/10"
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <Card className="relative z-10 w-full max-w-xl bg-card border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-primary" />
                Nova Aula para o Módulo
              </CardTitle>
              <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest">Preencha os detalhes técnicos da aula.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Título da Aula</Label>
                  <Input 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)}
                    className="bg-white/5 border-white/10 h-12" 
                    placeholder="Ex: Aula 01 - Introdução ao Método" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">ID do Vídeo (YouTube/Vimeo)</Label>
                  <Input 
                    value={newVideoUrl} 
                    onChange={e => setNewVideoUrl(e.target.value)}
                    className="bg-white/5 border-white/10 h-12" 
                    placeholder="Ex: dQw4w9WgXcQ" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Descrição curta</Label>
                  <Input 
                    value={newDescription} 
                    onChange={e => setNewDescription(e.target.value)}
                    className="bg-white/5 border-white/10 h-12" 
                    placeholder="O que será abordado nesta aula?" 
                  />
                </div>
                <Button 
                  onClick={handleCreateLesson} 
                  disabled={saving}
                  variant="premium" 
                  className="w-full h-14 font-bold uppercase tracking-widest text-[11px] mt-4"
                >
                  {saving ? 'PROCESSANDO...' : 'PUBLICAR AULA'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
