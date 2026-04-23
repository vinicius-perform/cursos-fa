'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Settings, 
  LogOut, 
  FolderOpen,
  GraduationCap,
  UploadCloud,
  Sparkles
} from 'lucide-react';
import { clearSessionAction } from '@/app/actions';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Experiência do Aluno', href: '/admin/experience', icon: Sparkles },
  { name: 'Módulos e Aulas', href: '/admin/modules', icon: FolderOpen },
  { name: 'Alunos', href: '/admin/students', icon: Users },
  { name: 'Matrículas', href: '/admin/enrollments', icon: GraduationCap },
  { name: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await clearSessionAction();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col w-72 h-screen border-r border-white/5 bg-background relative z-50">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
      
      <div className="h-32 flex items-center px-8">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-[0_0_25px_oklch(0.86_0.22_142_/_0.4)]">
              <div className="h-4 w-4 bg-background rounded-full" />
           </div>
           <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter leading-none">FA ADMIN</span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-primary font-black mt-1">Foundation</span>
           </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1.5 style-scrollbar-hide">
        <div className="px-4 mb-4">
           <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Management</span>
        </div>
        
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 group relative mx-2 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' 
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                <item.icon className={`h-5 w-5 relative z-10 transition-colors ${isActive ? 'text-primary-foreground' : 'group-hover:text-primary'}`} />
                <span className={`text-[11px] font-bold uppercase tracking-widest relative z-10 ${isActive ? 'text-primary-foreground' : ''}`}>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-6 mt-auto">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 mb-6">
           <div className="flex items-center gap-3 mb-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">System Online</span>
           </div>
           <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Versão 1.0.0 • Foundation Base</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full h-12 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all font-bold text-[10px] tracking-widest uppercase"
        >
          <LogOut className="h-4 w-4" />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </div>
  );
}
