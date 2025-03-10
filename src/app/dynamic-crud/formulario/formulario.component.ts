import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit, OnChanges {
  @Input() config: any = { columns: [] };
  @Input() selectedItem: any = {};
  @Input() isViewMode: boolean = false;
  @Input() textButtonSubmit: string = 'Guardar';
  @Input() ifFormFilter: boolean = false;
  @Input() alertTextConfirm = '¿Está seguro de enviar las respuestas registradas?';
  @Input() showAlertToCancelButton: boolean = false;
  @Output() viewItem = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() sendQuestions: EventEmitter<any> = new EventEmitter<any>();
  @Output() changeValueSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output() sendIndexField: EventEmitter<number> = new EventEmitter<number>();
  @Output() onClickButtonCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() onClickButtonDeleteFormArray: EventEmitter<FormGroup> = new EventEmitter<FormGroup>();
  @Output() filtersChanged = new EventEmitter<any>(); // Nuevo evento para filtros


  formSurvey: FormGroup;
  pickerRefs: { picker: any }[] = [];
  datePickers: any[] = [];


  constructor(private sanitizer: DomSanitizer, private datePipe: DatePipe) { }

  ngOnInit(): void {
    console.log("⚡ Configuración de columnas:", this.config?.columns);
    console.log("⚡ Inicializando formulario con columnas:", this.config?.columns);
  
    if (!this.config?.columns?.length) {
      console.warn("⚠️ No hay columnas definidas en la configuración.");
      return;
    }
    // Inicializa correctamente los DatePickers con referencias vacías
    this.datePickers = this.config.columns.map(() => ({ picker: null }));

    this.formSurvey.valueChanges.subscribe(values => {
      this.emitFilters(values);
    });
  
    this.initializeForm();
  }
  
  
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.config || changes.selectedItem) {
      this.datePickers = this.config.columns.map(() => ({ picker: null }));
      this.initializeForm();
    }
  }
  
  
  

  getRangeKey(column: any, index: number): string {
    return column?.range?.[index]?.key || ''; // Devuelve un string vacío si no encuentra la clave
  }
  
  private initializeForm(): void {
    console.log("⚡ Inicializando formulario con columnas:", this.config?.columns);
  
    const objectForm: any = {};
  
    this.config?.columns.forEach((item: any) => {
      if (item.typeInput === 'date') {
        objectForm[item.key] = new FormControl(
          this.parseDate(this.selectedItem?.[item.key]), 
          this.generateValidators(item.rules)
        );
      } 
      
      else if (item.typeInput === 'date-range' && item.range?.length === 2) {
        const startDateKey = item.range[0].key;
        const endDateKey = item.range[1].key;
  
        objectForm[item.key] = new FormGroup({
          [startDateKey]: new FormControl(
            this.parseDate(this.selectedItem?.[startDateKey]), 
            this.generateValidators(item.rules?.[startDateKey] || { required: true })
          ),
          [endDateKey]: new FormControl(
            this.parseDate(this.selectedItem?.[endDateKey]), 
            this.generateValidators(item.rules?.[endDateKey] || { required: true })
          )
        });
  
        console.log(`📅 Rango de fechas inicializado: ${startDateKey} y ${endDateKey}`);
      } 
      
      
      else if (item.typeInput === 'array') {
        // ✅ Corrección: No sobrescribir FormArray
        objectForm[item.key] = new FormArray(
          (this.selectedItem?.[item.key] || []).map((value: any) =>
            new FormGroup({
              text: new FormControl(value, this.generateValidators(item.rules))
            })
          )
        );
      }else if (item.typeInput === 'rich-text') {
        objectForm[item.key] = new FormControl(
          this.selectedItem?.[item.key] || '',
          this.generateValidators(item.rules)
        );
      }
      
      
      else {
        // ✅ Solo asignamos un FormControl si no es un FormArray o DateRange
        objectForm[item.key] = new FormControl(
          this.selectedItem?.[item.key] || item.value || '',
          this.generateValidators(item.rules)
        );
      }
    });
  
    // ✅ Evita sobrescribir los FormArray ya creados
    this.config?.columns.forEach((item: any) => {
      if (item.key !== 'actions' && !objectForm[item.key]) {
        objectForm[item.key] = new FormControl(
          { value: this.selectedItem?.[item.key] || '', disabled: this.isViewMode },
          this.generateValidators(item.rules)
        );
      }
    });
  
    this.formSurvey = new FormGroup(objectForm);
    console.log("📌 Formulario construido:", this.formSurvey.value);
  }
  
  

  generateValidators(rules: any): any[] {
    if (!rules) return [];
    const validators = [];
    for (const key in rules) {
      if (key === 'required') validators.push(Validators.required);
      if (key === 'minLength') validators.push(Validators.minLength(rules[key]));
      if (key === 'maxLength') validators.push(Validators.maxLength(rules[key]));
      if (key === 'email') validators.push(Validators.email);
      if (key === 'pattern') validators.push(Validators.pattern(rules[key]));
    }
    return validators;
  }
  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      this.selectedItem[key] = {
        name: file.name,
        file: file,
        safeUrl: this.sanitizer.bypassSecurityTrustUrl(fileUrl) // URL segura para descarga
      };
      this.formSurvey.get(key)?.setValue(file);
    }
  }
  
  

  sanitizeFileUrl(fileData: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(fileData);
  }

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
  }

  getFileUrl(key: string): SafeUrl {
    const file = this.selectedItem[key]?.file;
    if (file) {
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    }
    return '';
  }
  

  
  submitForm(): void {
    if (this.formSurvey.valid) {
      const formattedData = { ...this.formSurvey.value };
  
      this.config.columns.forEach(column => {
        if (column.typeInput === 'date' && formattedData[column.key]) {
          formattedData[column.key] = this.datePipe.transform(formattedData[column.key], 'dd/MM/yyyy');
        }
        
        if (column.typeInput === 'date-range' && formattedData[column.key]) {
          formattedData[column.key].start_date = this.datePipe.transform(formattedData[column.key].start_date, 'dd/MM/yyyy');
          formattedData[column.key].end_date = this.datePipe.transform(formattedData[column.key].end_date, 'dd/MM/yyyy');
        }
      });
  
      console.log("✅ Datos enviados con fecha formateada:", formattedData);
  
      if (!this.ifFormFilter) {
        const confirmSend = window.confirm(this.alertTextConfirm);
        if (confirmSend) {
          this.save.emit(formattedData);
          this.closeModal();
        }
      } else {
        this.save.emit(formattedData);
      }
    } else {
      console.warn("⚠️ Formulario inválido, revisa los errores.");
      this.formSurvey.markAllAsTouched();
    }
  }
  
  
  
  
  closeModal() {
    this.close.emit();
  }

  onChangeValueSelect(event: MatSelectChange, key: string): void {
    this.changeValueSelect.emit({ value: event.value, key });
  }

  onClickShowOrHidePassword(index: number): void {
    this.sendIndexField.emit(index);
  }

  get options() {
    return (key: string) => this.formSurvey.get(key) as FormArray;
  }
  
  addOption(key: string) {
    const formArray = this.formSurvey.get(key);
  
    if (!(formArray instanceof FormArray)) {
      console.error(`❌ El campo "${key}" no es un FormArray.`, formArray);
      return;
    }
  
    formArray.push(
      new FormGroup({
        text: new FormControl(null, Validators.required)
      })
    );
  
    console.log(`✅ Se agregó una nueva opción a "${key}".`);
  }
  
  
  
  
  
  removeOption(key: string, index: number) {
    const confirmDelete = window.confirm('¿Está seguro de eliminar esta pregunta?');
    if (confirmDelete) {
      const fieldSelected = this.options(key).at(index) as FormGroup;
      this.options(key).removeAt(index);
      this.onClickButtonDeleteFormArray.emit(fieldSelected);
    }
  }

  getFormArray(key: string): FormArray {
    const formArray = this.formSurvey.get(key);
  
    if (!(formArray instanceof FormArray)) {
      console.error(`❌ Error: "${key}" no es un FormArray.`, formArray);
      return new FormArray([]); // Evita más errores retornando un FormArray vacío
    }
  
    return formArray;
  }

  getCheckboxValue(key: string): string {
    const value = this.formSurvey.get(key)?.value;
    if (!value) return 'No seleccionado';
  
    return Array.isArray(value) ? value.join(', ') : value;
  }
  

  openViewMode(item: any) {
    this.viewItem.emit(item);  // Emitimos el ítem seleccionado al padre
  }


  parseDate(dateString: any): Date | null {
    if (!dateString) return null; 
  
    if (dateString instanceof Date) return dateString; // Si ya es Date, retornar
  
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map(Number);
      return new Date(year, month - 1, day); // Mes en JavaScript comienza en 0
    }
  
    return null; // En caso de error, devolver null
  }

  emitFilters(values: any) {
    const filters = Object.keys(values).reduce((acc, key) => {
      acc[key] = values[key] || '';
      return acc;
    }, {});
  
    console.log("📌 Emitiendo filtros desde el formulario:", filters);
    this.filtersChanged.emit(filters);
  }
  
  
}