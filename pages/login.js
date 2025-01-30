import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    if (isRegistering) {
      // Registro de usuario
      const { user, error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Cuenta creada! Revisa tu correo para verificar.");
    } else {
      // Login de usuario
      const { user, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else window.location.href = "/dashboard";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleAuth} className="bg-white p-6 shadow-md rounded-lg">
        <h2 className="text-xl font-bold">{isRegistering ? "Registrarse" : "Iniciar sesión"}</h2>
        <input type="email" placeholder="Email" className="border p-2 mb-2 w-full" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" className="border p-2 mb-2 w-full" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="bg-blue-500 text-white p-2 w-full">
          {isRegistering ? "Registrarse" : "Iniciar sesión"}
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="mt-2 text-blue-500 underline"
        >
          {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
        </button>
      </form>
    </div>
  );
}

