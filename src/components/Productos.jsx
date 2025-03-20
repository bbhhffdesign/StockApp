import React, { useState, useEffect } from "react";
import { db } from "../js/firebaseConfig";
import { collection, doc, updateDoc, getDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import Modal from "./Modal";
import ProductForm from "./ProductForm";

const Productos = ({ user }) => {
  const [productosPorDistribuidor, setProductosPorDistribuidor] = useState({});
  const [filaExpandida, setFilaExpandida] = useState(null);
  const [incremento, setIncremento] = useState(1);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [distribuidorSeleccionado, setDistribuidorSeleccionado] = useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);

  useEffect(() => {
    if (!user) return;

    const distribuidorRef = collection(db, `stocks/${user.email}/distribuidores`);
    const unsubscribeDistribuidores = onSnapshot(distribuidorRef, (snapshot) => {
      snapshot.docs.forEach((distribuidorDoc) => {
        const distribuidorId = distribuidorDoc.id;
        const productosRef = collection(db, `stocks/${user.email}/distribuidores/${distribuidorId}/productos`);

        const unsubscribeProductos = onSnapshot(productosRef, (productosSnapshot) => {
          const productos = productosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          const productosOrdenados = productos.sort((a, b) => {
            const faltanteA = a.cantActual < a.cantDeseada;
            const faltanteB = b.cantActual < b.cantDeseada;
            return faltanteB - faltanteA;
          });

          setProductosPorDistribuidor((prevState) => ({
            ...prevState,
            [distribuidorId]: productosOrdenados,
          }));
        });
      });
    });

    return () => unsubscribeDistribuidores();
  }, [user]);

  const toggleFilaExpandida = (productoId) => {
    setFilaExpandida(filaExpandida === productoId ? null : productoId);
  };

  const actualizarCantidad = async (distribuidorId, productoId, cambio) => {
    const productoRef = doc(db, `stocks/${user.email}/distribuidores/${distribuidorId}/productos/${productoId}`);
    const productoSnap = await getDoc(productoRef);
    
    if (!productoSnap.exists()) {
      console.error("El producto no existe en la base de datos", productoId);
      return;
    }
    
    const productoData = productoSnap.data();
    const nuevoValor = (productoData.cantActual || 0) + cambio;
    await updateDoc(productoRef, { cantActual: nuevoValor });
  };

  const handleEliminarProducto = async (distribuidorId, productoId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await deleteDoc(doc(db, `stocks/${user.email}/distribuidores/${distribuidorId}/productos/${productoId}`));
      setProductosPorDistribuidor((prevState) => {
        const nuevosProductos = { ...prevState };
        nuevosProductos[distribuidorId] = nuevosProductos[distribuidorId].filter(p => p.id !== productoId);
        return nuevosProductos;
      });
    } catch (error) {
      console.error("Error al eliminar producto", error);
    }
  };

  // Abre el modal con el producto y distribuidor seleccionado
  const abrirModalProducto = (producto, distribuidorId) => {
    setProductoSeleccionado(producto);
    setDistribuidorSeleccionado(distribuidorId);
    setMostrarModalProducto(true);
  };

  return (
    <div>
      <button className="btn btn-warning mb-3" onClick={() => setModoEdicion(!modoEdicion)}>
        {modoEdicion ? "Salir del modo edición" : "Modo edición"}
      </button>
      {Object.keys(productosPorDistribuidor).length > 0 ? (
        Object.keys(productosPorDistribuidor).map((distribuidorId) => (
          <div key={distribuidorId} className="mb-4">
            <table className="table table-bordered">
              <thead>
                <tr className="table-primary">
                  <th colSpan={modoEdicion ? 4 : 3} className="text-center">{distribuidorId}</th>
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
                            // Si estamos en modo edición, abrimos el modal
                            abrirModalProducto(producto, distribuidorId);
                          } else {
                            // Si no estamos en modo edición, expandimos la fila
                            toggleFilaExpandida(producto.id);
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
                      {filaExpandida === producto.id && !modoEdicion && (
                        <tr>
                          <td colSpan={modoEdicion ? 4 : 3} className="text-center">
                            <div className="btn-group">
                              <button
                                className="btn btn-success"
                                onClick={() => actualizarCantidad(distribuidorId, producto.id, incremento)}
                              >
                                +
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => actualizarCantidad(distribuidorId, producto.id, -incremento)}
                              >
                                -
                              </button>
                              <button
                                className={`btn ${incremento === 1 ? "btn-secondary" : "btn-warning"}`}
                                onClick={() => setIncremento(incremento === 1 ? 10 : 1)}
                              >
                                *10
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
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
      {/* El modal se muestra cuando mostrarModalProducto es true */}
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
