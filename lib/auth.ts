import { supabase } from "./supabase";

export interface AuthResponse {
  user: any;
  error: any;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

export async function signOut(): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role;
  } catch (error) {
    return null;
  }
}

export async function checkAdminAccess(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return false;
    }

    const role = await getUserRole(user.id);
    return role === "admin" || role === "kitchen";
  } catch (error) {
    return false;
  }
}

