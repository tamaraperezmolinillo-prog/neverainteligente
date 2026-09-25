import Dexie from "dexie";

export const db = new Dexie("NeveraDB");

db.version(1).stores({
  productos: "codigo,nombre"
});