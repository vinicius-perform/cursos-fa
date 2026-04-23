'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Plus, Search, GraduationCap, Trash2, UserPlus, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // States for new enrollment
  const [users, setUsers] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    
    // Fetch enrollments with related data
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        user_id,
        module_id,
        users (name, email),
        modules (title)
      `);
    
    if (data) setEnrollments(data);
    
    // Fetch users and modules for the modal
    const { data: userData } = await supabase.from('users').select('id, name, email').eq('approval_status', 'approved');
    const { data: moduleData } = await supabase.from('modules').select('id, title');
    
    if (userData) setUsers(userData);
    if (moduleData) setModules(moduleData);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEnrollment = async () => {
    if (!selectedUser || !selectedModule) return;
    
    const { error } = await supabase.from('enrollments').insert([
      { user_id: selectedUser, module_id: selectedModule }
    ]);
    
    if (!error) {
      setSelectedUser('');
      setSelectedModule('');
      setShowModal(false);
      loadData();
    } else {
      alert(error.message.includes('unique') ? 'Este aluno já está matriculado neste módulo.' : 'Erro ao criar matrícula.');
    }
  };

  const handleDeleteEnrollment = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta matrícula?')) return;
    
    const { error } = await supabase.from('enrollments').delete().eq('id', id);
    if (!error) {
      loadData();
    }
  };

  const filteredEnrollments = enrollments.filter(e => 
    e.users?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.modules?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">Gestão de Matrículas</h1>
          <p className="text-zinc-500 mt-1">Controle o acesso dos alunos aos seus conteúdos.</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          variant="premium" 
          className="h-12 px-6 text-xs font-bold uppercase tracking-widest gap-2"
        >
          <UserPlus className="h-4 w-4" /> Nova Matrícula
        </Button>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/[0.02] flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Matrículas Ativas
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Buscar aluno ou curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/[0.01]">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4">Aluno</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4">Módulo / Curso</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4">Status</TableHead>
                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest py-4 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-zinc-500">Carregando matrículas...</TableCell>
                </TableRow>
              ) : filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-20 text-zinc-500">Nenhuma matrícula encontrada.</TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{enrollment.users?.name}</span>
                        <span className="text-xs text-zinc-500">{enrollment.users?.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center border border-primary/20">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-zinc-300">{enrollment.modules?.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="admin" className="text-[9px] uppercase tracking-widest">Ativo</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
                        className="text-zinc-500 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <Card className="relative z-10 w-full max-w-lg bg-card border-white/5 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Nova Matrícula
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selecionar Aluno</label>
                  <select 
                    value={selectedUser} 
                    onChange={e => setSelectedUser(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-colors outline-none appearance-none"
                  >
                    <option value="" className="bg-background">Selecione um aluno...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id} className="bg-background">{user.name} ({user.email})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Selecionar Módulo / Curso</label>
                  <select 
                    value={selectedModule} 
                    onChange={e => setSelectedModule(e.target.value)}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:border-primary/50 transition-colors outline-none appearance-none"
                  >
                    <option value="" className="bg-background">Selecione um módulo...</option>
                    {modules.map(mod => (
                      <option key={mod.id} value={mod.id} className="bg-background">{mod.title}</option>
                    ))}
                  </select>
                </div>
                <Button 
                  onClick={handleCreateEnrollment} 
                  variant="premium" 
                  className="w-full h-12 font-bold uppercase tracking-widest text-[11px] mt-4"
                >
                  EFETIVAR MATRÍCULA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

