import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {NgStyle} from '@angular/common';

interface IGroupData {
  groupName: string;
  options: CheckboxOption[];
}

interface CheckboxOption {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  imgUrl?: string;
}

@Component({
  selector: 'app-checkbox',
  imports: [
    ReactiveFormsModule,
    NgStyle
  ],
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() ind: string = 'checkbox';
  @Input() item!: any;
  @Input() width = 50;
  @Input() height = 100;
  @Input() isRound = false;


  private _value: any;

  get value() {
    return this._value;
  }

  @Input()
  set value(val) {
    this._value = val;
    this.onChange(this._value);
  }

  onChange: any = () => {
  };
  onTouched: any = () => {
  };

  writeValue(obj: any): void {
    console.log('writeValue', obj)
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
    console.log('setDisabledState', isDisabled);
  }

  onInputChange(event: Event): void {
    console.log('onInputChange', event);
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    // this.onChange(this.value);
  }
}
