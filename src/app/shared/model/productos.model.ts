export interface Productos {
    id: number;
    Nombre: string;
    Descripcion: string;
    ExtraDescripcion: string;
    Precio: number;
    Codigo_numeral: string;
    Codigo_japon: string;

    Modelo?: string | null;

    id_estanteria: number | null;
    Estanteria: string | null;

    id_caja: number | null;
    Caja: string | null;

    Stock: number;
    Apartado: number;
    Estatus: number;

    id_marca: number;
    Marca: string;

    origen?: string | null;

    ApartadoComprometido?: number;
    ApartadoLibre?: number;
}

export interface Ubicacion {
    id: number;
    codigo: string;
    descripcion?: string | null;
    estatus?: number;                          // 1 = activo, 0 = inactivo
    fecha_registro?: string | Date | null;
}
export interface PaginacionUbicaciones {
  total: number;
  pagina: number;
  limite: number;
  total_paginas: number;
}

export interface RespuestaUbicaciones {
  ubicaciones: Ubicacion[];
  paginacion: PaginacionUbicaciones;
}
export type Estanteria = Ubicacion;
export type Caja = Ubicacion;