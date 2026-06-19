// ==========================================
// MODELOS PARA ENVIAR DATOS (PAYLOADS)
// ==========================================
export interface ProductoRecepcion {
    id_producto: number;
    cantidad_buena: number; 
    Estatus: number;
    Tipo?: string; 
    cantidad_afectada?: number;
    Descripcion?: string;
}

export interface RecepcionPedidoPayload {
    id_pedido: number;
    id_asesor: number;
    productos: ProductoRecepcion[]; 
}

// ==========================================
// NUEVO: MODELO PARA MOSTRAR EN LA TABLA
// ==========================================
export interface PedidoTabla {
    // 1. Datos crudos que devuelve tu vista SQL (verPedidosGeneral)
    id_pedido: number;
    id_proveedor: number;
    id_asesor: number;
    fecha_solicitud: string; 
    fecha_estimada: string;
    destino: 'Almacen' | 'Pedido' | string;
    Estatus: number;
    alerta_enviada: number;
    nombre_proveedor: string;
    nombre_asesor: string;
    total_modelos_diferentes: number;
    total_piezas: number;

    estatusTexto?: string;
    resumen_modelos?: string;
    resumen_piezas?: string;
    fecha_estimada_formateada?: string;
    fecha_solicitud_formateada?: string;
}