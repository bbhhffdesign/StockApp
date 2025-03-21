import { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const DistribuidorForm = ({ user, distribuidor, onDistribuidorAgregado }) => {
  const [nombre, setNombre] = useState(distribuidor?.nombre || "");
  const [telefono, setTelefono] = useState(distribuidor?.telefono || "");
  const [diaSemana, setDiaSemana] = useState(distribuidor?.diaSemana || "Lunes");

  useEffect(() => {
    if (distribuidor) {
      setNombre(distribuidor.nombre);
      setTelefono(distribuidor.telefono);
      setDiaSemana(distribuidor.diaSemana);
    }
  }, [distribuidor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("El nombre es obligatorio");

    try {
      const distribuidorId = distribuidor?.id || crypto.randomUUID(); // 🔹 Usa un ID fijo
      const distribuidorRef = doc(db, `stocks/${user.email}/distribuidores/${distribuidorId}`);

      await setDoc(distribuidorRef, { id: distribuidorId, nombre, telefono, diaSemana }, { merge: true });

      onDistribuidorAgregado();
    } catch (error) {
      console.error("Error al guardar distribuidor", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h3>{distribuidor ? "Editar Distribuidor" : "Agregar Distribuidor"}</h3>
      <input type="text" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control mb-2" required />
      <input type="tel" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="form-control mb-2" />
      <select value={diaSemana} onChange={(e) => setDiaSemana(e.target.value)} className="form-control mb-2">
        <option value="Lunes">Lunes</option>
        <option value="Martes">Martes</option>
        <option value="Miércoles">Miércoles</option>
        <option value="Jueves">Jueves</option>
        <option value="Viernes">Viernes</option>
        <option value="Sábado">Sábado</option>
      </select>
      <button type="submit" className="btn btn-success w-100">Guardar</button>
    </form>
  );
};

export default DistribuidorForm;