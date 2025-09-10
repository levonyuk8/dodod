import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass} from '@angular/common';
import {ButtonComponent} from '../button/button.component';

export enum Steps {
  one = 1,
  two,
  three,
  four
}

@Component({
  selector: 'app-stepper',
  imports: [
    NgClass,
    ButtonComponent
  ],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.scss'
})
export class StepperComponent {

  @Input() step: Steps = Steps.one;

  @Output() restart = new EventEmitter<void>();

  stepList = [
    {
      name: 'Шаг 1',
      title: 'Размеры и материалы',
      step: Steps.one,
    },
    {
      name: 'Шаг 2',
      title: 'Внешний вид',
      step: Steps.two,
    },
    {
      name: 'Шаг 3',
      title: 'Внутреннее наполнение',
      step: Steps.three,
    },
    {
      name: 'Шаг 4',
      title: 'Дополнительные настройки',
      step: Steps.four,
    }
  ]
}
