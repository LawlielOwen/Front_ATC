import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 
import { toast } from 'ngx-sonner';
import {AsesoresService}from '../../core/services/Asesores.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule, MatDatepickerModule,MatNativeDateModule]
})
export class RegistroPage implements OnInit {
mostrarContra: boolean = false;
  registro = {
    Nombre: '',
    app: '',
    apm:'', 
    Correo: '',
    Telefono: '',
    Contra: '',
    Fecha_nacimiento:'' as any
  };

  constructor(private as: AsesoresService,private router: Router) { }

  ngOnInit() {
  }
private formatearParaBD(fecha: any): string {
    if (!fecha) return '';
    if (typeof fecha === 'string') return fecha.substring(0, 10);
    const d = new Date(fecha);
    const mes = '' + (d.getMonth() + 1);
    const dia = '' + d.getDate();
    const anio = d.getFullYear();

    return [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
  }
registrar() {
  // 1. Limpieza de textos estándar
  this.registro.Nombre = (this.registro.Nombre || '').toString().trim();
  this.registro.app = (this.registro.app || '').toString().trim();
  this.registro.apm = (this.registro.apm || '').toString().trim();
  this.registro.Correo = (this.registro.Correo || '').toString().trim();
  this.registro.Contra = (this.registro.Contra || '').toString().trim();

  const fechaFormateada = this.formatearParaBD(this.registro.Fecha_nacimiento);

  if (
    !this.registro.Nombre || 
    !this.registro.app || 
    !this.registro.apm || 
    !fechaFormateada || 
    !this.registro.Correo || 
    !this.registro.Contra
  ) {
    toast.error('Por favor, completa todos los campos obligatorios.');
    return;
  }

  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexEmail.test(this.registro.Correo)) {
    toast.error('El formato del correo electrónico es incorrecto.');
    return;
  }

  if (this.registro.Telefono && this.registro.Telefono.trim() !== '') {
    let telLimpio = this.registro.Telefono.replace(/[\s\-\(\)\+]/g, '');
    const regexTelefono = /^\d{10,15}$/;
    if (!regexTelefono.test(telLimpio)) {
      toast.error('El teléfono debe ser un número válido de entre 10 y 15 dígitos.');
      return;
    }
    this.registro.Telefono = telLimpio;
  }

  const regexContra = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
  if (!regexContra.test(this.registro.Contra)) {
    toast.error('La contraseña debe tener mínimo 6 caracteres, incluir una mayúscula y un número.');
    return;
  }

  const datosRegistro = {
    ...this.registro,
    Fecha_nacimiento: fechaFormateada
  };

  this.as.registrarAsesor(datosRegistro).subscribe({
    next: (res: any) => {
      const mensajeBackend = res.mensaje || 'Registro completado correctamente.';

      Swal.fire({
        title: '¡Registro Exitoso!',
        text: mensajeBackend,
        icon: 'success',
        confirmButtonText: 'Ir a Iniciar Sesión',
        confirmButtonColor: '#003B8A', 
        allowOutsideClick: false,     
        allowEscapeKey: false,
        heightAuto: false       
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']); 
        }
      });
    },
    error: (err) => {
      console.error('Error en el registro:', err);
      toast.error(err.error?.error || 'Ocurrió un error inesperado al registrar.');
    }
  });
}
}