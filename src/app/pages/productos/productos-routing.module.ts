import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductosPage } from './productos.page';

const routes: Routes = [
  {
    path: '',
    component: ProductosPage
  },  {
    path: 'detalles-producto',
    loadChildren: () => import('./detalles-producto/detalles-producto.module').then( m => m.DetallesProductoPageModule)
  },
  {
    path: 'existencias',
    loadChildren: () => import('./existencias/existencias.module').then( m => m.ExistenciasPageModule)
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductosPageRoutingModule {}
