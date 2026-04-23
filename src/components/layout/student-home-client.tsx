'use client';

import { Play, Info, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

function ModuleRow({ title, modules }: { title: string, modules: any[] }) {
  if (!modules?.length) return null;
  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center justify-between px-8 md:px-16">
        <h3 className="text-2xl font-heading font-medium tracking-tight text-primary">{title}</h3>
        <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1 font-medium group text-[10px] tracking-[0.2em] uppercase">
          Ver Tudo <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="flex gap-6 px-8 md:px-16 overflow-x-auto pb-10 snap-x style-scrollbar-hide group/row">
        {modules.map((module, i) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="snap-start shrink-0 transition-all duration-500 group-hover/row:opacity-40 group-hover/row:blur-[4px] hover:!opacity-100 hover:!blur-none hover:scale-110 z-10 hover:z-20"
          >
            <Link href={`/app/module/${module.id}/lesson/first`} className="focus:outline-none block group">
              <Card className="w-[220px] h-[330px] overflow-hidden relative border-white/5 bg-zinc-900 hover:border-primary/40 transition-all duration-500 shadow-2xl rounded-xl">
                <img 
                  src={module.cover_image_vertical || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&w=400&q=80'} 
                  alt={module.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                
                <CardContent className="absolute inset-0 p-5 flex flex-col justify-end">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                       <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">
                          <Play className="h-3 w-3 ml-0.5 fill-current" />
                       </div>
                       <span className="text-[10px] text-white font-bold uppercase tracking-widest">Assistir</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
export default function StudentHomeClient({ config, modulesToUse }: { config: any, modulesToUse: any[] }) {
  console.log('--- DEBUG HOME ALUNO ---');
  console.log('Configuração Recebida:', config);
  console.log('Módulos Disponíveis:', modulesToUse);
  console.log('Seções Configuradas:', config?.sections);
  
  const banner = {
    title: config?.banner_title !== undefined ? config.banner_title : 'CURSOS FA',
    subtitle: config?.banner_subtitle !== undefined ? config.banner_subtitle : '',
    buttonText: config?.banner_button_text || 'Assistir Agora',
    imageUrl: config?.banner_image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1920&q=80',
  };

  const sections = config?.sections || [];

  return (
    <div className="bg-background min-h-screen relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full" />
      </div>

      {/* Cinematic Hero */}
      <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            initial={{ scale: 1.05, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            src={banner.imageUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10 px-8 md:px-16 w-full max-w-7xl flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="space-y-8"
          >
            {banner.title && (
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-[1.1] tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {banner.title.split(' ').map((word: string, i: number) => (
                  <span key={i} className={i % 2 === 0 ? "block" : "block text-transparent bg-clip-text bg-gradient-to-b from-primary to-primary/80"}>
                    {word}
                  </span>
                ))}
              </h1>
            )}
            
            {banner.subtitle && (
              <p className="text-base md:text-lg text-zinc-400 drop-shadow-md font-medium leading-relaxed max-w-2xl mx-auto italic opacity-80 backdrop-blur-[1px]">
                 {banner.subtitle}
              </p>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 opacity-30">
           <div className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent animate-pulse" />
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-20 pb-40 space-y-10 -mt-20">
        {sections.map((section: any) => {
           if (!section.active) return null;
           
           // Filtra módulos pela categoria da seção
           const sModules = modulesToUse.filter((m: any) => m.category_id === section.categoryId);

           if (sModules.length === 0) return null;

           return <ModuleRow key={section.id} title={section.label} modules={sModules} />;
        })}
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
