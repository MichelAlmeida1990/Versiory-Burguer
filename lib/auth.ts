import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'kitchen' | 'customer';
}

export async function loginAdmin(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Usuário não encontrado');

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Erro ao buscar perfil:', profileError);
      throw new Error('Erro ao buscar perfil do usuário');
    }

    if (!profile || (profile.role !== 'admin' && profile.role !== 'kitchen')) {
      await supabase.auth.signOut();
      throw new Error('Acesso negado. Apenas administradores e cozinha podem acessar.');
    }

    return {
      user: {
        id: authData.user.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
      } as AuthUser,
      session: authData.session,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  } catch (error) {
    return null;
  }
}

export async function checkAdminAccess(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null && (user.role === 'admin' || user.role === 'kitchen');
}

