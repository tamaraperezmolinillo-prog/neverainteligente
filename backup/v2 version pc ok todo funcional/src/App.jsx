import { useState, useEffect } from "react";
import Quagga from "@ericblade/quagga2";
import { db } from "./db";

export default function App() {
const [pantalla, setPantalla] =
  useState("nevera");

const [productos, setProductos] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "nevera"
      );

      

    return guardados
      ? JSON.parse(guardados)
      : [];
  });

const [compra, setCompra] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "compra"
      );

    return guardados
      ? JSON.parse(guardados)
      : [];
  });

const [tareas, setTareas] =
  useState(() => {

    const guardadas =
      localStorage.getItem(
        "tareas"
      );

    return guardadas
      ? JSON.parse(guardadas)
      : [];
  });

  


  const [codigo, setCodigo] =
  useState("");

const [nombre, setNombre] =
  useState("");

const [cantidad, setCantidad] =
  useState(1);

const [caducidad, setCaducidad] =
  useState("");

const [mostrarCalendario,
  setMostrarCalendario] =
  useState(false);

const [mostrarModalCompra,
  setMostrarModalCompra] =
  useState(false);

const [productoComprado,
  setProductoComprado] =
  useState(null);

const [cantidadCompra,
  setCantidadCompra] =
  useState(1);

const [caducidadCompra,
  setCaducidadCompra] =
  useState("");

const [modoCompra,
  setModoCompra] =
  useState(false);

const [nuevaTarea,
  setNuevaTarea] =
  useState("");

const [ubicacion, setUbicacion] =
  useState("Nevera");

const [nuevoCompra,
  setNuevoCompra] =
  useState("");

const [cantidadDeseada,
  setCantidadDeseada] =
  useState(1);

const [busquedaNevera, setBusquedaNevera] =
  useState("");

  const [ubicacionCompra,
  setUbicacionCompra] =
  useState("Nevera");


const [nuevoEvento, setNuevoEvento] =
  useState("");
const [eventos, setEventos] =
  useState(() => {

    const guardados =
      localStorage.getItem(
        "eventos"
      );

    return guardados
      ? JSON.parse(guardados)
      : [];

  });

const [colorEvento, setColorEvento] = useState("#4CAF50");
 
const [mesActual, setMesActual] = useState(
  new Date().getMonth()
);

const [añoActual, setAñoActual] = useState(
  new Date().getFullYear()
);

const [mostrarModalEvento, setMostrarModalEvento] =
  useState(false);

const [fechaSeleccionada, setFechaSeleccionada] =
  useState("");

  const [horaEvento, setHoraEvento] =
  useState("");
  const pendientes =
  tareas.filter(
    (t) => !t.hecha
  );

const completadas =
  tareas.filter(
    (t) => t.hecha
  );

const [fechaTarea,
  setFechaTarea] =
  useState("");
const [horaTarea, setHoraTarea] =
  useState("");

  const coloresPastel = [
  "#A8D5BA", // verde
  "#B8E0D2", // menta
  "#AFCBFF", // azul
  "#CDB4DB", // lila
  "#FFC8DD", // rosa
  "#FFD6A5", // melocotón
  "#FDFFB6", // amarillo
  "#CAE9FF", // celeste
  "#D8F3DC", // verde claro
  "#E9D5FF"  // violeta
];

// GUARDAR NEVERA

useEffect(() => {

  localStorage.setItem(
    "nevera",
    JSON.stringify(productos)
  );

}, [productos]);

// GUARDAR COMPRA

useEffect(() => {

  localStorage.setItem(
    "compra",
    JSON.stringify(compra)
  );

}, [compra]);

// GUARDAR TAREAS

useEffect(() => {

  localStorage.setItem(
    "tareas",
    JSON.stringify(tareas)
  );

}, [tareas]);

// CARGAR PRODUCTOS BASE
useEffect(() => {

  localStorage.setItem(
    "eventos",
    JSON.stringify(eventos)
  );

}, [eventos]);
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

function diasRestantes(fecha) {

  if (!fecha) return 999;

  const hoy = new Date();
  const cad = new Date(fecha);

  hoy.setHours(0, 0, 0, 0);
  cad.setHours(0, 0, 0, 0);

  const diferencia =
    cad.getTime() -
    hoy.getTime();

  return Math.ceil(
    diferencia /
    (1000 * 60 * 60 * 24)
  );

}

function obtenerEstado(fecha) {

  const dias =
    diasRestantes(fecha);

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
async function añadirProducto() {

  if (!nombre.trim()) return;

  const nuevoProducto = {
  id: Date.now(),
  codigo,
  nombre,
  cantidad: Number(cantidad),
  caducidad,
  ubicacion
};

  setProductos([
    ...productos,
    nuevoProducto
  ]);

  if (codigo && nombre) {

    await db.productos.put({
      codigo,
      nombre
    });

  }

  if (
    modoCompra &&
    productoComprado
  ) {

    setCompra(
      compra.filter(
        (item) =>
          item.id !==
          productoComprado.id
      )
    );

    setModoCompra(false);

    setProductoComprado(
      null
    );

  }

  setCodigo("");
  setNombre("");
  setCantidad(1);
  setCaducidad("");
  setUbicacion("Nevera");


}
async function escanearFoto(event) {

  const archivo = event.target.files[0];

  if (!archivo) return;

  try {

    const url = URL.createObjectURL(archivo);

    const resultado =
      await Quagga.decodeSingle({

        src: url,

        numOfWorkers: 0,

        inputStream: {
          size: 1600
        },

        locator: {
          patchSize: "large",
          halfSample: false
        },

        locate: true,

        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "upc_reader",
            "upc_e_reader",
            "code_128_reader",
            "code_39_reader"
          ]
        }

      });

    if (
      !resultado ||
      !resultado.codeResult
    ) {

      throw new Error(
        "No se pudo leer el código"
      );

    }

    const codigoLeido =
      resultado.codeResult.code;

    setCodigo(codigoLeido);

    // Buscar primero en la base local

    const producto =
      await db.productos.get(
        codigoLeido
      );

    if (producto) {

      setNuevoCompra(
        producto.nombre
      );

      return;

    }

    // Buscar online

    const nombreOnline =
      await buscarProductoOnline(
        codigoLeido
      );

    if (nombreOnline) {

      setNuevoCompra(
        nombreOnline
      );

      // Guardarlo para futuras veces

      await db.productos.put({
        codigo: codigoLeido,
        nombre: nombreOnline
      });

    } else {

      setNuevoCompra(
        codigoLeido
      );

    }

  } catch (error) {

    console.error(error);

    alert(error.message);

  }

}
async function buscarProductoOnline(codigo) {

  try {

    const respuesta =
      await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${codigo}.json`
      );

    const datos =
      await respuesta.json();

    if (datos.status === 1) {

      return (
        datos.product.product_name_es ||
        datos.product.product_name ||
        datos.product.generic_name ||
        null
      );

    }

  } catch (error) {

    console.error(error);

  }

  return null;

}
function consumirProducto(id) {

  const nuevosProductos =
    productos
      .map((p) => {

        if (
          p.id !== id
        ) return p;

        const nuevaCantidad =
          p.cantidad - 1;

        if (
          nuevaCantidad <= 0
        ) {

          const añadir =
            window.confirm(

              `${p.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`

            );

          if (añadir) {

            setCompra(
              (actual) => [

                ...actual,

                {
                  id: Date.now(),
                  nombre: p.nombre
                }

              ]
            );

          }

          return null;

        }

        return {

          ...p,

          cantidad:
            nuevaCantidad

        };

      })
      .filter(Boolean);

  setProductos(
    nuevosProductos
  );

}
function cambiarCantidad(
  id,
  nuevaCantidad
) {

  const producto =
    productos.find(
      (p) => p.id === id
    );

  if (!producto) return;

  if (
    nuevaCantidad <= 0
  ) {

    const añadir =
      window.confirm(

        `${producto.nombre} se ha terminado.\n\n¿Añadir a la lista de la compra?`

      );

    if (añadir) {

      setCompra(
        (actual) => [

          ...actual,

          {
            id: Date.now(),
            nombre:
              producto.nombre
          }

        ]
      );

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
            cantidad:
              nuevaCantidad
          }

        : p

    )

  );

}
function confirmarCompra() {

  if (
    !productoComprado
  ) return;

  setProductos([

    ...productos,

    {
  id: Date.now(),
  nombre: productoComprado.nombre,
  cantidad: Number(cantidadCompra),
  caducidad: caducidadCompra,
  ubicacion: ubicacionCompra
}

  ]);

  setCompra(

    compra.filter(

      (item) =>

        item.id !==
        productoComprado.id

    )

  );

  setMostrarModalCompra(
    false
  );

  setProductoComprado(
    null
  );

  setCantidadCompra(1);

  setCaducidadCompra("");
  
  setUbicacionCompra(
  "Nevera"
);
function diasHasta(fecha) {

  if (!fecha) return 999;

  const hoy = new Date();
  const limite = new Date(fecha);

  hoy.setHours(0,0,0,0);
  limite.setHours(0,0,0,0);

  return Math.ceil(
    (limite - hoy) /
    (1000 * 60 * 60 * 24)
  );

}

}
function añadirTarea() {

  if (!nuevaTarea.trim())
    return;

 setTareas([
  ...tareas,
  {
    id: Date.now(),
    texto: nuevaTarea,
    fecha: fechaTarea,
    hora: horaTarea,
    hecha: false,
    color: "#C7CEEA"
  }
]);

  setNuevaTarea("");
  setFechaTarea("");
  setHoraTarea("");

}

function cambiarEstadoTarea(id) {

  setTareas(

    tareas.map((t) =>

      t.id === id
        ? {
            ...t,
            hecha: !t.hecha
          }
        : t

    )

  );

}

function eliminarTarea(id) {

  setTareas(

    tareas.filter(
      (t) => t.id !== id
    )

  );

}
function formatearFecha(fecha) {

  if (!fecha) return "";

  const [año, mes, dia] =
    fecha.split("-");

  return `${dia}-${mes}-${año.slice(-2)}`;

}

function añadirCompra() {

  if (!nuevoCompra.trim())
    return;

  setCompra([
    ...compra,
    {
      id: Date.now(),
      nombre: nuevoCompra,
      cantidad: cantidadDeseada
    }
  ]);

  setNuevoCompra("");
  setCantidadDeseada(1);

}
function añadirEvento() {

  if (!nuevoEvento.trim())
    return;

  const nuevo = {
    id: Date.now(),
    titulo: nuevoEvento,
    fecha: fechaSeleccionada,
    hora: horaEvento,
    color: colorEvento
  };

  setEventos([
    ...eventos,
    nuevo
  ]);

  setNuevoEvento("");
  setHoraEvento("");
  setColorEvento("#4CAF50");

  setMostrarModalEvento(false);
}
function eliminarEvento(id) {

  const nuevosEventos =
    eventos.filter(
      (evento) =>
        evento.id !== id
    );

  setEventos(nuevosEventos);

  setEventosDia(
    nuevosEventos.filter(
      (evento) =>
        evento.fecha ===
        fechaSeleccionada
    )
  );

}

const total = productos.length;

const ok =
  productos.filter(
    (p) =>
      diasRestantes(
        p.caducidad
      ) > 7
  ).length;

const atencion =
  productos.filter((p) => {

    const d =
      diasRestantes(
        p.caducidad
      );

    return d >= 3 && d <= 7;

  }).length;

const urgente =
  productos.filter((p) => {

    const d =
      diasRestantes(
        p.caducidad
      );

    return d >= 0 && d <= 2;

  }).length;

const caducado =
  productos.filter(
    (p) =>
      diasRestantes(
        p.caducidad
      ) < 0
  ).length;

const [mostrarDetalleDia,
setMostrarDetalleDia] =
useState(false);

const [eventosDia,
setEventosDia] =
useState([]);
  
function abrirDia(fecha) {

  setFechaSeleccionada(fecha);

  const elementosDia = [

    ...eventos
      .filter(
        (evento) =>
          evento.fecha === fecha
      )
      .map((evento) => ({
        ...evento,
        tipo: "evento"
      })),

    ...tareas
      .filter(
        (tarea) =>
          tarea.fecha === fecha &&
          !tarea.hecha
      )
      .map((tarea) => ({
        ...tarea,
        tipo: "tarea"
      })),

    ...productos
      .filter(
        (producto) =>
          producto.caducidad === fecha
      )
      .map((producto) => ({
        ...producto,
        tipo: "caducidad"
      }))

  ].sort((a, b) => {

    if (!a.hora) return 1;
    if (!b.hora) return -1;

    return a.hora.localeCompare(
      b.hora
    );

  });

  setEventosDia(elementosDia);

  setMostrarDetalleDia(true);

}

function abrirNuevoEvento() {

  setMostrarDetalleDia(false);

  setMostrarModalEvento(true);

}
function generarDiasMes() {

  const primerDia = new Date(
    añoActual,
    mesActual,
    1
  );

  const ultimoDia = new Date(
    añoActual,
    mesActual + 1,
    0
  );

  let diaSemana =
    primerDia.getDay();

  if (diaSemana === 0)
    diaSemana = 7;

  const dias = [];

  for (
    let i = 1;
    i < diaSemana;
    i++
  ) {
    dias.push(null);
  }

  for (
    let dia = 1;
    dia <= ultimoDia.getDate();
    dia++
  ) {

    dias.push(
      `${añoActual}-${String(
        mesActual + 1
      ).padStart(2, "0")}-${String(
        dia
      ).padStart(2, "0")}`
    );

  }

  return dias;

}

return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column"
    }}
  >

    {/* CABECERA */}

    <div
      style={{
        background:
          "linear-gradient(135deg,#4CAF50,#2E7D32)",
        color: "white",
        padding: 20,
        textAlign: "center",
        fontSize: 30,
        fontWeight: "bold"
      }}
    >
      🏠 Nevera Inteligente
    </div>

    {/* CONTENIDO */}

    <div
      style={{
        flex: 1,
        padding: 12
      }}
    >

      {pantalla === "nevera" && (

<>
  <h2 style={{ marginBottom: 20 }}>
    🥛 Nevera
  </h2>

{/* AVISO CADUCIDADES */}

<div
  style={{
    background:
      urgente > 0
        ? "#f8d7da"
        : atencion > 0
        ? "#fff3cd"
        : "#d4edda",

    borderRadius: 20,
    padding: 18,
    marginBottom: 25,
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.08)"
  }}
>

  {urgente > 0 && (
    <>
      🔴 Tienes {urgente} productos que caducan en menos de 3 días
    </>
  )}

  {urgente === 0 &&
    atencion > 0 && (
      <>
        🟡 Tienes {atencion} productos que caducan esta semana
      </>
    )}

  {urgente === 0 &&
    atencion === 0 && (
      <>
        🟢 No hay productos próximos a caducar
      </>
    )}

</div>

  {/* HERRAMIENTAS NEVERA */}

<div
  style={{
    background: "#ffffff",
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center"
  }}
>

  <h3
    style={{
      width: "100%",
      margin: 0,
      color: "#374151"
    }}
  >
    🔍 Buscar
  </h3>

  <input
    placeholder="Buscar producto..."
    value={busquedaNevera}
    onChange={(e) =>
      setBusquedaNevera(
        e.target.value
      )
    }
    style={{
      flex: 1,
      minWidth: 250,
      padding: 12,
      borderRadius: 12,
      border: "1px solid #ddd"
    }}
  />

 

</div>

  {/* TABLA */}

  <div
    style={{
      background: "white",
      borderRadius: 20,
      overflow: "hidden"
    }}
  >

    <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center"
  }}
>
      <thead>

  <tr
    style={{
      background: "#f3f4f6"
    }}
  >
    <th style={{ padding: 14 }}>Producto</th>
    <th style={{ padding: 14 }}>Ubicación</th>
    <th style={{ padding: 14 }}>Cantidad</th>
    <th style={{ padding: 14 }}>Caducidad</th>
    <th style={{ padding: 14 }}>Días</th>
    <th style={{ padding: 14 }}>Acción</th>
  </tr>

</thead>

      <tbody>

  {productos
    .filter((producto) =>
      producto.nombre
        .toLowerCase()
        .includes(
          busquedaNevera.toLowerCase()
        )
    )
    .map((producto) => {

      const estado =
        obtenerEstado(
          producto.caducidad
        );

      return (

              <tr
                key={producto.id}
                style={{
                  background: estado.color,
                  borderBottom: "1px solid #e5e7eb"
                }}
              >

                <td style={{ padding: 12 }}>
                {estado.emoji}{" "}
                {producto.nombre}
              </td>

              <td style={{ padding: 12 }}>
                {producto.ubicacion === "Nevera" &&
                  "🥛 Nevera"}

                {producto.ubicacion === "Congelador" &&
                  "❄️ Congelador"}

                {producto.ubicacion === "Armario" &&
                  "🥫 Armario"}
              
              
              </td>

              <td>

                

                  <button
  onClick={() =>
    cambiarCantidad(
      producto.id,
      producto.cantidad - 1
    )
  }
  style={{
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    color: "#6b7280"
  }}
>
  −
</button>

<span
  style={{
    margin: "0 10px",
    fontWeight: "600",
    minWidth: 20,
    display: "inline-block"
  }}
>
  {producto.cantidad}
</span>

<button
  onClick={() =>
    cambiarCantidad(
      producto.id,
      producto.cantidad + 1
    )
  }
  style={{
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 14,
    color: "#6b7280"
  }}
>
  +
</button>

                </td>

                <td style={{ padding: 12 }}>
              {formatearFecha(
                producto.caducidad
              )}
            </td>

                <td>

                  {diasRestantes(
                    producto.caducidad
                  ) < 0
                    ? "Caducado"
                    : diasRestantes(
                        producto.caducidad
                      )}

                </td>

                <td>

                  <button
                    onClick={() =>
                      consumirProducto(
                        producto.id
                      )
                    }
                  >
                    Consumir 1
                  </button>

                </td>

              </tr>

            );

          }
        )}

      </tbody>

    </table>

  </div>

</>

)}

  {pantalla === "compra" && (

<>
  <h2
    style={{
      marginBottom: 20
    }}
  >
    🛒 Lista de la compra
  </h2>

  {/* AÑADIR PRODUCTO */}

  <div
    style={{
      background: "white",
      padding: 20,
      borderRadius: 20,
      marginBottom: 20,
      display: "flex",
      gap: 10,
      alignItems: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
    }}
  >

    <input
  placeholder="Producto"
  value={nuevoCompra}
  onChange={(e) =>
    setNuevoCompra(
      e.target.value
    )
  }
  style={{
    flex: 1,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd"
  }}
/>

<label
  style={{
    background: "#ff9800",
    color: "white",
    padding: "12px 18px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: "bold"
  }}
>
  📦 Escanear

  <input
    type="file"
    accept="image/*"
    capture="environment"
    onChange={escanearFoto}
    hidden
  />
</label>

<input
  type="number"
  min="1"
  value={cantidadDeseada}
  onChange={(e) =>
    setCantidadDeseada(
      Number(e.target.value)
    )
  }
  style={{
    width: 80,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd"
  }}
/>

<button
  onClick={añadirCompra}
  style={{
    background: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: 12,
    padding: "12px 20px",
    cursor: "pointer"
  }}
>
  ➕
</button>

  </div>

  {/* SI NO HAY PRODUCTOS */}

  {compra.length === 0 ? (

    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 20,
        textAlign: "center",
        color: "#666"
      }}
    >
      No hay productos pendientes
    </div>

  ) : (

    <div
      style={{
        background: "white",
        borderRadius: 20,
        overflow: "hidden"
      }}
    >

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr
            style={{
              background: "#f3f4f6"
            }}
          >
            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Producto
            </th>

            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Cantidad
            </th>

            <th
              style={{
                padding: 15,
                textAlign: "center"
              }}
            >
              Acción
            </th>

          </tr>

        </thead>

        <tbody>

          {compra.map((item) => (

            <tr
              key={item.id}
              style={{
                borderTop:
                  "1px solid #eee"
              }}
            >

              <td
                style={{
                  textAlign: "center",
                  padding: 15
                }}
              >
                {item.nombre}
              </td>

              <td
                style={{
                  textAlign: "center",
                  padding: 15,
                  fontWeight: "bold"
                }}
              >
                {item.cantidad || 1}
              </td>

              <td
                style={{
                  textAlign: "center",
                  padding: 15
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 10
                  }}
                >

                  <button
                    onClick={() => {
                      setProductoComprado(item);
                      setMostrarModalCompra(true);
                    }}
                    title="Comprado"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "none",
                      background: "#4CAF50",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold"
                    }}
                  >
                    ✓
                  </button>

                  <button
                    onClick={() =>
                      setCompra(
                        compra.filter(
                          (p) =>
                            p.id !== item.id
                        )
                      )
                    }
                    title="Cancelar"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: "none",
                      background: "#f44336",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 20,
                      fontWeight: "bold"
                    }}
                  >
                    ✕
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )}

</>

)}

     {pantalla === "calendario" && (

<>
  <h2
    style={{
      marginBottom: 20
    }}
  >
    📅 Calendario familiar
  </h2>

 <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    background: "white",
    padding: 15,
    borderRadius: 20
  }}
>

  <button
    onClick={() => {

      if (mesActual === 0) {

        setMesActual(11);
        setAñoActual(añoActual - 1);

      } else {

        setMesActual(
          mesActual - 1
        );

      }

    }}
    style={{
      border: "none",
      background: "#f3f4f6",
      padding: "10px 15px",
      borderRadius: 10,
      cursor: "pointer"
    }}
  >
    ◀
  </button>

  <h3
    style={{
      margin: 0,
      textTransform: "capitalize"
    }}
  >
    {new Date(
      añoActual,
      mesActual
    ).toLocaleDateString(
      "es-ES",
      {
        month: "long",
        year: "numeric"
      }
    )}
  </h3>

  <button
    onClick={() => {

      if (mesActual === 11) {

        setMesActual(0);
        setAñoActual(añoActual + 1);

      } else {

        setMesActual(
          mesActual + 1
        );

      }

    }}
    style={{
      border: "none",
      background: "#f3f4f6",
      padding: "10px 15px",
      borderRadius: 10,
      cursor: "pointer"
    }}
  >
    ▶
  </button>

</div>

 <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: window.innerWidth < 600 ? 4 : 10
  }}
>

    {["L","M","X","J","V","S","D"].map(
      (dia) => (

        <div
          key={dia}
          style={{
            textAlign: "center",
            fontWeight: "bold",
            padding: 10
          }}
        >
          {dia}
        </div>

      )
    )}

    {generarDiasMes().map((dia) => (

      <div
       key={dia || Math.random()}
      onClick={() => {
      if (!dia) return;
      abrirDia(dia);

}}
        style={{
          background: "white",
          borderRadius: 15,
          minHeight: 120,
          padding: 10,
          cursor: "pointer",
          boxShadow:
            "0 2px 6px rgba(0,0,0,0.08)"
        }}
      >

        <div
  style={{
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 22
  }}
>
  {new Date(dia).getDate()}
</div>


{[
  ...eventos
    .filter(
      (evento) =>
        evento.fecha === dia
    )
    .map((evento) => ({
      ...evento,
      tipo: "evento"
    })),

  ...tareas
    .filter(
      (tarea) =>
        tarea.fecha === dia &&
        !tarea.hecha
    )
    .map((tarea) => ({
      ...tarea,
      tipo: "tarea"
    })),

  ...productos
    .filter(
      (producto) =>
        producto.caducidad === dia
    )
    .map((producto) => ({
      ...producto,
      tipo: "caducidad"
    }))
]
.sort((a, b) => {

  if (!a.hora) return 1;
  if (!b.hora) return -1;

  return a.hora.localeCompare(
    b.hora
  );

})
.map((item) => (

  <div
    key={`${item.tipo}-${item.id}`}
    style={{
      background:
  item.tipo === "evento"
    ? item.color
    : item.tipo === "tarea"
    ? "#C7CEEA"
    : "#FFD6E7",

color:
  item.tipo === "evento"
    ? "white"
    : "#333",

      borderRadius: 8,
      padding: "4px 8px",
      marginBottom: 4,
      fontSize: 12,

      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }}
  >

    {item.hora && (
      <>
        🕒 {item.hora}{" "}
      </>
    )}

    {item.tipo === "evento"
  ? `📅 ${item.titulo}`
  : item.tipo === "tarea"
  ? `📝 ${item.texto}`
  : `🧊 ${item.nombre}`}

  </div>

))}
      </div>

    ))}

  </div>
{mostrarDetalleDia && (

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
      zIndex: 9998
    }}
  >

    <div
      style={{
        background: "white",
        padding: 30,
        borderRadius: 25,
        width: 450
      }}
    >

      <h3>
        📅 {fechaSeleccionada}
      </h3>

      {eventosDia.length === 0 ? (

        <p>No hay eventos</p>

      ) : (

       eventosDia
  .sort((a, b) => {

    if (!a.hora) return 1;
    if (!b.hora) return -1;

    return a.hora.localeCompare(
      b.hora
    );

  })
  .map((item) => (

    <div
      key={`${item.tipo}-${item.id}`}
      style={{
        background:
          item.tipo === "evento"
            ? item.color
            : item.tipo === "tarea"
            ? "#C7CEEA"
            : "#FFD6E7",

        color:
          item.tipo === "evento"
            ? "white"
            : "#333",

        padding: 10,
        borderRadius: 10,
        marginBottom: 10,

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}
    >

      <div>

        {item.hora && (

          <div
            style={{
              fontSize: 12,
              marginBottom: 4
            }}
          >
            🕒 {item.hora}
          </div>

        )}

        <div>

          {item.tipo === "evento" &&
            `📅 ${item.titulo}`}

          {item.tipo === "tarea" &&
            `📝 ${item.texto}`}

          {item.tipo === "caducidad" &&
            `🧊 ${item.nombre}`}

        </div>

      </div>

      <div
        style={{
          display: "flex",
          gap: 8
        }}
      >

        {item.tipo === "tarea" && (

          <button
            onClick={() => {
              cambiarEstadoTarea(
                item.id
              );
            }}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "4px 8px",
              cursor: "pointer"
            }}
          >
            ✅
          </button>

        )}

        <button
          onClick={(e) => {

            e.stopPropagation();

            if (
              item.tipo === "evento"
            ) {
              eliminarEvento(
                item.id
              );
            }

            if (
              item.tipo === "tarea"
            ) {
              eliminarTarea(
                item.id
              );
            }

            if (
              item.tipo === "caducidad"
            ) {
              eliminarProducto(
                item.id
              );
            }

          }}
          style={{
            background: "white",
            color: "#f44336",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            padding: "4px 8px"
          }}
        >
          🗑️
        </button>

      </div>

    </div>

))

      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 20
        }}
      >

        <button
          onClick={abrirNuevoEvento}
          style={{
            flex: 1,
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 12,
            padding: 12
          }}
        >
          ➕ Añadir evento
        </button>

        <button
          onClick={() =>
            setMostrarDetalleDia(false)
          }
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12
          }}
        >
          Cerrar
        </button>

      </div>

    </div>

  </div>

)}
  {mostrarModalEvento && (

    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "rgba(0,0,0,0.5)",
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
    borderRadius: 25,
    width: 420,
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.2)"
  }}
>

  <h3
    style={{
      marginTop: 0,
      marginBottom: 5
    }}
  >
    📅 Nuevo evento
  </h3>

  <p
    style={{
      color: "#666",
      marginBottom: 20
    }}
  >
    {fechaSeleccionada}
  </p>

  <input
    placeholder="Nombre del evento"
    value={nuevoEvento}
    onChange={(e) =>
      setNuevoEvento(
        e.target.value
      )
    }
    style={{
      width: "100%",
      padding: 14,
      borderRadius: 12,
      border: "1px solid #ddd",
      marginBottom: 20,
      boxSizing: "border-box"
    }}
  />

<input
  type="time"
  value={horaEvento}
  onChange={(e) =>
    setHoraEvento(
      e.target.value
    )
  }
  style={{
    width: "100%",
    padding: "16px 18px",
    borderRadius: 16,
    border: "2px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 20,
    boxSizing: "border-box"
  }}
/>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 25
    }}
  >

    <span>
      
    </span>

    <div
  style={{
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  }}
>
  {coloresPastel.map((color) => (

    <div
      key={color}
      onClick={() =>
        setColorEvento(color)
      }
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: color,
        cursor: "pointer",
        border:
          colorEvento === color
            ? "3px solid #333"
            : "2px solid white",
        boxShadow:
          "0 2px 6px rgba(0,0,0,0.15)"
      }}
    />

  ))}
</div>

  </div>

  <div
    style={{
      display: "flex",
      gap: 12
    }}
  >

    <button
      onClick={añadirEvento}
      style={{
        flex: 1,
        padding: 14,
        background: "#4CAF50",
        color: "white",
        border: "none",
        borderRadius: 12,
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Guardar
    </button>

    <button
      onClick={() =>
        setMostrarModalEvento(false)
      }
      style={{
        flex: 1,
        padding: 14,
        background: "#f3f4f6",
        border: "1px solid #ddd",
        borderRadius: 12,
        cursor: "pointer"
      }}
    >
      Cancelar
    </button>

  </div>

</div>
    </div>

  )}

</>

)}
 {pantalla === "tareas" && (

  <>

    <h2
      style={{
        marginBottom: 20
      }}
    >
      📝 Tareas
    </h2>

    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 20
      }}
    >

      <input
        value={nuevaTarea}
        onChange={(e) =>
          setNuevaTarea(
            e.target.value
          )
        }
        placeholder="Nueva tarea..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            añadirTarea();
          }
        }}
        style={{
          flex: 1,
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ddd"
        }}
      />

      <input
        type="date"
        value={fechaTarea}
        onChange={(e) =>
          setFechaTarea(
            e.target.value
          )
        }
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid #ddd",
          width: 180
        }}
      />
      <input
  type="time"
  value={horaTarea}
  onChange={(e) =>
    setHoraTarea(e.target.value)
  }
  style={{
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    width: "140px"
  }}
/>

      <button
        onClick={añadirTarea}
        style={{
          background: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: 12,
          padding: "12px 20px",
          fontSize: 20,
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        +
      </button>

    </div>

    {tareas.length === 0 ? (

      <div
        style={{
          background: "white",
          padding: 30,
          borderRadius: 20,
          textAlign: "center",
          color: "#666"
        }}
      >
        No hay tareas
      </div>

    ) : (

      tareas.map((tarea) => (

        <div
  key={tarea.id}
  style={{
    background: tarea.hecha
      ? "#dff5df"
      : "white",

    border: tarea.hecha
      ? "2px solid #4CAF50"
      : "2px solid transparent",

    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    boxShadow:
      "0 2px 6px rgba(0,0,0,0.08)",

    transition: "0.2s"
  }}
>

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: 10
            }}
          >

            <div
              style={{
                flex: 1
              }}
            >

              <div
  style={{
    fontSize: 18,
    fontWeight: 500,

    textDecoration:
      tarea.hecha
        ? "line-through"
        : "none",

    color:
      tarea.hecha
        ? "#666"
        : "#111",

    transition: "0.2s"
  }}
>
  {tarea.texto}
</div>

              {tarea.fecha && (

              <div
  style={{
    fontSize: 13,
    color: "#666",
    marginTop: 6
  }}
>
  📅 {new Date(tarea.fecha)
    .toLocaleDateString("es-ES")}

  {tarea.hora &&
    ` · 🕒 ${tarea.hora}`
  }
</div>

              )}

            </div>

            <button
  onClick={() =>
    cambiarEstadoTarea(
      tarea.id
    )
  }
  style={{
    background: tarea.hecha
      ? "#2e7d32"
      : "#4CAF50",

    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    minWidth: 50
  }}
>
  {tarea.hecha
    ? "✔"
    : "-"}
</button>

            <button
              onClick={() =>
                eliminarTarea(
                  tarea.id
                )
              }
              style={{
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              🗑️
            </button>

          </div>

        </div>

      ))

    )}

  </>

)}

    </div>

    {/* MENÚ INFERIOR */}

    <div
      style={{
        display: "flex",
        background: "white",
        borderTop:
          "1px solid #ddd"
      }}
    >

      <button
        onClick={() =>
          setPantalla("nevera")
        }
        style={{
          flex: 1,
          padding: 18
        }}
      >
        🥛
        <br />
        Nevera
      </button>

      <button
        onClick={() =>
          setPantalla("compra")
        }
        style={{
          flex: 1,
          padding: 18
        }}
      >
        🛒
        <br />
        Compra
      </button>

      <button
        onClick={() =>
          setPantalla("calendario")
        }
        style={{
          flex: 1,
          padding: 18
        }}
      >
        📅
        <br />
        Calendario
      </button>

      <button
        onClick={() =>
          setPantalla("tareas")
        }
        style={{
          flex: 1,
          padding: 18
        }}
      >
        ✅
        <br />
        Tareas
      </button>

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
        width: 420,
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.2)"
      }}
    >

      <h3
        style={{
          marginTop: 0,
          marginBottom: 10,
          fontSize: 24
        }}
      >
        🛒 Producto comprado
      </h3>

      <p
        style={{
          marginTop: 0,
          marginBottom: 20,
          fontSize: 18,
          color: "#374151"
        }}
      >
        {productoComprado?.nombre}
      </p>

      <input
        type="number"
        min="1"
        value={cantidadCompra}
        onChange={(e) =>
          setCantidadCompra(
            e.target.value
          )
        }
        placeholder="Cantidad"
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <input
        type="date"
        value={caducidadCompra}
        onChange={(e) =>
          setCaducidadCompra(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 15,
          boxSizing: "border-box"
        }}
      />

      <select
        value={ubicacionCompra}
        onChange={(e) =>
          setUbicacionCompra(
            e.target.value
          )
        }
        style={{
          width: "100%",
          padding: 14,
          borderRadius: 12,
          border: "1px solid #ddd",
          marginBottom: 20,
          boxSizing: "border-box"
        }}
      >
        <option value="Nevera">
          🥛 Nevera
        </option>

        <option value="Congelador">
          ❄️ Congelador
        </option>

        <option value="Armario">
          🥫 Armario
        </option>
      </select>

      <div
        style={{
          display: "flex",
          gap: 12
        }}
      >

        <button
          onClick={confirmarCompra}
          style={{
            flex: 1,
            padding: 14,
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Guardar
        </button>

        <button
          onClick={() =>
            setMostrarModalCompra(
              false
            )
          }
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            border:
              "1px solid #d1d5db",
            background: "#f3f4f6",
            cursor: "pointer"
          }}
        >
          Cancelar
        </button>

      </div>

    </div>

  </div>

)}
  </div>
);
}