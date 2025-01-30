import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard() {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    async function fetchRegistros() {
      let { data, error } = await supabase.from("registros").select("*");
      if (!error) setRegistros(data);
    }
    fetchRegistros();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Registros</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Usuario</th>
            <th className="border p-2">Puntuación</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((reg) => (
            <tr key={reg.id}>
              <td className="border p-2">{reg.usuario}</td>
              <td className="border p-2">{reg.puntuacion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
