export interface Pedido {
    id: number;
    id_cotizacion: number;
    fecha_pedido: string | Date; 
    fecha_limite: string | Date;
    Estatus: number; 
    orden_compra?: string;  
    nombre_factura?: string;
    factura_ruta?: string;   
    fecha_factura?: string | Date; 
    alerta_enviada: number;
    id_cliente: number;
    nombre_cliente: string;
    Razon_social: string;
    RFC: string;
    contacto_principal: string;
    correo_contacto: string;

    id_asesor: number;
    nombre_asesor: string;

    estatusTexto?: string; 
}

export interface DetallePedido {
    id_detalle: number;
    id_pedido: number;
    id_producto?: number | null;

    codigo_producto: string; 
    nombre_producto: string;
    extra_descripcion?: string; 
    
    Codigo_numeral?: string;
    Codigo_japon?: string;

    cantidad: number;
    cantidad_surtida: number; 
    precio_unitario: number;
    costo_flete: number;      
    importe: number;        
    estatus_surtido: number;

    moneda?: string;          
    tipo_cambio?: number;     
}

export interface PedidoResponse {
    pedidos: Pedido[];
    total: number;
    paginas: number;
    paginaActual: number;
}