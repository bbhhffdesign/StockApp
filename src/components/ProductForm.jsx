import { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import { doc, setDoc, updateDoc } from "firebase/firestore";

const ProductForm = ({ user, distribuidor, producto, onProductoAgregado }) => {
  const [nombre, setNombre] = useState(producto?.nombre || "");
  const [cantActual, setCantActual] = useState(producto?.cantActual || 0);
  const [cantDeseada, setCantDeseada] = useState(producto?.cantDeseada || 0);

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre);
      setCantActual(producto.cantActual);
      setCantDeseada(producto.cantDeseada);
    }
  }, [producto]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return alert("El nombre del producto es obligatorio");

    try {
      const productoRef = doc(db, `stocks/${user.email}/distribuidores/${distribuidor}/productos/${producto?.id || nombre}`);
      await setDoc(productoRef, {
        nombre,
        cantActual: Number(cantActual),
        cantDeseada: Number(cantDeseada),
      }, { merge: true });

      onProductoAgregado();
    } catch (error) {
      console.error("Error al guardar producto", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h3>{producto ? "Editar Producto" : "Agregar Producto"}</h3>
      <input type="text" placeholder="Nombre del producto" value={nombre} onChange={(e) => setNombre(e.target.value)} className="form-control mb-2" required />
      <input type="number" placeholder="Cantidad Actual" onChange={(e) => setCantActual(Number(e.target.value))} className="form-control mb-2" />
      <input type="number" placeholder="Cantidad Deseada"  onChange={(e) => setCantDeseada(Number(e.target.value))} className="form-control mb-2" />
      <button type="submit" className="btn btn-success w-100">{producto ? "Guardar Cambios" : "Agregar Producto"}</button>
    </form>
  );
};

export default ProductForm;
