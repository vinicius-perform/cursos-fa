'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FolderOpen, Tag, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ModulesPage() {
  const [activeTab, setActiveTab] = useState<'modules' | 'categories'>('modules');
  const [modules, setModules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  
  // States para formulários
  const [newCatName, setNewCatName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    cover_image_vertical: '',
    banner_image_horizontal: ''
  });

  const openCreateModal = () => {
    setEditingModule(null);
    setFormData({ title: '', description: '', category_id: '', cover_image_vertical: '', banner_image_horizontal: '' });
    setShowModal(true);
  };
  
  const loadData = async () => {
    setLoading(true);
    try {
      const { data: catData, error: catError } = await supabase.from('categories').select('*').order('order', { ascending: true });
      const { data: modData, error: modError } = await supabase.from('modules').select('*, categories(name)').order('order', { ascending: true });
      
      if (catError) console.error("Error loading categories:", catError);
      if (modError) console.error("Error loading modules:", modError);

      if (catData) setCategories(catData);
      if (modData) setModules(modData);
    } catch (err) {
      console.error("Unexpected error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) {
      alert("Por favor, insira o nome da categoria.");
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('categories')
        .insert([{ 
          name: newCatName.trim(), 
          order: categories.length 
        }]);

      if (error) {
        console.error("Supabase error creating category:", error);
        alert(`Erro ao criar categoria: ${error.message}`);
      } else {
        setNewCatName('');
        setShowModal(false);
        await loadData();
      }
    } catch (err) {
      console.error("Unexpected error creating category:", err);
      alert("Erro inesperado ao criar categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateModule = async () => {
    if (!formData.title.trim()) {
      alert("Por favor, insira o título do módulo.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('modules')
        .insert([{ 
          title: formData.title.trim(), 
          description: formData.description.trim(),
          category_id: formData.category_id || null,
          cover_image_vertical: formData.cover_image_vertical.trim(),
          banner_image_horizontal: formData.banner_image_horizontal.trim(),
          order: modules.length 
        }]);

      if (error) {
        console.error("Supabase error creating module:", error);
        alert(`Erro ao criar módulo: ${error.message}`);
      } else {
        setFormData({ title: '', description: '', category_id: '', cover_image_vertical: '', banner_image_horizontal: '' });
        setShowModal(false);
        await loadData();
      }
    } catch (err) {
      console.error("Unexpected error creating module:", err);
      alert("Erro inesperado ao criar módulo.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (mod: any) => {
    setEditingModule(mod);
    setFormData({
      title: mod.title,
      description: mod.description || '',
      category_id: mod.category_id || '',
      cover_image_vertical: mod.cover_image_vertical || '',
      banner_image_horizontal: mod.banner_image_horizontal || ''
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'cover_image_vertical' | 'banner_image_horizontal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, [field]: publicUrl }));
    } catch (error: any) {
      alert(`Erro no upload: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id || null,
          cover_image_vertical: formData.cover_image_vertical,
          banner_image_horizontal: formData.banner_image_horizontal
        })
        .eq('id', editingModule.id);

      if (error) {
        alert(`Erro ao atualizar: ${error.message}`);
      } else {
        setShowModal(false);
        setEditingModule(null);
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Deseja excluir este módulo e todas as suas aulas?')) return;
    const { error } = await supabase.from('modules').delete().eq('id', id);
    if (!error) loadData();
  };

  const UploadButton = ({ label, value, onChange }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="space-y-3">
       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">{label}</label>
       <div className="relative group">
          <div className="w-full h-32 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-primary/5">
             {value ? (
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
             ) : (
                <>
                   <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-black transition-all">
                      <Plus className="h-5 w-5" />
                   </div>
                   <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Selecionar Imagem</span>
                </>
             )}
             <input 
                type="file" 
                accept="image/*" 
                onChange={onChange}
                className="absolute inset-0 opacity-0 cursor-pointer" 
             />
          </div>
          {value && (
             <div className="mt-2 flex items-center gap-2">
                <input 
                  type="text" 
                  value={value} 
                  readOnly
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg h-8 px-3 text-[9px] text-zinc-500 outline-none"
                />
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Gestão de Conteúdo</h1>
          <p className="text-zinc-500 mt-2">Organize seus cursos, módulos e categorias.</p>
        </div>
        <div className="flex gap-4">
           {activeTab === 'categories' ? (
             <Button 
               onClick={() => setShowModal(true)}
               variant="premium" className="h-12 px-6 text-xs font-bold uppercase tracking-widest gap-2"
             >
               <Plus className="h-4 w-4" /> Nova Categoria
             </Button>
           ) : (
             <Button 
               onClick={openCreateModal}
               variant="premium" className="h-12 px-6 text-xs font-bold uppercase tracking-widest gap-2"
             >
               <Plus className="h-4 w-4" /> Novo Módulo
             </Button>
           )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
           <Card className="relative z-10 w-full max-w-2xl bg-card border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              <CardHeader className="border-b border-white/5 bg-white/[0.02] shrink-0">
                 <CardTitle className="text-white flex items-center justify-between">
                    <span>{activeTab === 'categories' ? 'Categoria' : (editingModule ? 'Editar Módulo' : 'Novo Módulo')}</span>
                    <Button variant="ghost" size="icon" onClick={() => setShowModal(false)} className="text-zinc-500">×</Button>
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                 {activeTab === 'categories' ? (
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome da Categoria</label>
                          <input 
                            value={newCatName} 
                            onChange={e => setNewCatName(e.target.value)}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-colors outline-none" 
                            placeholder="Ex: Social Media" 
                          />
                       </div>
                       <Button 
                         onClick={handleCreateCategory} 
                         disabled={saving}
                         variant="premium" 
                         className="w-full h-12 font-bold uppercase tracking-widest text-[11px]"
                       >
                         {saving ? 'PROCESSANDO...' : 'SALVAR CATEGORIA'}
                       </Button>
                    </div>
                 ) : (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Título do Módulo</label>
                             <input 
                               value={formData.title} 
                               onChange={e => setFormData({...formData, title: e.target.value})}
                               className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-colors outline-none" 
                               placeholder="Ex: Domine o Instagram" 
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
                             <select 
                               value={formData.category_id} 
                               onChange={e => setFormData({...formData, category_id: e.target.value})}
                               className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-colors outline-none"
                             >
                                <option value="" className="bg-background">Sem Categoria</option>
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id} className="bg-background">{cat.name}</option>
                                ))}
                             </select>
                          </div>
                       </div>

                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Descrição</label>
                          <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-primary/50 transition-colors outline-none resize-none" 
                            placeholder="Descreva o que os alunos aprenderão neste módulo..." 
                          />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <UploadButton 
                            label="Capa Vertical (Netflix Style)" 
                            value={formData.cover_image_vertical} 
                            onChange={(e) => handleFileUpload(e, 'cover_image_vertical')} 
                          />
                          <UploadButton 
                            label="Banner Horizontal" 
                            value={formData.banner_image_horizontal} 
                            onChange={(e) => handleFileUpload(e, 'banner_image_horizontal')} 
                          />
                       </div>

                       <Button 
                         onClick={editingModule ? handleUpdateModule : handleCreateModule} 
                         disabled={saving}
                         variant="premium" 
                         className="w-full h-14 font-bold uppercase tracking-widest text-[11px] mt-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]"
                       >
                         {saving ? 'PROCESSANDO...' : (editingModule ? 'SALVAR ALTERAÇÕES' : 'CRIAR MÓDULO')}
                       </Button>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary-rgb), 0.5); }
      `}} />

      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'modules' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'text-zinc-500 hover:text-white'}`}
        >
          Módulos
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'text-zinc-500 hover:text-white'}`}
        >
          Categorias
        </button>
      </div>

      {activeTab === 'modules' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {modules.length === 0 ? (
            <Card className="col-span-full bg-card border-white/5 p-12 flex flex-col items-center justify-center text-center">
              <FolderOpen className="h-12 w-12 text-zinc-700 mb-4" />
              <p className="text-zinc-500">Nenhum módulo cadastrado.</p>
            </Card>
          ) : (
            modules.map(mod => (
              <div key={mod.id} className="group relative flex flex-col gap-3">
                 <div className="aspect-[2/3] w-full bg-zinc-900 rounded-xl border border-white/5 overflow-hidden relative shadow-lg group-hover:border-primary/30 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)] group-hover:-translate-y-1">
                    <img 
                      src={mod.cover_image_vertical || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80'} 
                      alt={mod.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                    
                    {/* Botões Suspensos */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                       <Button 
                         onClick={() => handleEditClick(mod)}
                         variant="glass" size="icon" className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-white/10 hover:bg-primary hover:text-black hover:border-primary transition-all"
                       >
                          <Edit2 className="h-4 w-4" />
                       </Button>
                       <Button 
                         onClick={() => handleDeleteModule(mod.id)}
                         variant="glass" size="icon" className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-white/10 hover:bg-destructive hover:text-white hover:border-destructive transition-all"
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>

                    {/* Badge e Título internos removidos para focar na arte da capa */}
                 </div>

                 <Button 
                    onClick={() => window.location.href = `/admin/modules/${mod.id}`}
                    className="w-full h-10 bg-white/5 border border-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all"
                 >
                    Gerenciar Aulas
                 </Button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {categories.length === 0 ? (
             <Card className="bg-card border-white/5 p-12 flex flex-col items-center justify-center text-center">
                <Tag className="h-12 w-12 text-zinc-700 mb-4" />
                <p className="text-zinc-500">Nenhuma categoria cadastrada.</p>
             </Card>
          ) : (
            categories.map(cat => (
              <Card key={cat.id} className="bg-card border-white/5 p-6 flex items-center justify-between group hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                   <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                      <Tag className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white">{cat.name}</h3>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Ordem: {cat.order}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white"><Edit2 className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
