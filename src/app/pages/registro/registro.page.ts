import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 
import { toast } from 'ngx-sonner';
import {AsesoresService}from '../../core/services/Asesores.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  // ¡AQUÍ ESTÁ LA MAGIA! Esto soluciona todos los errores rojos del HTML
  imports: [IonicModule, CommonModule, FormsModule, RouterModule] 
})
export class RegistroPage implements OnInit {
mostrarContra: boolean = false;
  // Objeto que coincide con los campos de tu SP (sin rol ni fechas)
  registro = {
    Nombre: '',
    app: '',
    apm:'', 
    Correo: '',
    Telefono: '',
    Contra: '',
    Fecha_nacimiento:''
  };

  constructor(private as: AsesoresService,private router: Router) { }

  ngOnInit() {
  }

registrar() {
    // 1. Limpieza de espacios (Actualizado con los nuevos campos)
    this.registro.Nombre = (this.registro.Nombre || '').toString().trim();
    this.registro.app = (this.registro.app || '').toString().trim();
    this.registro.apm = (this.registro.apm || '').toString().trim();
    this.registro.Correo = (this.registro.Correo || '').toString().trim();
    this.registro.Contra = (this.registro.Contra || '').toString().trim();
    // La fecha viene del input type="date", pero la aseguramos
    this.registro.Fecha_nacimiento = (this.registro.Fecha_nacimiento || '').toString().trim();

    // 2. Validación estricta de campos vacíos (Ahora exige los apellidos separados y la fecha)
    if (
      !this.registro.Nombre || 
      !this.registro.app || 
      !this.registro.apm || 
      !this.registro.Fecha_nacimiento || 
      !this.registro.Correo || 
      !this.registro.Contra
    ) {
      toast.error('Por favor, completa todos los campos obligatorios.');
      return;
    }

    // 3. Validación de Correo
    const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regexEmail.test(this.registro.Correo)) {
      toast.error('El formato del correo electrónico es incorrecto.');
      return;
    }

    // 4. Validación de Teléfono (Sigue siendo opcional, pero estricto si lo llenan)
    if (this.registro.Telefono && this.registro.Telefono.trim() !== '') {
      let telLimpio = this.registro.Telefono.replace(/[\s\-\(\)\+]/g, '');
      const regexTelefono = /^\d{10,15}$/;
      if (!regexTelefono.test(telLimpio)) {
        toast.error('El teléfono debe ser un número válido de entre 10 y 15 dígitos.');
        return;
      }
      this.registro.Telefono = telLimpio;
    }

    // 5. Validación de Contraseña
    const regexContra = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    if (!regexContra.test(this.registro.Contra)) {
      toast.error('La contraseña debe tener mínimo 6 caracteres, incluir una mayúscula y un número.');
      return;
    }

    // 6. Envío al Backend y Alerta de Éxito
    this.as.registrarAsesor(this.registro).subscribe({
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