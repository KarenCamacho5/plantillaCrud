import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.css']
})
export class DynamicFormComponent implements OnInit {
  @Input() config: any[] = []; // Configuración del formulario
  @Input() submitButtonLabel = 'Enviar'; // Etiqueta para el botón de envío
  @Output() formSubmit = new EventEmitter<any>(); // Emisión del formulario cuando se envía

  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({});
    this.config.forEach((control) => {
      const validators = this.mapValidators(control.validators || []);
      this.form.addControl(control.name, this.fb.control(control.value || '', validators));
    });
  }

  mapValidators(validators: any[]): any[] {
    const mappedValidators = [];
    validators.forEach((validator) => {
      if (validator.type === 'required') mappedValidators.push(Validators.required);
      if (validator.type === 'minlength') mappedValidators.push(Validators.minLength(validator.value));
      if (validator.type === 'maxlength') mappedValidators.push(Validators.maxLength(validator.value));
      if (validator.type === 'pattern') mappedValidators.push(Validators.pattern(validator.value));
    });
    return mappedValidators;
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.formSubmit.emit(this.form.value); // Emitir el valor del formulario
    }
  }
}


