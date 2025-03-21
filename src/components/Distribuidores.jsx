import React, { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import Modal from "./Modal";
import DistribuidorForm from "./DistributorForm";
import ProductForm from "./ProductForm";

const Distribuidores = ({ user }) => {
  const [distribuidores, setDistribuidores] = useState([]);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState(null);
  const [mostrarModalDistribuidor, setMostrarModalDistribuidor] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDistribuidores();
  }, [user]);

  const cargarDistribuidores = async () => {
    const distribuidorRef = collection(db, `stocks/${user.email}/distribuidores`);
    const snapshot = await getDocs(distribuidorRef);
    const listaDistribuidores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDistribuidores(listaDistribuidores);
  };

  const handleEliminarDistribuidor = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este distribuidor y sus productos?")) return;
    try {
      await deleteDoc(doc(db, `stocks/${user.email}/distribuidores/${id}`));
      setDistribuidores(distribuidores.filter(d => d.id !== id));
    } catch (error) {
      console.error("Error al eliminar distribuidor", error);
    }
  };

  return (
    <div>
      <div className="btn-group mb-3">
        <button className="btn btn-success" onClick={() => setMostrarModalDistribuidor(true)}>
          Crear Distribuidor
        </button>
        <button className="btn btn-warning" onClick={() => setModoEdicion(!modoEdicion)}>
          {modoEdicion ? "Salir del modo edición" : "Modo edición"}
        </button>
      </div>
      <h3 className="mt-4">Distribuidores</h3>
      {distribuidores.length > 0 ? (
        <ul className="list-group mb-4">
          {distribuidores.map(distribuidor => (
            <li
              key={distribuidor.id}
              className="list-group-item d-flex justify-content-between align-items-center"
              onClick={() => {
                if (modoEdicion) {
                  setDistribuidorSeleccionado(distribuidor);
                  setMostrarModalDistribuidor(true);
                }
              }}
            >
              <div>
                <strong>{distribuidor.nombre}</strong> - {distribuidor.diaSemana} <br />
                <small>📞 {distribuidor.telefono}</small>
              </div>
              {modoEdicion ? (
                <button className="btn btn-danger btn-sm" onClick={(event) => {
                  event.stopPropagation();
                  handleEliminarDistribuidor(distribuidor.id);
                }}>
                  ×
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setDistribuidorSeleccionado(distribuidor.id); // 🔹 Usa el ID en lugar del nombre
                  setMostrarModalProducto(true);
                }}>
                  +
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay distribuidores aún.</p>
      )}

      <Modal isOpen={mostrarModalDistribuidor} onClose={() => setMostrarModalDistribuidor(false)}>
        <DistribuidorForm user={user} distribuidor={distribuidorSeleccionado} onDistribuidorAgregado={() => {
          cargarDistribuidores();
          setMostrarModalDistribuidor(false);
        }} />
      </Modal>
      <Modal isOpen={mostrarModalProducto} onClose={() => setMostrarModalProducto(false)}>
        <ProductForm user={user} distribuidor={distribuidorSeleccionado} onProductoAgregado={() => setMostrarModalProducto(false)} />
      </Modal>
    </div>
  );
};

export default Distribuidores;
