import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configurar conexión con Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [puntuacion, setPuntuacion] = useState("");
  const [deporte, setDeporte] = useState(""); // Nuevo estado para el tipo de deporte
  const [user, setUser] = useState(null);

  // Cargar usuario y registros al montar el componente
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchRegistros();
    }
    fetchUser();
  }, []);

  // Obtener los registros con la relación a usuarios
  async function fetchRegistros() {
    const { data, error } = await supabase
      .from("registros")
      .select("id, puntuacion, day, time, distance, sport_type, user_id, users:auth.users(email)");

    if (error) console.error(error);
    else setRegistros(data);
  }

  // Añadir un nuevo registro
  async function addRegistro() {
    if (!user) return alert("Debes estar autenticado");

    const { data, error } = await supabase
      .from("registros")
      .insert([{ 
        user_id: user.id, 
        puntuacion: parseInt(puntuacion),
        sport_type: deporte, // Guardar el tipo de deporte
        day: new Date().toISOString().split("T")[0] // Guardar la fecha actual
      }])
      .select();

    if (error) console.error(error);
    else {
      setRegistros([...registros, data[0]]);
      setPuntuacion("");
      setDeporte("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Registros de Todos los Usuarios
        </h1>

        {/* Formulario para añadir registros */}
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Añadir Puntuación</h2>
          <div className="flex gap-2 justify-center">
            <input
              type="number"
              value={puntuacion}
              onChange={(e) => setPuntuacion(e.target.value)}
              placeholder="Introduce puntuación"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={deporte}
              onChange={(e) => setDeporte(e.target.value)}
              placeholder="Tipo de deporte (correr, nadar, caminar...)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addRegistro}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 px-4 py-2 text-left">Usuario</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Deporte</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fecha</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tiempo</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Distancia</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{registro.users?.email || "Desconocido"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.sport_type || "No especificado"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.day || "Sin fecha"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.time || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.distance || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{registro.puntuacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
