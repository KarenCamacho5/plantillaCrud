import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dynamic-crud',
  templateUrl: './dynamic-crud.component.html',
  styleUrls: ['./dynamic-crud.component.css']
})
export class DynamicCrudComponent implements OnInit {
  isModalOpen = false; // Estado del modal de creación/edición
  submitted = false; // Variable para controlar la validación del formulario
  isEditing: boolean = false;
  @Input() config: any; // Recibe configuración desde el componente padre

  items: any[] = []; // Lista de ítems gestionados
  filteredItems: MatTableDataSource<any> = new MatTableDataSource(); // Fuente de datos filtrados

  filters: any = {}; // Filtros aplicados en la tabla
  displayedColumns: string[] = []; // Columnas a mostrar en la tabla

  selectedItem: any = {}; // Ítem seleccionado para edición o creación

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Referencia al paginador

  form: FormGroup; // Formulario reactivo

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      agreement: this.fb.array([], Validators.required) // Campo de checkbox con validación
    });
  }

  ngOnInit(): void {
    console.log(this.config.initialData); 

    // Inicializa los ítems con datos proporcionados desde el componente padre
    this.items = [...this.config.initialData];

    // Configura la fuente de datos de la tabla
    this.filteredItems = new MatTableDataSource(this.items);

    // Define las columnas a mostrar en la tabla
    this.displayedColumns = this.config.columns.map((col) => col.key).concat('actions');
  }

  ngAfterViewInit() {
    // Asigna el paginador después de que la vista se haya inicializado
    this.filteredItems.paginator = this.paginator;
  }

  /**
   * Aplica los filtros ingresados en la tabla de datos.
   */
  applyFilters(): void {
    const filtered = this.items.filter((item) => {
      return Object.keys(this.filters).every((key) => {
        const filterValue = this.filters[key]?.trim().toLowerCase() || '';
        const itemValue = item[key]?.toString().trim().toLowerCase() || '';

        if (!filterValue) return true;

        if (typeof itemValue === 'string' && key === 'name') {
          return itemValue.includes(filterValue);
        }

        if (key === 'status') {
          return itemValue === filterValue;
        }

        if (key === 'date') {
          const filterDate = new Date(filterValue);
          const itemDate = new Date(itemValue);
          if (!isNaN(filterDate.getTime()) && !isNaN(itemDate.getTime())) {
            return itemDate.toISOString().split('T')[0] === filterDate.toISOString().split('T')[0];
          }
          return false;
        }

        return itemValue === filterValue;
      });
    });

    this.filteredItems.data = filtered;
    console.log('Filtros aplicados:', this.filters);
    console.log('Datos filtrados:', this.filteredItems.data);
  }

  /**
   * Restablece los filtros aplicados en la tabla.
   */
  resetFilters(): void {
    this.filters = {};
    this.applyFilters();
  }

  /**
   * Abre el modal para agregar un nuevo ítem.
   */
  addItem(): void {
    this.isModalOpen = true;
    this.submitted = false; // Reiniciar validación
    this.selectedItem = { agreement: [] }; 
    console.log('Creando nuevo ítem:', this.selectedItem);
  }

  /**
   * Abre el modal para editar un ítem existente.
   */
  editItem(item: any): void {
    this.isModalOpen = true;
    this.submitted = false; // Reiniciar validación
    this.isEditing = true;
    this.selectedItem = { ...item };
    console.log('Editando ítem:', this.selectedItem);
  }

  /**
   * Guarda un ítem nuevo o editado en la lista.
   */
  saveItem(): void {
    this.submitted = true; // Marcar el formulario como enviado para validación

    // if (this.form.invalid) {
    //   return; 
      // No guardar si el formulario es inválido
    // }

    // Validar que el estado haya sido seleccionado
    // if (!this.selectedItem.status) {
    //   alert('Seleccione un estado antes de guardar.');
    //   return;
    // }

    if (this.selectedItem.id) {
      // Editar un ítem existente
      const index = this.items.findIndex((item) => item.id === this.selectedItem.id);
      if (index !== -1) {
        this.items[index] = { ...this.selectedItem };
      }
    } else {
      // Crear un nuevo ítem
      this.selectedItem.id = new Date().getTime();
      this.items.push({ ...this.selectedItem });
    }

    this.isModalOpen = false;
    this.applyFilters();
    localStorage.setItem('crudItems', JSON.stringify(this.items));
  }

  /**
   * Cancela la edición o creación de un ítem.
   */
  cancelEdit(): void {
    this.isModalOpen = false;
    this.submitted = false;
    this.isEditing = false;
    this.selectedItem = {};
  }

  /**
   * Elimina un ítem de la lista.
   */
  deleteItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
    this.applyFilters();
    localStorage.setItem('crudItems', JSON.stringify(this.items));
  }

  /**
   * Maneja la carga de archivos en un campo de tipo file.
   */
  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedItem[key] = file; // Guardar archivo seleccionado en `selectedItem`
    }
  }

  updateCheckbox(event: any, key: string, value: string) {
    if (!this.selectedItem[key]) {
      this.selectedItem[key] = []; // Inicializa como array si no existe
    }
  
    if (event.checked) {
      this.selectedItem[key].push(value); // Agrega el valor seleccionado
    } else {
      this.selectedItem[key] = this.selectedItem[key].filter((v: string) => v !== value); // Elimina el valor desmarcado
    }
  }
  
}
