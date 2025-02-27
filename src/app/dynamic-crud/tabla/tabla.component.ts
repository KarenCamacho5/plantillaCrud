import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent implements AfterViewInit, OnChanges {
  @Input() config: any;
  @Input() items: any[] = [];
  @Output() editItem = new EventEmitter<any>(); // Emisor para editar un elemento
  @Output() deleteItem = new EventEmitter<number>();  // Emisor para eliminar un elemento
  @Output() viewItem = new EventEmitter<any>(); // Emisor para visualizar un elemento
  @Output() newItem = new EventEmitter<void>(); // Emisor para agregar un nuevo elemento

  @Input() filters: any = {}; // Recibe los filtros dinámicos desde el formulario
 
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private datePipe: DatePipe) {}

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Configura el paginador después de que la vista se haya inicializado
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Se ejecuta cuando cambian los valores de entrada (@Input).
   * Configura las columnas visibles y actualiza la fuente de datos.
   */
  ngOnChanges() {
    if (!this.config || !this.config.columns) {
      return; // Salir si la configuración aún no está disponible
    }

    if (!this.items) {
      this.items = []; // Evitar errores si no hay datos
    }

    // Definir las columnas visibles en la tabla
    this.displayedColumns = this.config?.columns
      .filter((col: any) => ['name', 'start_date', 'end_date', 'status'].includes(col.key)) // Mostrar solo estas columnas
      .map((col: any) => col.key);

    this.displayedColumns.push('actions'); // Agregar columna de acciones

    // Actualizar la fuente de datos con los elementos actuales
    this.dataSource.data = this.items;

      // Actualizar los datos con los filtros aplicados
  this.applyFilters();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/26
   * Aplica los filtros sobre la lista de elementos y actualiza la tabla.
   */
  applyFilters() {
    console.log("📌 Filtros aplicados:", this.filters);
    console.log("📌 Datos en la tabla antes de filtrar:", this.items);
  
    this.dataSource.data = this.items.filter(item => {
      return Object.keys(this.filters).every(key => {
        if (!this.filters[key]) return true;
  
        // 🔥 Filtrar por texto
        if (typeof this.filters[key] === 'string' && key !== 'start_date' && key !== 'end_date') {
          return item[key]?.toLowerCase().includes(this.filters[key].toLowerCase());
        }
  
        // 🔥 Filtrar por select
        if (this.config.filters.find(f => f.key === key)?.type === 'select') {
          return item[key] === this.filters[key];
        }
  
        // 🔥 Filtrar por fecha en formato dd/MM/yyyy
        if (this.config.filters.find(f => f.key === key)?.type === 'date') {
          const formattedItemDate = new Date(item[key]).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
          console.log(`📅 Comparando fechas - Filtro: ${this.filters[key]}, Item: ${formattedItemDate}`);
          return formattedItemDate === this.filters[key];
        }
  
        return item[key] === this.filters[key];
      });
    });
  
    console.log("📌 Datos después de filtrar:", this.dataSource.data);
  }
  
  
  
  
  updateDateFilter(event: any, key: string) {
    if (event) {
      const formattedDate = new Date(event).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
      this.filters[key] = formattedDate;
    } else {
      this.filters[key] = null;
    }
  
    console.log("📌 Filtro de fecha actualizado:", this.filters);
    this.applyFilters();
  }
  
  
  
  
  

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Reinicia los filtros y muestra todos los datos en la tabla.
   */
  resetFilters() {
    this.filters = {};
    this.applyFilters();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Emite un evento para que el componente padre abra el modal de nueva campaña.
   */
  addItem() {
    this.newItem.emit(); // Emitir evento al padre
  }


  handleAction(action: string, item: any) {
    if (action === 'editItem') {
      this.editItem.emit(item);
    } else if (action === 'deleteItem') {
      this.deleteItem.emit(item.id);
    } else if (action === 'openViewMode') { // 🆕 Modo visualización
      this.viewItem.emit(item);
    }
  }
  
}
