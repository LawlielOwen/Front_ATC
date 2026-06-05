import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import { MAT_DATE_LOCALE } from '@angular/material/core';
// 1. IMPORTAMOS EL TOASTER AQUÍ
import { NgxSonnerToaster } from 'ngx-sonner'; 

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    NgxSonnerToaster // 2. LO AGREGAMOS AL ARREGLO DE IMPORTS
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' },
  { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient()
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}