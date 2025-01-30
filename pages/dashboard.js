import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [user, setUser] = useState(null);
  const [newRegistro, setNewRegistro] = useState({
    sport_type: "",
    day: "",
    time: "",
    distance: "",
    puntuacion: "",
  });

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
      .select("id, sport_type, day, time, distance, puntuacion, user_id, users:auth.users(email)");

    if (error) {
      console.error("Error al obtener registros:", error);
    } else {
      console.log("Registros obtenidos:", data); // Verificar si trae los emails
      setRegistros(data);
    }
  }

  async function addRegistro() {
    if (!user) return alert("Debes estar autenticado");

    const { data, error } = await supabase
      .from("registros")
      .insert([{ 
        user_id: user.id, 
        sport_type: newRegistro.sport_type,
        day: newRegistro.day,
        time: newRegistro.time,
        distance: newRegistro.distance,
        puntuacion: parseInt(newRegistro.puntuacion) 
      }])
      .select();

    if (error) {
      console.error("Error al añadir registro:", error);
    } else {
      setRegistros([...registros, ...data]); // Agregar nuevo registro sin perder los anteriores
      setNewRegistro({ sport_type: "", day: "", time: "", distance: "", puntuacion: "" });
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Registros de Todos los Usuarios
        </h1>

        {/* Formulario para añadir registros */}
        <div className="mt-6 text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Añadir Registros</h2>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newRegistro.sport_type}
              onChange={(e) => setNewRegistro({ ...newRegistro, sport_type: e.target.value })}
              placeholder="Tipo de deporte (correr, nadar, caminar)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={newRegistro.day}
              onChange={(e) => setNewRegistro({ ...newRegistro, day: e.target.value })}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newRegistro.time}
              onChange={(e) => setNewRegistro({ ...newRegistro, time: e.target.value })}
              placeholder="Tiempo (min:seg)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={newRegistro.distance}
              onChange={(e) => setNewRegistro({ ...newRegistro, distance: e.target.value })}
              placeholder="Distancia (km/m)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={newRegistro.puntuacion}
              onChange={(e) => setNewRegistro({ ...newRegistro, puntuacion: e.target.value })}
              placeholder="Puntuación"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addRegistro}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Añadir a la lista
            </button>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="overflow-x-auto mt-6">
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
                  <td className="border border-gray-300 px-4 py-2">
                    {registro.users ? registro.users.email : "Desconocido"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{registro.sport_type}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.day}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.time}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.distance}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.puntuacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
