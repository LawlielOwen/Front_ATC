# Front_ATC

Frontend del sistema de gestión de ventas e inventario para **ATC (Automatización, Tecnología y Control)**, desarrollado durante mis prácticas profesionales en la sucursal de León, Guanajuato. Interfaz web que consume la API de [Back_ATC](https://github.com/LawlielOwen/Back_ATC) para digitalizar la gestión de clientes, inventario, cotizaciones y pedidos, reemplazando el flujo anterior basado en Excel y procesos manuales.

![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=flat&logo=ionic&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

## 🧩 Stack técnico

- **Framework:** Angular
- **Lenguaje:** TypeScript
- **Componentes UI:** Ionic
- **Estilos:** Tailwind CSS + SCSS
- **Despliegue:** aplicación web, alojada en el servidor de la sucursal

## 🏗️ Arquitectura

Estructura organizada bajo el patrón **Core / Shared / Pages**: separa lo que es único y global del sistema (`core`), lo que se reutiliza en toda la aplicación (`shared`), y lo que pertenece a una vista específica (`pages`).

| Carpeta | Responsabilidad |
|---|---|
| `core/services` | Consumo de peticiones HTTP hacia el backend |
| `core/guard` | Protección de rutas: redirige a la página de no autorizado si se intenta acceder a un recurso no permitido, o solicita reinicio de sesión si el token expiró; valida token y roles antes de permitir el acceso a una ruta |
| `home` | Vista de inicio de la aplicación |
| `pages` | Páginas/vistas de la aplicación, una por cada módulo del sistema |
| `shared` | Elementos reutilizables entre múltiples páginas de la aplicación |
| `shared/components/layout` | Componentes estructurales del sistema: barra de navegación, encabezado, barra lateral, etc. |
| `shared/components/UI` | Resto de componentes reutilizables de interfaz: botones, tarjetas, modales, formularios, tablas, paginación, filtros, etc. |
| `shared/model` | Entidades del sistema |
| `shared/utils` | Alertas del sistema (SweetAlert2) |
| `theme` | Configuración de estilos y tema global |

## 📦 Páginas principales

Cada página consume su módulo correspondiente del backend (ver descripción detallada en el README de [Back_ATC](https://github.com/LawlielOwen/Back_ATC)):

- **Login / Registro** — inicio de sesión y registro de usuarios del sistema
- **Dashboard** — métricas del negocio: cotizado por mes, productos más/menos pedidos, productos estrella, cotizado vs. vendido
- **Productos** — Catálogo, Demos, Visitas
- **Clientes**
- **Cotizaciones**
- **Pedidos**
- **Tickets**
- **Proyectos**
- **Historial E/S**
- **Vales** (de salida)
- **Recepciones**
- **Asesores**
- **No autorizado** — página de error mostrada cuando el guard bloquea el acceso a una ruta

## ⚙️ Variables de entorno

Configura la URL del backend en `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:PORT'
};
```

## 🚀 Instalación

```bash
npm install
ng serve
```

## 🔗 Repositorio relacionado

Backend: [Back_ATC](https://github.com/LawlielOwen/Back_ATC)

## 📌 Estado

Sistema en producción activa, utilizado actualmente por los asesores de la sucursal. Desplegado como aplicación web en el servidor de la sucursal. 
