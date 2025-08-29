import {Component, Input} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

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
    NgOptimizedImage
  ],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss'
})
export class RadioGroupComponent {

  @Input() data!: IGroupData;

  // items1: IGroupData =
  //   {
  //     groupName: "test1",
  //     options: [
  //       {imgUrl: '/img/png/1.png', label: 'Да', value: true},
  //       {imgUrl: '/img/png/2.png', label: 'Нет', value: false},
  //     ]
  //   }
}
