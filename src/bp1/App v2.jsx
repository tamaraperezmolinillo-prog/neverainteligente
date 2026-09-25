
import { useState, useEffect } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { db } from "./db";
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

  const [codigo, setCodigo] = useState("");

  const [nombre, setNombre] = useState("");

  const [cantidad, setCantidad] = useState(1);

  const [caducidad, setCaducidad] = useState("");

  const [mostrarModalCompra, setMostrarModalCompra] =
    useState(false);

  const [productoComprado, setProductoComprado] =
    useState(null);

  const [cantidadCompra, setCantidadCompra] =
    useState(1);

  const [caducidadCompra, setCaducidadCompra] =
    useState("");

  const [modoCompra, setModoCompra] =
    useState(false);

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


  useEffect(() => {

    async function cargarProductosIniciales() {

      const total =
        await db.productos.count();

      if (total === 0) {

        await db.productos.bulkAdd([
          {
            codigo: "8410188012345",
            nombre: "Cola Cao"
          },
          {
            codigo: "8410000000001",
            nombre: "Leche Entera"
          },
          {
            codigo: "8410000000002",
            nombre: "Yogur Natural"
          }
        ]);
      }
    }

    cargarProductosIniciales();

  }, []);
  const [escaneando, setEscaneando] = useState(false);


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
        color: "#e5e7eb"
      };
    }

    if (dias <= 2) {
      return {
        emoji: "🔴",
        color: "#f8d7da"
      };
    }

    if (dias <= 7) {
      return {
        emoji: "🟡",
        color: "#fff3cd"
      };
    }

    return {
      emoji: "🟢",
      color: "#d4edda"
    };
  }

  function añadirProducto() {

  if (!nombre.trim()) return;

  const nuevoProducto = {
    id: Date.now(),
    codigo,
    nombre,
    cantidad: Number(cantidad),
    caducidad
  };
  setProductos([
    ...productos,
    nuevoProducto
  ]);

  // Si viene de la lista de compra
  if (
    modoCompra &&
    productoComprado
  ) {

    setCompra(
      compra.filter(
        (item) =>
          item.id !== productoComprado.id
      )
    );

    setModoCompra(false);
    setProductoComprado(null);
  }

  // Limpiar formulario
  setCodigo("");
  setNombre("");
  setCantidad(1);
  setCaducidad("");
}

async function escanearCodigo() {

  setEscaneando(true);

  try {

    const codeReader =
      new BrowserMultiFormatReader();

    const videoInputDevices =
      await BrowserMultiFormatReader.listVideoInputDevices();

    const selectedDeviceId =
      videoInputDevices[0].deviceId;

    const resultado =
      await codeReader.decodeOnceFromVideoDevice(
        selectedDeviceId,
        "video-escaner"
      );

    const codigoLeido = resultado.text;

setCodigo(codigoLeido);
setNombre(codigoLeido);

    codeReader.reset();

  } catch (error) {

    console.error(error);

    alert("No se pudo leer el código");

  }

  setEscaneando(false);
}

async function escanearFoto(event) {

  const archivo = event.target.files[0];

  if (!archivo) return;

  try {

    const codeReader =
      new BrowserMultiFormatReader();

    const resultado =
      await codeReader.decodeFromImageUrl(
        URL.createObjectURL(archivo)
      );

    const codigoLeido = resultado.text;

setCodigo(codigoLeido);
setNombre(codigoLeido);

  } catch (error) {

    console.error(error);

    alert(
      "No se ha encontrado ningún código de barras"
    );
  }
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

function cambiarCantidad(id, nuevaCantidad) {

  const producto = productos.find(
    (p) => p.id === id
  );

  if (!producto) return;

  if (nuevaCantidad <= 0) {

    const añadir = window.confirm(
      `${producto.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`
    );

    if (añadir) {
      setCompra((actual) => [
        ...actual,
        {
          id: Date.now(),
          nombre: producto.nombre
        }
      ]);
    }

    setProductos(
      productos.filter(
        (p) => p.id !== id
      )
    );

    return;
  }

  setProductos(
    productos.map((p) =>
      p.id === id
        ? {
            ...p,
            cantidad: nuevaCantidad
          }
        : p
    )
  );
}
  function eliminarCompra(id) {

    const producto = compra.find(
    (item) => item.id === id
    );

    setProductoComprado(producto);
    setCantidadCompra(1);
    setCaducidadCompra("");

    setMostrarModalCompra(true);
  }

function confirmarCompra() {

  if (!caducidadCompra || !productoComprado) {
    return;
  }

  setProductos([
    ...productos,
    {
      id: Date.now(),
      nombre: productoComprado.nombre,
      cantidad: Number(cantidadCompra),
      caducidad: caducidadCompra
    }
  ]);

  setCompra(
    compra.filter(
      (item) =>
        item.id !== productoComprado.id
    )
  );

  setMostrarModalCompra(false);
  setProductoComprado(null);
  setCantidadCompra(1);
  setCaducidadCompra("");
}



  const total = productos.length;

  const ok = productos.filter(
    (p) => diasRestantes(p.caducidad) > 7
  ).length;

  const atencion = productos.filter((p) => {
    const d = diasRestantes(p.caducidad);
    return d >= 3 && d <= 7;
  }).length;

  const urgente = productos.filter((p) => {
    const d = diasRestantes(p.caducidad);
    return d >= 0 && d <= 2;
  }).length;

  const caducado = productos.filter(
    (p) => diasRestantes(p.caducidad) < 0
  ).length;

return (
  <div
    style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      fontFamily: "Arial, sans-serif",
      background: "#f5f5f5"
    }}
  >
    {/* CABECERA */}
    <div
      style={{
        background: "#4CAF50",
        color: "white",
        textAlign: "center",
        fontWeight: "bold",
        padding: "20px",
        fontSize: "32px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
      }}
    >
      🏠 Nevera Inteligente
    </div>

    {/* CONTENIDO */}
    <div
      style={{
        flex: 1,
        padding: "20px",
        width: "100%",
        boxSizing: "border-box"
      }}
    >
  {pantalla === "nevera" && (
          <>
            <h2>🥛 Nevera</h2>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 20
              }}
            >
              <div
                style={{
                  background: "#dbeafe",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                <b>TOTAL</b>
                <br />
                {total}
              </div>

              <div
                style={{
                  background: "#d4edda",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold",
                  
                  
                }}
              >
                🟢
                <br />
                {ok}
              </div>

              <div
                style={{
                  background: "#fff3cd",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                🟡
                <br />
                {atencion}
              </div>

              <div
                style={{
                  background: "#f8d7da",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                🔴
                <br />
                {urgente}
              </div>

              <div
                style={{
                  background: "#e5e7eb",
                  padding: 15,
                  borderRadius: 10,
                  minWidth: 140,
                  textAlign: "center",
                  fontSize: 28,
                  fontWeight: "bold"
                }}
              >
                ☠️
                <br />
                {caducado}
              </div>
            </div>

            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 15,
                marginBottom: 20
              }}
            >
              

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                <input
                  placeholder="Producto"
                  value={nombre}
                  onChange={(e) =>
                    setNombre(e.target.value)
                  }
                  style={{
                    flex: 2,
                    padding: 10
                  }}
                />

                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(e.target.value)
                  }
                  style={{
                    width: 100,
                    padding: 10
                  }}
                />

                <input
                  type="date"
                  value={caducidad}
                  onChange={(e) =>
                    setCaducidad(e.target.value)
                  }
                  style={{
                    padding: 10
                  }}
                />

                <button
                  onClick={añadirProducto}
                  style={{
                    padding: "10px 20px",
                    background: "#4CAF50",
                    color: "white",
                    border: "none"
                  }}
                >
                  ➕ Añadir
                </button>
                <button
                    onClick={escanearCodigo}
                    style={{
                      padding: "10px 20px",
                      background: "#2196F3",
                      color: "white",
                      border: "none",
                      borderRadius: 8
                    }}
                  >
                    📷 Cámara
                  </button>

                  <label
                    style={{
                      padding: "10px 20px",
                      background: "#ff9800",
                      color: "white",
                      borderRadius: 8,
                      cursor: "pointer"
                    }}
                  >
                    🖼️ Foto

                    <input
                      type="file"
                      accept="image/*"
                      onChange={escanearFoto}
                      style={{
                        display: "none"
                      }}
                    />
                  </label>
                </div>
            </div>

            
            {escaneando && (
              <div
                style={{
                  marginTop: 20,
                  textAlign: "center"
                }}
              >
                <video
                  id="video-escaner"
                  width="100%"
                  style={{
                    maxWidth: 500,
                    borderRadius: 10,
                    border: "2px solid #2196F3"
                  }}
                />

                <br />

                <button
                  onClick={() => setEscaneando(false)}
                  style={{
                    marginTop: 10,
                    padding: "10px 20px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: 8
                  }}
                >
                  ❌ Cerrar cámara
                </button>
              </div>
            )}


            <table
              width="100%"
              border="1"
              cellPadding="10"
            >
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Caducidad</th>
                  <th>Días</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {productos.map((p) => {
                  const estado =
                    obtenerEstado(
                      p.caducidad
                    );

                  const dias =
                    diasRestantes(
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
                        <td>{p.codigo}</td>
                        {estado.emoji}{" "}
                        {p.nombre}
                      </td>

                      <td>

  <button
    onClick={() =>
      cambiarCantidad(
        p.id,
        p.cantidad - 1
      )
    }
  >
    ➖
  </button>

  <span
    style={{
      margin: "0 12px",
      fontWeight: "bold",
      fontSize: 18
    }}
  >
    {p.cantidad}
  </span>

  <button
    onClick={() =>
      cambiarCantidad(
        p.id,
        p.cantidad + 1
      )
    }
  >
    ➕
  </button>

</td>

                      <td>{p.caducidad}</td>

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
                <li key={item.id}>
                  {item.nombre}

                  <button
                    style={{
                      marginLeft: 10
                    }}
                    onClick={() =>
                      eliminarCompra(
                        item.id
                      )
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

            <ul>
              <li>Cole de Joan</li>
              <li>Pediatra de Lola</li>
              <li>Cumpleaños</li>
              <li>Eventos familiares</li>
            </ul>
          </>
        )}
      </div>
{mostrarModalCompra && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999
    }}
  >
    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 20,
        width: 450,
        maxWidth: "90%",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}
    >
      <h2>🛒 Producto comprado</h2>

      <h3>{productoComprado?.nombre}</h3>

      <input
        type="number"
        min="1"
        value={cantidadCompra}
        onChange={(e) =>
          setCantidadCompra(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <input
        type="date"
        value={caducidadCompra}
        onChange={(e) =>
          setCaducidadCompra(e.target.value)
        }
        style={{
          width: "100%",
          padding: 12,
          marginBottom: 20,
          boxSizing: "border-box"
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10
        }}
      >
        <button
          onClick={confirmarCompra}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 25px",
            borderRadius: 10
          }}
        >
          Añadir
        </button>

        <button
          onClick={() =>
            setMostrarModalCompra(false)
          }
          style={{
            padding: "12px 25px",
            borderRadius: 10
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
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