import { Component, Input, Output, EventEmitter } from '@angular/core'; 
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent {
  @Input() config: any;
  @Input() selectedItem: any = {};  // Elemento seleccionado
  @Input() isViewMode: boolean = false;  // Indica si el modal está en modo visualización
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Cierra el modal de creación/edición o visualización
   */
  closeModal() {
    this.close.emit();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Determina si un campo es obligatorio según la configuración
   * @param field - Clave del campo a evaluar
   * @returns boolean - `true` si el campo es obligatorio, `false` en caso contrario
   */
  isRequired(field: string): boolean {
    return this.config?.columns?.find((col: any) => col.key === field)?.required || false;
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
          data: reader.result, // Guardar el archivo como Base64
          safeUrl: this.sanitizeFileUrl(reader.result as string) // Generar URL segura
        };
        console.log(`Archivo subido (${key}):`, this.selectedItem[key]);
      };
  
      reader.readAsDataURL(file); // Convertir el archivo a Base64
    }
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Convierte la URL del archivo a un formato seguro para Angular
   * @param fileData - Cadena Base64 del archivo
   * @returns SafeUrl - URL segura para incrustar el archivo en Angular
   */
  sanitizeFileUrl(fileData: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileData);
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Actualiza los valores de los checkboxes en selectedItem
   * @param event - Evento de cambio del checkbox
   * @param key - Clave del campo (ejemplo: "agreement")
   * @param option - Opción seleccionada (ejemplo: "Opción 1")
   */
  updateCheckbox(event: any, key: string, option: string) {
    if (!this.selectedItem[key]) {
      this.selectedItem[key] = [];
    }

    if (event.checked) {
      if (!this.selectedItem[key].includes(option)) {
        this.selectedItem[key].push(option);
      }
    } else {
      this.selectedItem[key] = this.selectedItem[key].filter((o: string) => o !== option);
    }

    console.log(`Checkbox actualizado (${key}):`, this.selectedItem[key]);
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

    // Emitir el ítem guardado al componente padre
    this.save.emit(this.selectedItem);
    this.closeModal();
  }

  /**
   * @author Karen Camacho
   * @createdate 2025/02/4
   * Valida que todos los campos obligatorios estén completos
   * @returns boolean - `true` si todos los campos obligatorios están completos, `false` en caso contrario
   */
  isValidForm(): boolean {
    return this.config.columns
      .filter(column => column.required) // Solo validar campos requeridos
      .every(column => {
        const value = this.selectedItem[column.key];

        // Si es un string, verificar que no esté vacío
        if (typeof value === 'string') {
          return value.trim() !== '';
        }

        // Si es un checkbox (array), asegurarse de que tenga al menos una opción seleccionada
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        // Si es un archivo u otro tipo de dato, verificar que no sea null/undefined
        return value !== null && value !== undefined;
      });
  }
}
