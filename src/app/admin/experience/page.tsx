'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, GripVertical, Save, Image as ImageIcon, ToggleLeft, ToggleRight, Play, Info, GraduationCap, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { supabase } from '@/lib/supabase';

const initialSections = [
  { id: 'continue_watching', label: 'Continue assistindo', active: true, type: 'system' },
  { id: 'highlight_modules', label: 'Módulos em Destaque', active: true, type: 'system' },
  { id: 'recent_lessons', label: 'Aulas Recentes', active: true, type: 'system' },
  { id: 'premium_content', label: 'Conteúdos Premium', active: true, type: 'system' },
];

function SortableSectionItem({ id, section, toggleSection, removeSection }: { id: string, section: any, toggleSection: (id: string) => void, removeSection?: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl mb-3 group hover:border-primary/20 transition-colors relative z-10">
      <div className="flex items-center gap-4">
        <button {...attributes} {...listeners} className="text-zinc-500 hover:text-primary cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex flex-col">
           <span className="text-white font-medium">{section.label}</span>
           {section.type === 'category' && (
             <span className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">Seção de Categoria</span>
           )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          type="button" 
          onClick={() => toggleSection(section.id)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${section.active ? 'bg-primary/20 text-primary' : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'}`}
        >
          {section.active ? (
            <><ToggleRight className="h-4 w-4" /> Ativo</>
          ) : (
            <><ToggleLeft className="h-4 w-4" /> Oculto</>
          )}
        </button>
        {section.type === 'category' && removeSection && (
          <button onClick={() => removeSection(section.id)} className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-destructive hover:bg-destructive/10 transition-colors">
             <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminExperiencePage() {
  const [sections, setSections] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [bannerTitle, setBannerTitle] = useState('CURSOS FA');
  const [bannerSubtitle, setBannerSubtitle] = useState('Acesso premium às técnicas mais avançadas da nossa plataforma.');
  const [bannerButton, setBannerButton] = useState('Assistir Agora');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80');

  const [mockModules, setMockModules] = useState<any[]>([
    { id: '1', title: 'Módulo 1', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
    { id: '2', title: 'Módulo 2', image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
  ]);

  const [isDragging, setIsDragging] = useState(false);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      // Carrega categorias reais
      const { data: cats } = await supabase.from('categories').select('*').order('order', { ascending: true });
      
      const { data: config } = await supabase.from('app_config').select('*').eq('id', 'home').single();
      
      let finalSections: any[] = [];

      if (config && config.data && config.data.sections) {
        // Usa as seções salvas, mas garante que apenas categorias existentes permaneçam
        const savedSections = config.data.sections.filter((s: any) => s.type === 'category');
        
        // Sincroniza com novas categorias que possam ter sido criadas
        if (cats) {
          cats.forEach(cat => {
            if (!savedSections.find((s: any) => s.categoryId === cat.id)) {
              savedSections.push({
                id: `cat_${cat.id}`,
                label: cat.name,
                active: false,
                type: 'category',
                categoryId: cat.id
              });
            }
          });
          
          // Remove seções de categorias que foram deletadas
          finalSections = savedSections.filter((s: any) => cats.find(c => c.id === s.categoryId));
        }
      } else if (cats) {
        // Se não houver config, cria baseado em todas as categorias (inativas por padrão)
        finalSections = cats.map(cat => ({
          id: `cat_${cat.id}`,
          label: cat.name,
          active: false,
          type: 'category',
          categoryId: cat.id
        }));
      }

      setSections(finalSections);
      if (cats) setAllCategories(cats);

      if (config && config.data) {
        const d = config.data;
        setBannerTitle(d.banner_title || '');
        setBannerSubtitle(d.banner_subtitle || '');
        setBannerButton(d.banner_button_text || '');
        setBannerImage(d.banner_image_url || '');
      }

      const { data: mods } = await supabase.from('modules').select('*').order('order', { ascending: true });
      if (mods && mods.length > 0) {
        setMockModules(mods);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const addCategorySection = (catId: string) => {
    // Agora não precisamos mais desta função pois todas as categorias já são carregadas
    // Mas mantemos o toggle individual
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const uploadFile = async (file: File) => {
    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Math.random()}.${fileExt}`;
      const filePath = `branding/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setBannerImage(publicUrl);
    } catch (error: any) {
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase.from('app_config').upsert({
      id: 'home',
      data: {
        banner_title: bannerTitle,
        banner_subtitle: bannerSubtitle,
        banner_button_text: bannerButton,
        banner_image_url: bannerImage,
        sections: sections,
      }
    });

    setSaving(false);
    if (!error) {
      alert('Configurações salvas com sucesso!');
    } else {
      alert('Erro ao salvar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Branding & Interface</span>
          </div>
          <h2 className="text-4xl font-heading font-bold tracking-tight text-white uppercase">Experiência do Aluno</h2>
          <p className="text-zinc-500 text-sm mt-1">Personalização estética e curadoria da identidade visual Home.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} variant="premium" className="h-10 text-[10px] font-bold tracking-widest uppercase px-6">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'PROCESSANDO...' : 'PUBLICAR NA HOME'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-card border-white/5 backdrop-blur-2xl overflow-hidden group">
          <CardHeader className="border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-white font-heading font-medium">Arquitetura do Hero Banner</CardTitle>
            <CardDescription className="text-zinc-500 text-xs">O impacto visual prioritário da plataforma Premium.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[21/9] w-full bg-zinc-900/50 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-500 relative overflow-hidden group/upload shadow-inner ${isDragging ? 'border-primary bg-primary/10 scale-[1.01]' : 'border-white/5 hover:border-primary/30'}`}
            >
              <img src={bannerImage} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover/upload:opacity-10 transition-opacity duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="h-14 w-14 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover/upload:border-primary/30 transition-all z-20">
                 <ImageIcon className={`h-6 w-6 transition-transform duration-500 group-hover/upload:scale-110 ${isDragging ? 'text-primary scale-125' : 'text-zinc-500'}`} />
              </div>
              <div className="text-center relative z-20 px-6">
                <p className="text-[10px] font-bold text-white uppercase tracking-widest mb-1 shadow-sm">
                  {isDragging ? 'SOLTE PARA IMPORTAR' : 'UPLOAD DE IMAGEM ESTRATÉGICA'}
                </p>
                <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest">Recomendado: 1920x800px</p>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Título de Impacto</Label>
                    <Input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} className="bg-white/[0.03] border-white/10 text-sm h-12 uppercase tracking-wide font-medium" />
                 </div>
                 <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Texto do CTA</Label>
                    <Input value={bannerButton} onChange={e => setBannerButton(e.target.value)} className="bg-white/[0.03] border-white/10 text-sm h-12 uppercase tracking-wide font-medium" />
                 </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Narrativa do Banner (Subtítulo)</Label>
                <Input value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} className="bg-white/[0.03] border-white/10 text-sm h-12 font-medium" />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Endereço da Imagem (Opcional)</Label>
                <Input value={bannerImage} onChange={e => setBannerImage(e.target.value)} className="bg-white/[0.03] border-white/10 text-xs h-10 font-medium" placeholder="https://..." />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="bg-card border-white/5 backdrop-blur-2xl overflow-hidden shadow-2xl">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-white font-heading font-medium">Organização Modular da Home</CardTitle>
              <CardDescription className="text-zinc-500 text-xs">Arraste para definir a hierarquia das seções pedagógicas.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-8">
                 <h4 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Hierarquia de Categorias</h4>
                 <p className="text-zinc-600 text-xs mb-6">Defina quais categorias aparecerão na home e em qual ordem. Módulos sem categoria não serão exibidos se nenhuma seção for configurada.</p>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                  {sections.map((section) => (
                    <SortableSectionItem 
                      key={section.id} 
                      id={section.id} 
                      section={section} 
                      toggleSection={toggleSection} 
                    />
                  ))}
                </SortableContext>
              </DndContext>
              <div className="mt-8 p-6 bg-primary/[0.03] border border-primary/10 rounded-2xl flex items-start gap-4">
                 <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 shrink-0 mt-1">
                    <Info className="h-4 w-4 text-primary" />
                 </div>
                 <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">As categorias marcadas como "Ativas" aparecerão como fileiras de módulos na Home do aluno. Arraste os itens para mudar a ordem visual das fileiras.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16 space-y-8">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 shadow-inner">
              <Play className="h-5 w-5 text-primary fill-primary/20" />
           </div>
           <div>
              <h3 className="text-2xl font-heading font-bold text-white uppercase tracking-tight">Cenário de Visualização (Preview)</h3>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Simulação em ambiente real de produção</p>
           </div>
        </div>
        
        <div className="w-full border border-white/10 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-background ring-1 ring-white/10 relative h-[800px] overflow-y-auto style-scrollbar-hide group/preview">
          <div className="absolute top-0 w-full h-24 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-50 px-12 flex items-center pointer-events-none border-b border-white/[0.02]">
             <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 mr-4">
                <GraduationCap className="h-6 w-6 text-primary" />
             </div>
             <div className="font-heading font-bold text-white tracking-widest text-2xl">CURSOS FA <span className="text-primary">ELITE</span></div>
          </div>
          
          <div className="relative w-full h-[550px] flex items-end pb-24 group/hero">
            <img 
              src={bannerImage}
              alt="Banner Preview"
              className="absolute inset-0 w-full h-full object-cover group-hover/preview:scale-[1.02] transition-transform duration-[3000ms]"
            />
            {/* Overlays removidos para total nitidez */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-background to-transparent pointer-events-none" />
            
            <div className="relative z-10 px-8 md:px-16 w-full flex flex-col items-center text-center">
              <div className="space-y-10">
                <div className="flex flex-col items-center gap-4">
                  {/* Badge e linha removidos */}
                </div>
                
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {bannerTitle.split(' ').map((word: string, i: number) => (
                    <span key={i} className={i % 2 === 0 ? "block" : "block text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/60 opacity-90"}>
                      {word}
                    </span>
                  ))}
                </h1>
                
                <p className="text-base md:text-lg text-zinc-400 drop-shadow-md font-medium leading-relaxed max-w-2xl mx-auto italic opacity-80 backdrop-blur-[1px]">
                  {bannerSubtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-20 pb-24 space-y-10 -mt-24">
             {sections.map(section => {
                if (!section.active) return null;
                
                const sectionModules = mockModules.filter(m => m.category_id === section.categoryId);
                if (sectionModules.length === 0) return null;

                return (
                  <div key={section.id} className="space-y-6 pt-12">
                    <div className="flex items-center justify-between px-8 md:px-16">
                      <h3 className="text-2xl font-heading font-medium tracking-tight text-primary">{section.label}</h3>
                    </div>
                    <div className="flex gap-6 px-8 md:px-16 overflow-x-auto pb-10 snap-x style-scrollbar-hide group/row">
                      {sectionModules.map((module: any) => (
                        <div key={module.id} className="snap-start shrink-0 transition-all duration-500 group-hover/row:opacity-40 group-hover/row:blur-[4px] hover:!opacity-100 hover:!blur-none hover:scale-110 z-10 hover:z-20">
                          <div className="w-[200px] h-[300px] overflow-hidden group/card relative border-white/5 bg-zinc-900 shadow-2xl rounded-2xl">
                            <img 
                              src={module.cover_image_vertical || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'} 
                              alt={module.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                            {/* Título e Badge removidos para não poluir a capa */}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
             })}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .style-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .style-scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
