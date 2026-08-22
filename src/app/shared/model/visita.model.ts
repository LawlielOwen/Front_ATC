export interface VisitaDemostracion {
    id_visita: number;
    fecha_visita: string | Date;
    resumen_actividades?: string;
    estatus: number;
    
    id_tecnico: number;
    nombre_tecnico: string;
    
    id_asesor: number;
    nombre_asesor: string;
    
    id_cliente?: number;
    nombre_cliente_oficial?: string;
    empresa_no_registrada?: string;
    
    empresa_destino: string; 
}

export interface DetalleVisitaDemo {
    id_detalle: number;
    id_visita: number;
    id_demo: number;
    cantidad: number;
    estatus_retorno?: string; 
    
    nombre_modelo: string;
    descripcion?: string;
    numero_serie?: string;
    marca_proveedor?: string;
}

export interface RespuestaPaginadaVisitas {
    visitas: VisitaDemostracion[];
    total: number;
    paginas: number;
    paginaActual: number;
}