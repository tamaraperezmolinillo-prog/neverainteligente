import { useState, useEffect } from "react";

export default function App() {
  const [pantalla, setPantalla] = useState("nevera");

  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem("nevera");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [compra, setCompra] = useState(() => {
    const guardados = localStorage.getItem("compra");
    return guardados ? JSON.parse(guardados) : [];
  });

  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [caducidad, setCaducidad] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "nevera",
      JSON.stringify(productos)
    );
  }, [productos]);

  useEffect(() => {
    localStorage.setItem(
      "compra",
      JSON.stringify(compra)
    );
  }, [compra]);

  function añadirProducto() {
    if (!nombre.trim()) return;

    setProductos([
      ...productos,
      {
        id: Date.now(),
        nombre,
        cantidad: Number(cantidad),
        caducidad
      }
    ]);

    setNombre("");
    setCantidad(1);
    setCaducidad("");
  }

function diasRestantes(fecha) {

  if (!fecha) return 999;

  const hoy = new Date();

  const cad = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  cad.setHours(0, 0, 0, 0);

  const diferencia =
    cad.getTime() - hoy.getTime();

  return Math.ceil(
    diferencia / (1000 * 60 * 60 * 24)
  );
}

function obtenerEstado(fecha) {

  const dias = diasRestantes(fecha);

  if (dias < 0) {
    return {
      emoji: "☠️",
      color: "#f8d7da",
      texto: "Caducado"
    };
  }

  if (dias <= 2) {
    return {
      emoji: "🔴",
      color: "#f8d7da",
      texto: "Urgente"
    };
  }

  if (dias <= 7) {
    return {
      emoji: "🟡",
      color: "#fff3cd",
      texto: "Atención"
    };
  }

  return {
    emoji: "🟢",
    color: "#d4edda",
    texto: "OK"
  };
}

  function consumirProducto(id) {
    const nuevosProductos = productos
      .map((p) => {
        if (p.id !== id) return p;

        const nuevaCantidad = p.cantidad - 1;

        if (nuevaCantidad <= 0) {
          const añadir = window.confirm(
            `${p.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`
          );

          if (añadir) {
            setCompra((actual) => [
              ...actual,
              {
                id: Date.now(),
                nombre: p.nombre
              }
            ]);
          }

          return null;
        }

        return {
          ...p,
          cantidad: nuevaCantidad
        };
      })
      .filter(Boolean);

    setProductos(nuevosProductos);
  }

  function eliminarCompra(id) {
    setCompra(
      compra.filter((item) => item.id !== id)
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Arial"
      }}
    >
      <div
        style={{
          background: "#4CAF50",
          color: "white",
          textAlign: "center",
          padding: 20,
          fontSize: 32,
          fontWeight: "bold"
        }}
      >
        🏠 Nevera Inteligente
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 20
        }}
      >
        {pantalla === "nevera" && (
          <>
            <h2>🥛 Nevera</h2>

            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 15,
                marginBottom: 20
              }}
            >
              <h3>Añadir producto</h3>

              <input
                placeholder="Producto"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
              />

              <br />
              <br />

              <input
                type="number"
                placeholder="Cantidad"
                value={cantidad}
                onChange={(e) =>
                  setCantidad(e.target.value)
                }
              />

              <br />
              <br />

              <input
                type="date"
                value={caducidad}
                onChange={(e) =>
                  setCaducidad(e.target.value)
                }
              />

              <br />
              <br />

              <button
                onClick={añadirProducto}
              >
                ➕ Añadir producto
              </button>
            </div>

            <table
              width="100%"
              border="1"
              cellPadding="10"
            >
              <thead>
                <tr>
                  <th>Producto</th>
		  <th>Cantidad</th>
		  <th>Caducidad</th>
		  <th>Días</th>
		  <th>Acción</th>
                </tr>
              </thead>
<tbody>
  {productos.map((p) => {

    const estado = obtenerEstado(
      p.caducidad
    );

    const dias = diasRestantes(
      p.caducidad
    );

    return (
      <tr
        key={p.id}
        style={{
          backgroundColor:
            estado.color
        }}
      >
        <td>
          {estado.emoji} {p.nombre}
        </td>

        <td>
          {p.cantidad}
        </td>

        <td>
          {p.caducidad}
        </td>

        <td>
          {dias < 0
            ? "Caducado"
            : `${dias} días`}
        </td>

        <td>
          <button
            onClick={() =>
              consumirProducto(
                p.id
              )
            }
          >
            Consumir 1
          </button>
        </td>
      </tr>
    );

  })}
</tbody>
              
            </table>
          </>
        )}

        {pantalla === "compra" && (
          <>
            <h2>🛒 Lista de la compra</h2>

            {compra.length === 0 && (
              <p>No hay productos.</p>
            )}

            <ul>
              {compra.map((item) => (
                <li
                  key={item.id}
                  style={{
                    marginBottom: 10
                  }}
                >
                  {item.nombre}

                  <button
                    style={{
                      marginLeft: 10
                    }}
                    onClick={() =>
                      eliminarCompra(item.id)
                    }
                  >
                    ✓ Comprado
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {pantalla === "calendario" && (
          <>
            <h2>📅 Calendario familiar</h2>

            <p>
              Próximamente:
            </p>

            <ul>
              <li>Cole de Joan</li>
              <li>Pediatra de Lola</li>
              <li>Cumpleaños</li>
              <li>Eventos familiares</li>
            </ul>
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          borderTop: "1px solid #ccc"
        }}
      >
        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("nevera")
          }
        >
          🥛 Nevera
        </button>

        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("compra")
          }
        >
          🛒 Compra
        </button>

        <button
          style={{
            flex: 1,
            padding: 20
          }}
          onClick={() =>
            setPantalla("calendario")
          }
        >
          📅 Calendario
        </button>
      </div>
    </div>
  );
}