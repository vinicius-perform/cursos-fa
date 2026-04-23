'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Mail, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { setSessionAction } from './actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Setup master admin direto no Client-Side (Placeholder para o novo projeto)
      const isAdminEmail = email === 'admin@cursosfa.com' || email === 'vinicius@fazendoacontecer.com.br';
      
      if (isAdminEmail && password === 'admin123' || password === 'admin@FA1') {
        let authUserId: string | undefined;

        // Tenta logar primeiro
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        authUserId = signInData?.user?.id;

        // Se falhar, tenta criar (SignUp) - Apenas se o Supabase estiver configurado
        if (signInError) {
            // Log de erro para debug em ambiente de desenvolvimento
            console.warn("Falha no login admin. Verifique as credenciais no Supabase.");
        }

        if (authUserId) {
            await setSessionAction('admin');
            router.push('/admin/dashboard');
            return;
        }
      }

      // Permite bypass mock para testes (Remover em produção)
      if (email === 'aluno' || email === 'aluno@cursosfa.com') {
        await setSessionAction('student');
        router.push('/app/home');
        return;
      }

      // Fluxo principal para estudantes logarem
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (signInError) throw new Error('Credenciais inválidas. Verifique e tente novamente.');

      // Puxa a role do usuário no banco
      const { data: userRow } = await supabase.from('users').select('role, approval_status').eq('id', data.user.id).single();
      
      const role = userRow?.role || 'student';
      const status = userRow?.approval_status || 'pending';

      if (role === 'admin') {
        await setSessionAction('admin');
        router.push('/admin/dashboard');
        return;
      }

      if (status === 'pending') {
        await supabase.auth.signOut();
        throw new Error('Seu cadastro foi enviado e está aguardando aprovação.');
      }

      await setSessionAction('student');
      router.push('/app/home');

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Erro inesperado no sistema de login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
       if (password !== confirmPassword) {
         throw new Error('As senhas não coincidem.');
       }
       if (password.length < 6) {
         throw new Error('A senha deve ter no mínimo 6 caracteres.');
       }
       if (!name.trim()) {
         throw new Error('O nome completo é obrigatório.');
       }

       // Attempt to create user
       const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
         email, 
         password,
         options: {
           data: { name }
         } 
       });

       if (signUpError) {
         if (signUpError.message.includes('already')) {
            throw new Error('Este e-mail já está cadastrado.');
         }
         throw new Error(`Erro ao criar conta: ${signUpError.message}`);
       }

       if (!signUpData.user) {
         throw new Error('Erro ao criar usuário.');
       }

       // Create user profile in 'users' table
       const { error: dbError } = await supabase.from('users').upsert({
         id: signUpData.user.id,
         email: email,
         name: name,
         role: 'student',
         approval_status: 'pending'
       }, { onConflict: 'id' });

       if (dbError) throw new Error(`Erro ao salvar perfil no banco: ${dbError.message}`);

       setSuccessMessage('Cadastro enviado com sucesso. Aguarde a aprovação para acessar a plataforma.');
       
       await supabase.auth.signOut();

       // Limpar
       setEmail('');
       setPassword('');
       setConfirmPassword('');
       setName('');
       
       setTimeout(() => {
         setIsRegistering(false);
         setSuccessMessage('');
       }, 5000);

    } catch (err: any) {
       setError(err.message || 'Erro inesperado no cadastro.');
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-primary/5" />
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[440px] px-6"
      >
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center"
          >
             <div className="relative">
               {/* Destaque de Luz (Glow) */}
               <div className="absolute inset-0 bg-primary/40 blur-[60px] rounded-full animate-pulse" />
               <div className="absolute -inset-10 bg-primary/10 blur-[100px] rounded-full" />
               
               <div className="relative z-10">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-48 h-48 object-contain drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                  />
               </div>
             </div>
          </motion.div>
        </div>

        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] overflow-visible">
          <CardHeader className="text-center pt-8">
            <CardTitle className="text-xl font-medium text-white/90">
              {isRegistering ? 'Solicitação de Acesso' : 'Bem-vindo'}
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-1">
              {isRegistering ? 'Preencha seus dados para começar' : 'Identifique-se para acessar a área exclusiva'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium text-center"
              >
                {successMessage}
              </motion.div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-5">
              <div className="space-y-4">
                {isRegistering && (
                   <div className="space-y-2">
                     <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 ml-1">Nome Completo</Label>
                     <Input
                       id="name"
                       type="text"
                       placeholder="Seu nome"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required={isRegistering}
                       disabled={loading}
                       className="h-12 border-white/5 bg-white/5 focus-visible:ring-primary/20 transition-all duration-300"
                     />
                   </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 ml-1">
                    {isRegistering ? 'Email' : 'Usuário ou Email'}
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-12 h-12 border-white/5 bg-white/5 focus-visible:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Senha</Label>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-12 h-12 border-white/5 bg-white/5 focus-visible:ring-primary/20 transition-all duration-300"
                    />
                  </div>
                </div>

                {isRegistering && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-widest text-zinc-500 ml-1">Confirmar Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required={isRegistering}
                        disabled={loading}
                        className="pl-12 h-12 border-white/5 bg-white/5 focus-visible:ring-primary/20 transition-all duration-300"
                      />
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium text-destructive/90 text-center bg-destructive/5 py-2 rounded-md border border-destructive/10"
                >
                  {error}
                </motion.p>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                variant="premium"
                className="w-full h-12 text-sm font-bold uppercase tracking-widest mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : (isRegistering ? 'Solicitar Ingresso' : 'Acessar Área')}
              </Button>

              <div className="text-center mt-6">
               {isRegistering ? (
                 <p className="text-xs text-zinc-500">
                   Já possui cadastro? <button type="button" onClick={() => { setIsRegistering(false); setError(''); setSuccessMessage(''); }} className="text-primary hover:text-white font-bold transition-colors">VOLTAR AO LOGIN</button>
                 </p>
               ) : (
                 <p className="text-xs text-zinc-500">
                   Não possui acesso? <button type="button" onClick={() => { setIsRegistering(true); setError(''); setSuccessMessage(''); }} className="text-primary hover:text-white font-bold transition-colors">SOLICITAR CONTA</button>
                 </p>
               )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Institutional Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-[10px] text-zinc-600 uppercase tracking-[0.2em] font-medium"
        >
          Cursos FA © 2026
        </motion.p>
      </motion.div>
    </div>
  );
}
