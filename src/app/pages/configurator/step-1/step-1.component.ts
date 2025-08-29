import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Material} from '../../../_services/wardrobe-params.service';
import {Slider} from 'primeng/slider';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';


@Component({
  selector: 'app-step-1',
  imports: [
    FormsModule,
    Slider,
    Select,
    InputText
  ],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss'
})
export class Step1Component {


  housingMaterials: Material[] = [
    {name: '16', code: '16'},
    {name: '18', code: '18'},
  ];

  doorMaterials: Material[] = [
    {name: 'ЛДСП 16мм', code: 'ldsp16'},
    {name: 'ЛДСП 18мм', code: 'ldsp18'},
    {name: 'МДФ 16мм', code: 'mdf16'},
    {name: 'МДФ 19мм', code: 'mdf19'},
  ];


  selectedHousingMaterial: Material | undefined;
  selectedDoorMaterial: Material | undefined;

  value = 0;


}
