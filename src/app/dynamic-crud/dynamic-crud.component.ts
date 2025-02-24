import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dynamic-crud',
  templateUrl: './dynamic-crud.component.html',
  styleUrls: ['./dynamic-crud.component.css']
})
export class DynamicCrudComponent implements OnInit {
  config: any = {}; // Configuración del CRUD obtenida del archivo JSON
  filters: any = {}; // Almacena los valores de los filtros aplicados
  items: any[] = []; // Lista de elementos originales
  filteredItems: any[] = []; // Lista de elementos después de aplicar los filtros
  selectedItem: any = {}; // Elemento actualmente seleccionado para edición o visualización
  isModalOpen = false; // Controla la apertura y cierre del modal
  isViewMode: boolean = false; // Indica si el modal se abre en modo visualización

  constructor(private http: HttpClient) {}

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Carga la configuración inicial del CRUD desde un archivo JSON.
   */
  ngOnInit() {
    this.loadConfig();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Obtiene la configuración del CRUD desde un archivo JSON y carga los datos iniciales.
   */
  loadConfig() {
    this.http.get<any>('assets/data.json').subscribe(
      (data) => {
        this.config = data.crudConfig;
        this.items = this.config.campaigns || [];
        this.filteredItems = [...this.items];
      },
      (error) => console.error('Error al cargar configuración:', error)
    );
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Abre el modal para crear, editar o ver los detalles de un ítem.
   * @param item - Datos del ítem seleccionado (opcional)
   * @param viewMode - Indica si el modal se abre en modo visualización (por defecto `false`)
   */
  openModal(item: any = {}, viewMode = false) {
    console.log("🟢 Abriendo modal con el siguiente ítem:", item);
    this.selectedItem = item || {}; 

    this.selectedItem = this.config.columns.reduce((acc: any, column: any) => {
      acc[column.key] = item[column.key] !== undefined ? item[column.key] : column.value || '';
      return acc;
    }, {});
  
    console.log("📌 Item seleccionado después de la asignación:", this.selectedItem);
    this.selectedItem = { ...item };
    this.isModalOpen = true;
    this.isViewMode = viewMode;
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Cierra el modal y resetea los valores de la vista.
   */
  closeModal() {
    this.isModalOpen = false;
    this.isViewMode = false;
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Aplica filtros a la lista de elementos para actualizar la tabla.
   */
  applyFilters() {
    this.filteredItems = this.items.filter(item => {
      return Object.keys(this.filters).every(key => {
        if (!this.filters[key]) return true; // Ignora filtros vacíos

        if (typeof this.filters[key] === 'string') {
          return item[key]?.toLowerCase().includes(this.filters[key].toLowerCase());
        }

        return item[key] === this.filters[key];
      });
    });
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Maneja la acción de guardar un nuevo ítem o actualizar uno existente.
   * @param newItem - Datos del ítem guardado
   */
  handleSave(newItem: any) {
    if (newItem.id) {
      // Si el ítem ya existe, lo actualiza en la lista
      const index = this.items.findIndex(item => item.id === newItem.id);
      if (index !== -1) {
        this.items[index] = { ...newItem };
      }
    } else {
      // Si es un nuevo ítem, le asigna un ID único y lo agrega a la lista
      newItem.id = Date.now();
      this.items.push({ ...newItem });
    }

    this.applyFilters(); // Actualizar la tabla con los nuevos datos
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Elimina un ítem de la lista tras confirmación del usuario.
   * @param id - ID del ítem a eliminar
   */
  deleteItem(id: number) {
    const confirmDelete = confirm("¿Estás seguro de eliminar esta campaña?");
    if (confirmDelete) {
      this.items = this.items.filter(item => item.id !== id);
      this.filteredItems = [...this.items]; // Asegurar que la tabla se actualiza correctamente
    }
  }
}
