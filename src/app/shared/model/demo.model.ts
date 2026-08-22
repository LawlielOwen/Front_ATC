export interface StockDemo {
    id_demo: number;
    nombre_modelo: string;
    descripcion?: string;
    numero_serie?: string;
    stock: number;
    estatus: number; 
    
    id_marca?: number;
    marca_proveedor?: string;
}

export interface RespuestaPaginadaDemos {
    demos: StockDemo[];
    total: number;
    paginas: number;
    paginaActual: number;
}