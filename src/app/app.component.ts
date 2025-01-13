import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'crudDinamico';
  crudConfig = {
    title: 'Gestión de campañas',
    subtitle:
      'Aquí podrás ver y gestionar las campañas existentes, editarlas, activarlas o inactivarlas. No olvides, "La organización es esencial para el éxito".',
    itemName: 'Campaña',
    columns: [
      { key: 'name', label: 'Nombre', type: 'text' },
      { key: 'date', label: 'Fecha de creación', type: 'date' },
      {
      key: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'Activo', label: 'Activo' },
        { value: 'Inactivo', label: 'Inactivo' },
      ],
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
  
}
