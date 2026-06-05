import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClientesPage } from './clientes.page';

const routes: Routes = [
  {
    path: '',
    component: ClientesPage
  },  {
    path: 'modal-cliente',
    loadChildren: () => import('./modal-cliente/modal-cliente.module').then( m => m.ModalClientePageModule)
  },
  {
    path: 'detalles-cliente',
    loadChildren: () => import('./detalles-cliente/detalles-cliente.module').then( m => m.DetallesClientePageModule)
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientesPageRoutingModule {}
