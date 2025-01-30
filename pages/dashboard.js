import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);
  const [sportType, setSportType] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [puntuacion, setPuntuacion] = useState("");
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error obteniendo usuario:", error);
        router.push("/login"); // Redirige si hay un error
      } else if (!user) {
        router.push("/login"); // Redirige si no hay usuario
      } else {
        console.log("Usuario autenticado:", user);
        setUser(user);
        fetchRegistros(); // Cargar registros cuando haya usuario
      }
    }

    fetchUser();
  }, []);

  async function fetchRegistros() {
    const { data, error } = await supabase
      .from("registros")
      .select("id, sport_type, day, time, distance, puntuacion, user_id, auth.users(email)")
      .order("day", { ascending: false });

    if (error) {
      console.error("Error obteniendo registros:", error);
    } else {
      console.log("Registros obtenidos:", data);
      setRegistros(data);
    }
  }

  async function addRegistro() {
    if (!user) {
      alert("Debes estar autenticado");
      return;
    }

    console.log("Datos a insertar:", {
      user_id: user.id,
      sport_type: sportType,
      day,
      time,
      distance,
      puntuacion: parseInt(puntuacion),
    });

    const { data, error } = await supabase
      .from("registros")
      .insert([
        {
          user_id: user.id,
          sport_type: sportType,
          day,
          time,
          distance,
          puntuacion: parseInt(puntuacion),
        }
      ])
      .select();

    if (error) {
      console.error("Error al insertar registro:", error);
    } else {
      console.log("Registro insertado:", data);
      setRegistros([...registros, ...data]); // Agrega el nuevo registro a la lista
      setSportType("");
      setDay("");
      setTime("");
      setDistance("");
      setPuntuacion("");
    }
  }

  return user ? (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Registros de Todos los Usuarios
        </h1>

        {/* Formulario para añadir registros */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Añadir Registro</h2>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              placeholder="Tipo de Deporte (correr, nadar, etc.)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Tiempo (min:seg)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Distancia (km/m)"
              className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={puntuacion}
              onChange={(e) => setPuntuacion(e.target.value)}
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

        {/* Tabla de registros */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="border border-gray-300 px-4 py-2">Usuario</th>
                <th className="border border-gray-300 px-4 py-2">Deporte</th>
                <th className="border border-gray-300 px-4 py-2">Fecha</th>
                <th className="border border-gray-300 px-4 py-2">Tiempo</th>
                <th className="border border-gray-300 px-4 py-2">Distancia</th>
                <th className="border border-gray-300 px-4 py-2">Puntuación</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((registro) => (
                <tr key={registro.id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{registro.email || "Desconocido"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.sport_type || "N/A"}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.day}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.time}</td>
                  <td className="border border-gray-300 px-4 py-2">{registro.distance}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{registro.puntuacion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <p>Redirigiendo a login...</p>
  );
}
