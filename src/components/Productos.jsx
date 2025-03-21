import React, { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import {
  collection,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import Modal from "./Modal";
import ProductForm from "./ProductForm";
import logProductosFaltantes from "../js/productosFaltantes";

const Productos = ({ user }) => {
  const [productosPorDistribuidor, setProductosPorDistribuidor] = useState({});
  const [nombresDistribuidores, setNombresDistribuidores] = useState({});
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [incremento, setIncremento] = useState(1);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Cargar distribuidores con su nombre y teléfono
    const distribuidorRef = collection(db, `stocks/${user.email}/distribuidores`);
    const unsubscribeDistribuidores = onSnapshot(distribuidorRef, (snapshot) => {
      const datosDistribuidores = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        datosDistribuidores[doc.id] = { 
          nombre: data.nombre, 
          telefono: data.telefono 
        };
      });
      setNombresDistribuidores(datosDistribuidores);
    });

    // Cargar productos por distribuidor
    const unsubscribeProductos = onSnapshot(distribuidorRef, (snapshot) => {
      snapshot.docs.forEach((distribuidorDoc) => {
        const distribuidorId = distribuidorDoc.id;
        const productosRef = collection(db, `stocks/${user.email}/distribuidores/${distribuidorId}/productos`);

        onSnapshot(productosRef, (productosSnapshot) => {
          const productos = productosSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          const productosOrdenados = productos.sort((a, b) => (b.cantActual < b.cantDeseada) - (a.cantActual < a.cantDeseada));

          setProductosPorDistribuidor((prevState) => ({
            ...prevState,
            [distribuidorId]: productosOrdenados,
          }));
        });
      });
    });

    return () => {
      unsubscribeDistribuidores();
      unsubscribeProductos();
    };
  }, [user]);

  const enviarMensajeWhatsApp = (distribuidorId) => {
    const distribuidor = nombresDistribuidores[distribuidorId];

    if (!distribuidor) {
      alert("No se encontró información del distribuidor.");
      return;
    }

    const telefono = distribuidor.telefono;
    if (!telefono) {
      alert("No se encontró el número de teléfono del distribuidor.");
      return;
    }

    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter(p => p.cantActual < p.cantDeseada)
      .map(p => `- ${p.nombre}: ${p.cantActual}/${p.cantDeseada}`)
      .join("\n");

    if (!productosFaltantes) {
      alert("No hay productos faltantes para este distribuidor.");
      return;
    }

    const mensaje = `Hola ${distribuidor.nombre}, estos son los productos que necesitamos reponer:\n\n${productosFaltantes}\n\n¡Gracias!`;
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  };

  return (
    <div>
      <button className="btn btn-warning mb-3" onClick={() => setModoEdicion(!modoEdicion)}>
        {modoEdicion ? "Salir del modo edición" : "Modo edición"}
      </button>
      <button className="btn btn-info mb-3" onClick={() => logProductosFaltantes(productosPorDistribuidor, nombresDistribuidores)}>
        Copiar productos faltantes 📋
      </button>

      {Object.keys(productosPorDistribuidor).length > 0 ? (
        Object.keys(productosPorDistribuidor).map((distribuidorId) => (
          <div key={distribuidorId} className="mb-4">
            <table className="table table-bordered">
              <thead>
                <tr className="table-primary">
                  <th colSpan={modoEdicion ? 4 : 3} className="text-center">
                    {nombresDistribuidores[distribuidorId]?.nombre || "Cargando..."}
                    <button 
                      className="btn btn-success btn-sm ms-2"
                      onClick={() => enviarMensajeWhatsApp(distribuidorId)}
                    >
                      WPP
                    </button>
                  </th>
                </tr>
                <tr className="table-light">
                  <th>Nombre</th>
                  <th>Cant. Actual</th>
                  <th>Cant. Deseada</th>
                  {modoEdicion && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {productosPorDistribuidor[distribuidorId].map((producto) => {
                  const faltante = producto.cantActual < producto.cantDeseada;
                  return (
                    <React.Fragment key={producto.id}>
                      <tr
                        style={{ backgroundColor: faltante ? "#ffcccc" : "#ccffcc" }}
                        onClick={() => {
                          if (modoEdicion) {
                            setProductoSeleccionado(producto);
                            setDistribuidorSeleccionado(distribuidorId);
                            setMostrarModalProducto(true);
                          } else {
                            setFilaExpandida(filaExpandida === producto.id ? null : producto.id);
                          }
                        }}
                      >
                        <td>{producto.nombre}</td>
                        <td>{producto.cantActual}</td>
                        <td>{producto.cantDeseada}</td>
                        {modoEdicion && (
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEliminarProducto(distribuidorId, producto.id);
                              }}
                            >
                              ×
                            </button>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No hay productos disponibles.</p>
      )}

      <Modal isOpen={mostrarModalProducto} onClose={() => setMostrarModalProducto(false)}>
        <ProductForm
          user={user}
          distribuidor={distribuidorSeleccionado}
          producto={productoSeleccionado}
          onProductoAgregado={() => setMostrarModalProducto(false)}
        />
      </Modal>
    </div>
  );
};

export default Productos;
