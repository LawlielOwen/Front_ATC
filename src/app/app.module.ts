import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
// 1. Agregamos withInterceptors aquí
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { NgxSonnerToaster } from 'ngx-sonner'; 

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// 2. Importamos tu interceptor con la ruta relativa correcta
import { authTokenInterceptor } from './core/guard/Authtoken.interceptor';
import { authErrorInterceptor } from './core/guard/Auth error.interceptor';

registerLocaleData(localeEs);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule,
    NgxSonnerToaster 
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'es-MX' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // 3. Modificamos el provideHttpClient para inyectar el interceptor
   provideHttpClient(withInterceptors([authTokenInterceptor, authErrorInterceptor]))
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}