'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Users, CheckCircle2, XCircle, Clock, Trash2, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar alunos: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ approval_status: status })
        .eq('id', id);

      if (error) throw error;
      toast.success(status === 'approved' ? 'Aluno aprovado!' : 'Status atualizado.');
      fetchStudents();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  }

  async function deleteStudent(id: string) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      toast.success('Aluno removido.');
      fetchStudents();
    } catch (error: any) {
      toast.error('Erro ao remover: ' + error.message);
    }
  }

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: students.length,
    pending: students.filter(s => s.approval_status === 'pending').length,
    active: students.filter(s => s.approval_status === 'approved').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Gestão de Alunos</h1>
          <p className="text-zinc-500 mt-2">Gerencie acessos e monitore seus alunos.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar por nome ou email..." 
            className="pl-10 bg-zinc-900/50 border-white/5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Alunos', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Aguardando Aprovação', value: stats.pending, icon: Clock, color: 'text-amber-500' },
          { label: 'Alunos Ativos', value: stats.active, icon: CheckCircle2, color: 'text-primary' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-zinc-900/40 border-white/5 p-6 backdrop-blur-sm">
             <div className="flex items-center justify-between mb-4">
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</p>
               <stat.icon className={`h-4 w-4 ${stat.color}`} />
             </div>
             <p className="text-3xl font-bold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900/40 border-white/5 overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aluno</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cadastro</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{student.name}</span>
                        <span className="text-xs text-zinc-500">{student.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {student.approval_status === 'approved' ? (
                        <Badge className="bg-primary/10 text-primary border-primary/20">Ativo</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pendente</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-500">
                        {new Date(student.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {student.approval_status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 border-primary/20 text-primary hover:bg-primary hover:text-white"
                            onClick={() => updateStatus(student.id, 'approved')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Aprovar
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-zinc-500 hover:text-red-500 transition-colors"
                          onClick={() => deleteStudent(student.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center">
            <Users className="h-12 w-12 text-zinc-800 mb-4" />
            <p className="text-zinc-500">Nenhum aluno encontrado.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
