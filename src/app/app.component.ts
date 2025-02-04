import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DynamicFormComponent } from './shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crudDinamico';

  // Configuración del CRUD dinámico
  crudConfig = {
    title: 'Gestión de campañas',
    subtitle: 'Aquí podrás ver y gestionar las campañas existentes...',
    itemName: 'Campaña',
    columns: [
      { key: 'name', label: 'Nombre', type: 'text', required: true },
      { key: 'date', label: 'Fecha de creación', type: 'date', required: true },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'Activo', label: 'Activo' },
          { value: 'Inactivo', label: 'Inactivo' },
        ],
        required: true,
      },
      {
        key: 'file',
        label: 'Archivo',
        type: 'file',
        required: true,
      },
      {
        key: 'agreement',
        label: 'Acepto términos',
        type: 'checkbox',
        options: ['Opción 1', 'Opción 2', 'Opción 3'],
        required: true,
      },
      {
        key: 'comments',
        label: 'Comentarios',
        type: 'textarea',
        required: false,
      },
    ],
    filters: [
      { key: 'name', label: 'Campaña', type: 'text' },
      { key: 'date', label: 'Fecha de creación', type: 'date' },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: [
          { value: '', label: 'Todos' },
          { value: 'Activo', label: 'Activo' },
          { value: 'Inactivo', label: 'Inactivo' },
        ],
      },
    ],
    initialData: [
      { id: 1, name: 'Campaña 1', date: '2025-01-10', status: 'Activo' },
      { id: 2, name: 'Campaña 2', date: '2025-01-19', status: 'Inactivo' },
    ],
  };

  // Nuevo formulario dinámico de login
  showLoginForm = false; // Controla la visibilidad del formulario de login

  loginFormConfig = [
    { name: 'username', type: 'text', label: 'Usuario', validators: [{ type: 'required' }] },
    { name: 'password', type: 'password', label: 'Contraseña', validators: [{ type: 'required' }, { type: 'minlength', value: 6 }] },
    { name: 'email', type: 'email', label: 'Correo', validators: [{ type: 'required' }, { type: 'pattern', value: '.+@.+\\..+' }] }
  ];

  constructor() {}

  // Método para mostrar u ocultar el formulario de login
  toggleLoginForm(): void {
    this.showLoginForm = !this.showLoginForm;
  }

  // Método para manejar el envío del formulario de login
  onLoginSubmit(formValue: any): void {
    console.log('Formulario de login enviado:', formValue);
    // Aquí puedes realizar el login o cualquier acción que desees
  }
}
