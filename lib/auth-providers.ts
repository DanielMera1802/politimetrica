"use client"

import { supabase } from "./supabaseClient"
import type { User } from "./types"

// 🔐 Login con Google
export async function signInWithGoogle(): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { queryParams: { prompt: "select_account" } }
    })

    if (error) throw error

    // La redirección automática se hace al proveedor
    // Puedes dejar esto así, o manejarlo en un callback en /auth/callback
    return {
      id: "",
      name: "Google User",
      email: "unknown@example.com",
      role: "user",
      subscription: "free",
    }
  } catch (error: any) {
    console.error("Error al iniciar sesión con Google:", error)
    throw error
  }
}

// 📧 Registro con email y contraseña
export async function registerWithEmail(name: string, email: string, password: string): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`, // si usas verificación por correo
        data: { name }
      }
    })

    if (error) throw error

    const userData: User = {
      id: data.user?.id || "",
      name: name,
      email: email,
      role: "user",
      subscription: "free",
    }

    localStorage.setItem("currentUser", JSON.stringify(userData))
    window.dispatchEvent(new Event("storage"))

    return userData
  } catch (error: any) {
    console.error("Error al registrar usuario:", error)
    throw error
  }
}

// 🔑 Login con email y contraseña
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) throw error

    const user = data.user
    const userData: User = {
      id: user.id,
      name: user.user_metadata?.name || email.split("@")[0],
      email: email,
      role: email === "admin@politimetrica.com" ? "admin" : "user",
      subscription: "free",
    }

    localStorage.setItem("currentUser", JSON.stringify(userData))
    window.dispatchEvent(new Event("storage"))

    return userData
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error)
    throw error
  }
}
