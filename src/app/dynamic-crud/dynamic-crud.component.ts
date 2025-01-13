import { Component,Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dynamic-crud',
  templateUrl: './dynamic-crud.component.html',
  styleUrls: ['./dynamic-crud.component.css']
})
export class DynamicCrudComponent implements OnInit {
  isModalOpen = false;
  @Input() config:any;

  items: any[] = [];
  filteredItems: MatTableDataSource<any>  = new MatTableDataSource();
  filters: any = {}; 
  displayedColumns: string[] =[];
  isEditing: boolean = false;
  selectedItem: any = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit(): void {
    console.log(this.config.initialData); 
    this.items = [...this.config.initialData];
    this.filteredItems =new MatTableDataSource(this.items);
    this.displayedColumns = this.config.columns.map((col)=> col.key).concat('actions')

  }

  ngAfterViewInit() {
    this.filteredItems.paginator = this.paginator;
  }

  applyFilters(): void {
    const filtered = this.items.filter((item) => {
      return Object.keys(this.filters).every((key) => {
        const filterValue = this.filters[key]?.trim().toLowerCase() || ''; // Valor del filtro limpio y en minúsculas
        const itemValue = item[key]?.toString().trim().toLowerCase() || ''; // Valor del ítem limpio y en minúsculas
  
        // Si el filtro está vacío, incluir todos los elementos
        if (!filterValue) return true;
  
        // Comparación insensible a mayúsculas/minúsculas para texto (nombre)
        if (typeof itemValue === 'string' && key === 'name') {
          return itemValue.includes(filterValue); // Contiene el texto del filtro
        }
  
        // Comparación exacta para valores de tipo "select" (estado)
        if (key === 'status') {
          return itemValue === filterValue; // Coincide exactamente
        }
  
        // Comparación para fechas (asegurar formato ISO)
        if (key === 'date') {
          const filterDate = new Date(filterValue);
          const itemDate = new Date(itemValue);
          
          // Si el filtro de fecha es válido, comparamos las fechas en formato ISO sin la parte de la hora
          if (!isNaN(filterDate.getTime()) && !isNaN(itemDate.getTime())) {
            return itemDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0];
          }
          return false; // Si la fecha no es válida, no filtra el ítem
        }
  
        // Comparación exacta por defecto
        return itemValue === filterValue;
      });
    });
  
    // Actualizar los datos filtrados en la tabla
    this.filteredItems.data = filtered;
  
    // Depuración en consola
    console.log('Filtros aplicados:', this.filters);
    console.log('Datos filtrados:', this.filteredItems.data);
  }
  
  
  
  
  
  
  
  
  
  
  

  resetFilters(): void {
    this.filters = {};
    this.applyFilters();
  }
  
  
  
  

  addItem(): void {
    this.isModalOpen = true;
    this.selectedItem = { status: '' }; // Inicializar campo select vacío
    console.log('Creando nuevo ítem:', this.selectedItem);
  }
  
  
  editItem(item: any): void {
    this.isModalOpen = true;
    this.selectedItem = { ...item };  // Mantener valores actuales
    console.log('Editando ítem:', this.selectedItem);
  }
  
  
  saveItem(): void {
    // Validación para asegurarse de que se haya seleccionado un estado
    if (!this.selectedItem.status) {
      alert('Seleccione un estado antes de guardar.');
      return;
    }
  
    console.log('Configuración de columna:', this.config.columns);
    console.log('Selected item:', this.selectedItem);
  
    if (this.selectedItem.id) {
      // Actualizar un ítem existente
      const index = this.items.findIndex((item) => item.id === this.selectedItem.id);
      if (index !== -1) {
        this.items[index] = { ...this.selectedItem };
      }
    } else {
      // Crear un nuevo ítem
      this.selectedItem.id = new Date().getTime();
      this.items.push({ ...this.selectedItem });
    }
  
    this.isModalOpen = false; // Cerrar el modal
    this.applyFilters(); // Actualizar los datos filtrados
    localStorage.setItem('crudItems', JSON.stringify(this.items)); // Guardar en localStorage
  }
  
  
  
  cancelEdit(): void {
    this.isModalOpen = false; // Cerrar el modal
    this.selectedItem = {}; // Limpiar el objeto seleccionado
  }
  

  deleteItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.applyFilters();
    localStorage.setItem('crudItems', JSON.stringify(this.items));
  }


}
