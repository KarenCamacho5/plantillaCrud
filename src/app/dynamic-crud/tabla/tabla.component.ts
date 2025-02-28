import { Component, Input, Output, EventEmitter, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';


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
        if (this.filters[key] === null || this.filters[key] === undefined) return true; // Si el filtro está vacío, no aplicar filtro
  
        console.log(`🔍 Filtrando clave: ${key}, Valor filtro: ${this.filters[key]}, Valor item:`, item[key]);
  
        // 🔥 Filtrar por texto en valores simples
        if (typeof this.filters[key] === 'string' && key !== 'start_date' && key !== 'end_date' && key !== 'questions' && key !== 'file_attachment' && key !== 'terms') {
          return item[key]?.toLowerCase().includes(this.filters[key].toLowerCase());
        }
  
        // 🔥 Filtrar por nombre del archivo
        if (key === 'file_attachment' && item[key]) {
          const fileName = item[key]?.name || ''; // Asegurar que existe `name`
          return fileName.toLowerCase().includes(this.filters[key].toLowerCase());
        }
  
        // 🔥 Filtrar por select
        if (this.config.filters.find(f => f.key === key)?.type === 'select') {
          return item[key] === this.filters[key];
        }
  
        // 🔥 Filtrar por fecha en formato dd/MM/yyyy
        if (this.config.filters.find(f => f.key === key)?.type === 'date') {
          const itemDate = this.parseDate(item[key]); // Convierte la fecha antes de compararla
          const filterDate = this.filters[key];
  
          console.log(`📅 Comparando fechas - Filtro: ${filterDate}, Item: ${itemDate}`);
  
          return itemDate.getTime() === filterDate.getTime();
        }
  
        // 🔥 Filtrar por preguntas (array de objetos con clave 'text')
        if (key === 'questions' && Array.isArray(item[key])) {
          return item[key].some((q: any) => 
            typeof q.text === 'string' && q.text.toLowerCase().includes(this.filters[key].toLowerCase())
          );
        }
  
        // 🔥 Filtrar por checkbox (términos y condiciones)
        if (key === 'terms') {
          return item[key] === this.filters[key]; // Comparación exacta de booleanos
        }
  
        return item[key] === this.filters[key];
      });
    });
  
    console.log("📌 Datos después de filtrar:", this.dataSource.data);
  }
  
  
  
  
  
  
  
  
  
  
  parseDate(dateStr: string): Date {
    const parts = dateStr.split('/'); // Divide "15/04/2020" en ["15", "04", "2020"]
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])); // Año, Mes - 1, Día
  }
  
  
  
  
  
  
  
  
  updateDateFilter(event: any, key: string) {
    if (event) {
      this.filters[key] = new Date(event); // Guarda el filtro como objeto Date
    } else {
      delete this.filters[key]; // Elimina el filtro si no hay fecha seleccionada
    }
  
    console.log(`📌 Filtro de fecha actualizado: ${key} = ${this.filters[key]}`);
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
