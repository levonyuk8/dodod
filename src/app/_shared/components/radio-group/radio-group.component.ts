import {Component, Input} from '@angular/core';
import {NgClass, NgStyle} from '@angular/common';

export interface IGroupData {
  groupName: string;
  options: ITestOption[];
}

export interface ITestOption {
  imgUrl: string;
  label: string;
  value: unknown
}

@Component({
  selector: 'app-radio-group',
  imports: [
    NgClass,
    NgStyle
  ],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss'
})
export class RadioGroupComponent {

  @Input() data!: IGroupData;
  @Input() width = 50;
  @Input() height = 100;
  @Input() isRound = false;

}
