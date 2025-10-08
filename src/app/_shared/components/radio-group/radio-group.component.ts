import {Component, forwardRef, Input} from '@angular/core';
import {NgClass, NgStyle} from '@angular/common';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Tooltip} from 'primeng/tooltip';

export interface IGroupData {
  groupName: string;
  options: ITestOption[];
}

export interface ITestOption {
  imgUrl?: string;
  label: string;
  value: unknown;
  disabled?: boolean;
  message?: string;
}

@Component({
  selector: 'app-radio-group',
  imports: [
    NgStyle,
    Tooltip
  ],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ]
})
export class RadioGroupComponent implements ControlValueAccessor {
  @Input() ind: number = 0;
  @Input() data!: IGroupData;
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

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(obj: any): void {
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
  }

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    // this.onChange(this.value);
  }

}
