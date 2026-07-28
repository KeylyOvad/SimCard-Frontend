export interface Sim {
  id_sim?: number;
  num_linea: string;
  operador: string;
  id_operador?: number;   // <-- Agrega esta línea
  operadorId?: number;    // <-- Agrega esta línea
  num_sim: string;
  plan: string;
  capacidad: string;
  responsable: string;
  destino: string;
  estado: string;
}