import { Injectable } from '@angular/core';
import {AbstractControl, FormGroup} from '@angular/forms';
import {debounceTime} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormCorrectionService {
  correctNumberValue(
    control: AbstractControl,
    value: number,
    min: number,
    max: number
  ): number {
    if (value < min) {
      control.setValue(min, { emitEvent: true });
      return min;
    } else if (value > max) {
      control.setValue(max, { emitEvent: true });
      return max;
    }
    return value;
  }

  setupRangeCorrection(
    form: FormGroup,
    controlName: string,
    min: number,
    max: number
  ) {
    const control = form.get(controlName);

    control?.valueChanges
      .pipe(
        debounceTime(1000),
      )
      .subscribe(value => {
      if (value !== null && value !== undefined) {
        this.correctNumberValue(control, value, min, max);
      }
    });
  }
}
