import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configurar conexión con Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    sport_type: "",
    day: "",
    time: "",
    distance: "",
    puntuacion: "",
  });
  const [registrosPendientes, setRegistrosPendientes] = useState([]); // Lista de registros antes de enviarlos
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
      .select("id, sport_type, day, time, distance, puntuacion, user_id, users:auth.users(email)");

    if (error) console.error(error);
    else setRegistros(data);
  }

  // Añadir un registro temporal antes de enviarlo a la base de datos
  function agregarRegistroTemporal() {
    const { sport_type, day, time, distance, puntuacion } = nuevoRegistro;
    
    if (!sport_type || !day || !time || !distance || !puntuacion) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    setRegistrosPendientes([...registrosPendientes, { ...nuevoRegistro }]);
    setNuevoRegistro({ sport_type: "", day: "", time: "", distance: "", puntuacion: "" }); // Limpiar inputs
  }

  // Enviar todos los registros pendientes a Supabase
  async function enviarRegistros() {
    if (!user) return alert("Debes estar autenticado");
    if (registrosPendientes.length === 0) return alert("No hay registros para enviar.");

    const nuevosRegistros = registrosPendientes.map(registro => ({
      user_id: user.id,
      sport_type: registro.sport_type,
      day: registro.day,
      time: registro.time,
      distance: registro.distance,
      puntuacion: parseInt(registro.puntuacion),
    }));

    const { error } = await supabase.from("registros").insert(nuevosRegistros);
    
    if (error) console.error(error);
    else {
      setRegistros([...registros, ...nuevosRegistros]); // Actualizar estado con nuevos datos
      setRegistrosPendientes([]); // Limpiar registros temporales
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
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Añadir Registros</h2>
          <div className="flex flex-col gap-2 justify-center items-center">
            <input
              type="text"
              value={nuevoRegistro.sport_type}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, sport_type: e.target.value })}
              placeholder="Deporte (correr, nadar...)"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full"
            />
            <input
              type="date"
              value={nuevoRegistro.day}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, day: e.target.value })}
              placeholder="Fecha"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full"
            />
            <input
              type="text"
              value={nuevoRegistro.time}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, time: e.target.value })}
              placeholder="Tiempo (min:seg)"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full"
            />
            <input
              type="text"
              value={nuevoRegistro.distance}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, distance: e.target.value })}
              placeholder="Distancia (km/m)"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full"
            />
            <input
              type="number"
              value={nuevoRegistro.puntuacion}
              onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, puntuacion: e.target.value })}
              placeholder="Puntuación"
              className="border border-gray-300 px-3 py-2 rounded-lg w-full"
            />
            <button
              onClick={agregarRegistroTemporal}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 w-full"
            >
              Añadir a la lista
            </button>
          </div>
        </div>

        {/* Registros Pendientes */}
        {registrosPendientes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Registros en espera</h3>
            <ul className="list-disc pl-5 text-gray-700">
              {registrosPendientes.map((registro, index) => (
                <li key={index}>
                  {registro.sport_type} - {registro.day} - {registro.time} - {registro.distance} - {registro.puntuacion} puntos
                </li>
              ))}
            </ul>
            <button
              onClick={enviarRegistros}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Enviar todos
            </button>
          </div>
        )}

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
