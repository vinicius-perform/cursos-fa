'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total de Alunos', value: '0', icon: Users, color: 'text-primary' },
    { title: 'Cursos Ativos', value: '0', icon: BookOpen, color: 'text-primary' },
    { title: 'Matrículas', value: '0', icon: GraduationCap, color: 'text-primary' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Dashboard Administrativo</h1>
        <p className="text-zinc-500 mt-2">Visão geral da sua plataforma de cursos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-white/5 hover:border-primary/20 transition-all duration-500 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color} transition-all group-hover:scale-110`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <CardContent className="flex flex-col items-center justify-center py-20 text-center relative z-10">
          <LayoutDashboard className="h-12 w-12 text-zinc-600 mb-4 group-hover:text-primary transition-colors" />
          <h3 className="text-xl font-medium text-white">Bem-vindo à Fundação Cursos FA</h3>
          <p className="text-zinc-500 max-w-md mt-2">
            Este é o ponto de partida do seu novo projeto. Comece a configurar seus módulos e gerenciar seus alunos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
