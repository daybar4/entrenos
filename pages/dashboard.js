import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [puntuacion, setPuntuacion] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      fetchRegistros();
    }
    fetchUser();
  }, []);

  async function fetchRegistros() {
    const { data, error } = await supabase
      .from("registros")
      .select("id, puntuacion, day, time, distance, user_id, users(email)");

    if (error) console.error(error);
    else setRegistros(data);
  }

  async function addRegistro() {
    if (!user) return alert("Debes estar autenticado");

    const { data, error } = await supabase
      .from("registros")
      .insert([{ 
        user_id: user.id, 
        day, 
        time, 
        distance, 
        puntuacion: parseInt(puntuacion) 
      }])
      .select();

    if (error) console.error(error);
    else {
      setRegistros([...registros, data[0]]);
      setPuntuacion("");
      setDay("");
      setTime("");
      setDistance("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Registros de Todos los Usuarios
        </h1>

        {/* Formulario para añadir registros */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">Añadir Puntuación</h2>
          <div className="flex flex-col gap-3">
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className="border border-gray-300 px-3 py-2 rounded-lg" />
            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} placeholder="Tiempo (ej: 10 min)" className="border border-gray-300 px-3 py-2 rounded-lg" />
            <input type="text" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="Distancia (ej: 5 km)" className="border border-gray-300 px-3 py-2 rounded-lg" />
            <input type="number" value={puntuacion} onChange={(e) => setPuntuacion(e.target.value)} placeholder="Introduce puntuación" className="border border-gray-300 px-3 py-2 rounded-lg" />
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
                <th className="border border-gray-300 px-4 py-2 text-left">Día</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tiempo</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Distancia</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{registro.users?.email || "Desconocido"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.day || "N/A"}</td>
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

