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

  filters: any = {}; // Almacena los valores de los filtros aplicados
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
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Aplica los filtros sobre la lista de elementos y actualiza la tabla.
   */
  applyFilters() {
    this.dataSource.data = this.items.filter(item => {
      return Object.keys(this.filters).every(key => {
        if (!this.filters[key]) return true; // Si el filtro está vacío, no se aplica

        if (key === 'startDate' || key === 'endDate') {
          const itemDate = new Date(item.date);
          const startDate = this.filters.startDate ? new Date(this.filters.startDate) : null;
          const endDate = this.filters.endDate ? new Date(this.filters.endDate) : null;

          if (startDate && itemDate < startDate) return false;
          if (endDate && itemDate > endDate) return false;
          return true;
        }

        if (key === 'status') {
          // Verificar si el estado seleccionado es válido
          return item.status === this.filters.status;
        }

        if (typeof item[key] === 'string') {
          return item[key].toLowerCase().includes(this.filters[key].toLowerCase());
        }

        return item[key] === this.filters[key];
      });
    });
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
