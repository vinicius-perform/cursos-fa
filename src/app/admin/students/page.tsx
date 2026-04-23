import { Card } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Gestão de Alunos</h1>
        <p className="text-zinc-500 mt-2">Acompanhe seus alunos e gerencie aprovações.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total de Alunos', value: '0' },
          { label: 'Aguardando Aprovação', value: '0' },
          { label: 'Alunos Ativos', value: '0' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border-white/5 p-6">
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{stat.label}</p>
             <p className="text-3xl font-bold text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-white/5 p-20 flex flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-zinc-700 mb-4" />
        <p className="text-zinc-500">Nenhum aluno cadastrado no momento.</p>
      </Card>
    </div>
  );
}
