'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Palette, 
  ShieldCheck, 
  Save, 
  Smartphone,
  Mail,
  Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'security'>('general');
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<any>({
    siteName: 'Cursos FA',
    supportEmail: 'suporte@cursosfa.com.br',
    primaryColor: '#ADF75A',
    enableNotifications: true,
  });

  useEffect(() => {
    async function loadConfig() {
      const { data } = await supabase.from('app_config').select('*').eq('id', 'settings').single();
      if (data && data.data) {
        setConfig(data.data);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('app_config').upsert({
      id: 'settings',
      data: config
    });
    setSaving(false);
    if (!error) alert('Configurações salvas com sucesso!');
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: Globe },
    { id: 'branding', label: 'Identidade Visual', icon: Palette },
    { id: 'security', label: 'Segurança', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight uppercase">Configurações</h1>
          <p className="text-zinc-500 mt-1">Gerencie as preferências globais da sua plataforma.</p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          variant="premium" 
          className="h-12 px-6 text-xs font-bold uppercase tracking-widest gap-2"
        >
          <Save className="h-4 w-4" /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
        </Button>
      </div>

      <div className="flex gap-2 p-1 bg-white/5 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'text-zinc-500 hover:text-white'}`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-card border-white/5">
              <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Informações da Plataforma
                </CardTitle>
                <CardDescription className="text-zinc-500">Dados básicos de identificação.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Nome da Plataforma</Label>
                  <Input 
                    value={config.siteName} 
                    onChange={e => setConfig({...config, siteName: e.target.value})}
                    className="bg-white/[0.03] border-white/10 h-12" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">E-mail de Suporte</Label>
                  <Input 
                    value={config.supportEmail} 
                    onChange={e => setConfig({...config, supportEmail: e.target.value})}
                    className="bg-white/[0.03] border-white/10 h-12" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-white/5">
              <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Comunicação
                </CardTitle>
                <CardDescription className="text-zinc-500">Notificações e avisos automáticos.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">Notificações por E-mail</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Enviar avisos de novas matrículas</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={config.enableNotifications}
                    onChange={e => setConfig({...config, enableNotifications: e.target.checked})}
                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 transition-all"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'branding' && (
          <Card className="bg-card border-white/5">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalização Visual
              </CardTitle>
              <CardDescription className="text-zinc-500">Ajuste as cores e logos da sua marca.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">Cor Primária (Hex)</Label>
                    <div className="flex gap-4">
                      <Input 
                        value={config.primaryColor} 
                        onChange={e => setConfig({...config, primaryColor: e.target.value})}
                        className="bg-white/[0.03] border-white/10 h-12 flex-1" 
                      />
                      <div 
                        className="h-12 w-12 rounded-xl border border-white/10 shadow-lg"
                        style={{ backgroundColor: config.primaryColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                      <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-2">Dica de Designer</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">Utilize cores vibrantes para o tema Dark. Tons de Neon como o atual verde fluo garantem o melhor contraste e legibilidade na interface.</p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'security' && (
          <Card className="bg-card border-white/5">
            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
              <CardTitle className="text-white text-lg font-medium flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Segurança & Acesso
              </CardTitle>
              <CardDescription className="text-zinc-500">Configurações críticas de autenticação.</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
               <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="h-16 w-16 text-zinc-800 mb-4" />
                  <h3 className="text-white font-medium mb-2">Protocolos de Segurança Ativos</h3>
                  <p className="text-zinc-500 text-sm max-w-md">Sua plataforma utiliza Row Level Security (RLS) via Supabase, garantindo que cada usuário acesse apenas o conteúdo permitido.</p>
               </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

