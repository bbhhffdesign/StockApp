import { useState } from "react";

const BotonCopiar = ({ distribuidorId, productosPorDistribuidor, nombresDistribuidores }) => {
  const [textoBoton, setTextoBoton] = useState("Copiar");

  const copiarPedidoPorDistribuidor = (distribuidorId, productosPorDistribuidor, nombresDistribuidores) => {
    const distribuidor = nombresDistribuidores[distribuidorId];
    if (!distribuidor) return;

    const productosFaltantes = productosPorDistribuidor[distribuidorId]
      .filter((producto) => producto.cantActual < producto.cantDeseada)
      .map((producto) => `- ${producto.nombre} ${producto.cantDeseada - producto.cantActual}`)
      .join("\n");

    navigator.clipboard.writeText(productosFaltantes)
      .then(() => {
        setTextoBoton("Copiado");
        setTimeout(() => setTextoBoton("Copiar"), 1000); // Vuelve a "copiar" después de 2 segundos
      })
      .catch(() => {
        alert("Error al copiar");
      });

    if (!productosFaltantes) {
      alert("No hay productos faltantes para este distribuidor.");
      return;
    }
  };

  return (
    <button className="btn copy-distri" onClick={() => copiarPedidoPorDistribuidor(
      distribuidorId, productosPorDistribuidor, nombresDistribuidores
    )}>
      {textoBoton}
    </button>
  );
};

export default BotonCopiar;