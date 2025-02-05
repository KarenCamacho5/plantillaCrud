import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dynamic-crud',
  templateUrl: './dynamic-crud.component.html',
  styleUrls: ['./dynamic-crud.component.css']
})
export class DynamicCrudComponent implements OnInit {
  config: any = {}; // Configuración del CRUD obtenida de data.json
  filters: any = {}; // Almacena los valores de los filtros de búsqueda
  items: any[] = []; // Lista completa de datos
  filteredItems: any[] = []; // Datos filtrados según los filtros aplicados
  isModalOpen = false; // Estado del modal de creación/edición
  isViewModalOpen = false; // Estado del modal de visualización
  selectedItem: any = {}; // Ítem actualmente seleccionado para edición o creación
  viewItem: any = {}; // Ítem seleccionado para ver detalles
  displayedColumns: string[] = []; // Columnas a mostrar en la tabla
  dataSource = new MatTableDataSource<any>(); // Fuente de datos para la tabla

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Paginador de la tabla

  constructor(private http: HttpClient, private cd: ChangeDetectorRef, private sanitizer: DomSanitizer ) {}

  /** 
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Carga la configuración inicial del CRUD desde el archivo data.json
   */
  ngOnInit() {
    this.loadConfig();
    console.log("Configuración del CRUD:", this.config);
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Obtiene la configuración desde el archivo JSON
   */
  loadConfig() {
    this.http.get<any>('assets/data.json').subscribe(
      (data) => {
        this.config = data.crudConfig;
        this.items = this.config.campaigns || [];
        this.filteredItems = [...this.items];

        // Filtrar columnas visibles en la tabla
        this.displayedColumns = this.config.columns
          .filter(col => ['name', 'date', 'status'].includes(col.key)) // Solo mostramos estas columnas
          .map(col => col.key);

        this.displayedColumns.push('actions'); // Agregar columna de acciones

        // Inicializar la tabla con los datos filtrados
        this.dataSource.data = this.filteredItems;
        this.dataSource.paginator = this.paginator;
      },
      (error) => console.error('Error al cargar configuración:', error)
    );
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Filtra los datos en la tabla según los filtros seleccionados
   */
  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      return Object.keys(this.filters).every(key => {
        if (!this.filters[key]) return true; // Si el filtro está vacío, lo ignora
  
        if (key === 'startDate' || key === 'endDate') {
          // Convertir las fechas a objetos Date
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
  
    this.dataSource.data = this.filteredItems;
  }
  
  

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Reinicia los filtros de búsqueda
   */
  resetFilters() {
    this.filters = {};
    this.applyFilters();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Abre el modal para agregar un nuevo ítem
   */
  addItem() {
    this.selectedItem = {};
    this.isModalOpen = true;
    this.cd.detectChanges(); // Forzar actualización en Angular
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Abre el modal para editar un ítem existente
   * @param item - Ítem a editar
   */
  editItem(item: any) {
    this.selectedItem = { ...item };
    this.isModalOpen = true;
    this.cd.detectChanges();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Guarda un nuevo ítem o actualiza uno existente
   */
  saveItem() {
    if (!this.isValidForm()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }
  
    // Si el campo "comments" está vacío, asignar "Sin comentarios"
    if (!this.selectedItem['comments'] || this.selectedItem['comments'].trim() === '') {
      this.selectedItem['comments'] = 'Sin comentarios';
    }
  
    if (this.selectedItem.id) {
      // Actualizar un ítem existente
      const index = this.items.findIndex(i => i.id === this.selectedItem.id);
      if (index !== -1) this.items[index] = { ...this.selectedItem };
    } else {
      // Crear un nuevo ítem
      this.selectedItem.id = Date.now();
      this.items.push({ ...this.selectedItem });
    }
  
    this.isModalOpen = false;
    this.applyFilters();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Cierra el modal sin guardar cambios
   */
  cancelEdit() {
    this.isModalOpen = false;
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Elimina un ítem de la lista
   * @param id - ID del ítem a eliminar
   */
  deleteItem(id: number) {
    this.items = this.items.filter(item => item.id !== id);
    this.applyFilters();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Maneja el evento de cambio de archivo en el input file
   * @param event - Evento de cambio de archivo
   * @param key - Clave del campo donde se guardará el archivo
   */
  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
  
      reader.onload = () => {
        this.selectedItem[key] = {
          name: file.name,
          data: reader.result // Guardar el archivo como Base64
        };
        console.log(`Archivo subido (${key}):`, this.selectedItem[key]);
      };
  
      reader.readAsDataURL(file); // Convertir el archivo a Base64
    }
  }
  
  

  /**
 * Actualiza los valores de los checkboxes en selectedItem
 * @param event - Evento de cambio del checkbox
 * @param key - Clave del campo (por ejemplo, "agreement")
 * @param option - Opción seleccionada (por ejemplo, "Opción 1")
 */
updateCheckbox(event: any, key: string, option: string) {
  if (!this.selectedItem[key]) {
    this.selectedItem[key] = [];
  }

  if (event.checked) {
    // Agregar la opción si no está presente
    if (!this.selectedItem[key].includes(option)) {
      this.selectedItem[key].push(option);
    }
  } else {
    // Remover la opción si se desmarca
    this.selectedItem[key] = this.selectedItem[key].filter((o: string) => o !== option);
  }

  console.log(`Checkbox actualizado (${key}):`, this.selectedItem[key]); // Verificación en consola
}

  

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Valida que todos los campos obligatorios estén completos
   */
    isValidForm(): boolean {
      for (let column of this.config.columns) {
        if (column.required) {
          const value = this.selectedItem[column.key];

          // Si es un checkbox (array), asegurarse de que tenga al menos una opción seleccionada
          if (column.type === 'checkbox' && (!value || value.length === 0)) {
            console.log(`El campo ${column.key} es obligatorio y está vacío.`);
            return false;
          }

          // Verificar si el valor está vacío o es una cadena vacía
          if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
            console.log(`El campo ${column.key} es obligatorio y está vacío.`);
            return false;
          }
        }
      }
      return true;
    }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Sanear la URL del archivo para evitar bloqueos de Angular
   */
  sanitizeFileUrl(fileData: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(fileData);
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Abre el modal de visualización de campaña
   */
  viewCampaign(item: any) {
    this.viewItem = { ...item };
    
    // Si el item tiene un archivo en Base64, se sanea la URL
    if (this.viewItem.file?.data) {
      this.viewItem.file.safeUrl = this.sanitizeFileUrl(this.viewItem.file.data);
    }

    this.isViewModalOpen = true;
  }

    /**
     * @author Karen Camacho
     * @createdate 2025/02/4
     * Cierra el modal de visualización
     */
    closeViewModal() {
      this.isViewModalOpen = false;
    }

  
}
