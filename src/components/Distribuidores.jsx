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
  function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

  return (
    <div className="section section-distribuidores">
      <div className="btn-group dist-buttons mb-3 d-flex">
        {modoEdicion ? 
        <button className="btn btn-edit-true" onClick={() => setModoEdicion(!modoEdicion)}>
          Editar
        </button> : 
        <button className="btn " onClick={() => setModoEdicion(!modoEdicion)}>
        Editar       
      </button> 
        }
        <button className="btn" onClick={() => setMostrarModalDistribuidor(true)}>
          Crear
        </button>
      </div>
      {distribuidores.length > 0 ? (
        <ul className="list-group mb-4 list-distribuidores">
          {distribuidores.map(distribuidor => (
            <>
            <li 
              key={distribuidor.id}
              className="list-group-item d-flex justify-content-between align-items-center "
              onClick={() => {
                if (modoEdicion) {
                  setDistribuidorSeleccionado(distribuidor);
                  setMostrarModalDistribuidor(true);
                }
              }}
            >
              <div className="dist-text-container">
                <div>
                <strong>{capitalizeFirst(distribuidor.nombre)}</strong> <span>{distribuidor.diaSemana}</span> 
                </div>
                <small><i class="fa fa-phone" aria-hidden="true"></i> {distribuidor.telefono} </small>
              </div>
              {modoEdicion ? (
                <button className="rounded-1 btn-add-product btn-remove-dist" onClick={(event) => {
                  event.stopPropagation();
                  handleEliminarDistribuidor(distribuidor.id);
                }}>
                  <i class="fa fa-trash-o" aria-hidden="true"></i>
                </button>
              ) : (
                <button className="rounded-1 btn-add-product" onClick={() => {
                  setDistribuidorSeleccionado(distribuidor.id);
                  setMostrarModalProducto(true);
                }}>
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                
              )}
            </li>
            </>
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
