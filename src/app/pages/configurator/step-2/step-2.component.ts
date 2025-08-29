import {Component} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {IGroupData, RadioGroupComponent} from '../../../_shared/components/radio-group/radio-group.component';

@Component({
  selector: 'app-step-2',
  imports: [
    SelectButtonModule,
    FormsModule,
    RadioGroupComponent
  ],
  templateUrl: './step-2.component.html',
  styleUrl: './step-2.component.scss'
})
export class Step2Component {
  value: any;

  items1: IGroupData =
    {
      groupName: "test1",
      options: [
        {imgUrl: '/img/png/1.png', label: 'Да', value: true},
        {imgUrl: '/img/png/2.png', label: 'Нет', value: false},
      ]
    }

  items2: IGroupData =
    {
      groupName: "test2",
      options: [
        {imgUrl: '/img/png/3.png', label: 'До цоколя\n' +
            '(Открытый цоколь)', value: true},
        {imgUrl: '/img/png/4.png', label: 'Нет', value: false},
      ]
    }

  items3: IGroupData =
    {
      groupName: "test3",
      options: [
        {imgUrl: '/img/png/3.png', label: 'Без антресоли', value: true},
        {imgUrl: '/img/png/5.png', label: 'С антресолью', value: false},
      ]
    }
}
