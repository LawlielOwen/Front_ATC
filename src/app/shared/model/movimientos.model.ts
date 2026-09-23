export interface Movimientos {
  id_movimiento: number;

  tipo_movimiento: 'Entrada' | 'Salida' | 'Ajuste';

  destino:
    'Almacen' |
    'Pedido' |
    'Demostracion' |
    'Entrega Mostrador' |
    'Cotizacion' |
    'Salida Administrativa';

  cantidad: number;
  fecha: Date | string;

  motivo_salida?: string | null;

  id_producto?: number | null;
  id_demo?: number | null;

  nombre_producto?: string | null;

  Codigo_japon?: string | null;
  Codigo_numeral?: string | null;

  codigo_manual?: string | null;
  descripcion_manual?: string | null;
  extra_descripcion_manual?: string | null;

  marca_producto?: string | null;

  id_asesor?: number | null;
  nombre_asesor?: string | null;

  id_cliente?: number | null;
  nombre_cliente?: string | null;
}