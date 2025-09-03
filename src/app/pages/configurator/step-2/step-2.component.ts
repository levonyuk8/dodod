import {Component} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {IGroupData, RadioGroupComponent} from '../../../_shared/components/radio-group/radio-group.component';
import {InputText} from 'primeng/inputtext';
import {Slider} from 'primeng/slider';

@Component({
  selector: 'app-step-2',
  imports: [
    SelectButtonModule,
    FormsModule,
    RadioGroupComponent,
    InputText,
    Slider
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
        {imgUrl: 'url(/img/png/1.png)', label: 'Да', value: true},
        {imgUrl: 'url(/img/png/2.png)', label: 'Нет', value: false},
      ]
    }

  items2: IGroupData =
    {
      groupName: "test2",
      options: [
        {imgUrl: 'url(/img/png/3.png)', label: 'До цоколя (Открытый цоколь)', value: true},
        {imgUrl: 'url(/img/png/4.png)', label: 'Закрытый цоколь', value: false},
      ]
    }

  items3: IGroupData =
    {
      groupName: "test3",
      options: [
        {imgUrl: 'url(/img/png/3.png)', label: 'Без антресоли', value: true},
        {imgUrl: 'url(/img/png/5.png)', label: 'С антресолью', value: false},
      ]
    }

  items4: IGroupData =
    {
      groupName: "test4",
      options: [
        {imgUrl: 'url(/img/png/6.png)', label: 'Боковины до пола', value: 1},
        {imgUrl: 'url(/img/png/7.png)', label: 'С отступами под плинтус', value: 2},
        {imgUrl: 'url(/img/png/8.png)', label: 'Цоколь спереди ножки 100 мм', value: 3},
      ]
    }

  items5: IGroupData =
    {
      groupName: "test5",
      options: [
        {imgUrl: '', label: '1', value: 1},
        {imgUrl: '', label: '2', value: 2},
        {imgUrl: '', label: '3', value: 3},
        {imgUrl: '', label: '4', value: 4},
      ]
    }

  items6: IGroupData =
    {
      groupName: "test6",
      options: [
        {imgUrl: 'url(/img/png/9.png)', label: 'Общая со шкафом', value: 1},
        {imgUrl: 'url(/img/png/10.png)', label: 'Отдельным блоком', value: 2},
      ]
    }

  items7: IGroupData =
    {
      groupName: "test7",
      options: [
        {imgUrl: 'url(/img/png/11.png)', label: 'Да', value: 1},
        {imgUrl: 'url(/img/png/12.png)', label: 'Нет', value: 2},
      ]
    }

  items8: IGroupData =
    {
      groupName: "test8",
      options: [
        {imgUrl: 'url(/img/png/13.png)', label: 'Нет', value: 1},
        {imgUrl: 'url(/img/png/14.png)', label: 'Плоскостью вперед', value: 2},
        {imgUrl: 'url(/img/png/15.png)', label: 'Торцом вперед', value: 3},
      ]
    }
}
