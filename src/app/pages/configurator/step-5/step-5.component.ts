import {Component, inject, OnInit, signal} from '@angular/core';
import {ButtonComponent} from "../../../_shared/components/button/button.component";
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {InputText} from 'primeng/inputtext';
import {Material} from '../../../_services/wardrobe-params.service';
import {ThreeHelperService} from '../../../_services/three-helper.service';

@Component({
  selector: 'app-step-5',
  imports: [
    ButtonComponent,
    InputText
  ],
  templateUrl: './step-5.component.html',
  styleUrl: './step-5.component.scss'
})
export class Step5Component implements OnInit {
  cabinetConfiguratorService = inject(CabinetConfiguratorService);
  threeHelperService = inject(ThreeHelperService);

  calc = signal(this.cabinetConfiguratorService.calcPrice())

  ngOnInit(): void {
    this.threeHelperService.closeDoors();
  }
  params = this.cabinetConfiguratorService.getWardrobe();

  docList = [
    'Эскиз для сборки',
    'Список фурнитуры',
    'Деталировка (размеры деталей+оклейка кромкой)',
    'Присадка (места и размеры сверления отверстий)',
    '3-D модель шкафа в программе "Базис Мебельщик"',
  ]

  housingMaterials: Material[] = [
    {name: 'ЛДСП 16мм', code: 'ldsp16'},
    {name: 'ЛДСП 18мм', code: 'ldsp18'},
  ];

  getHousingMaterialsLabel(code: string): string {
    return this.housingMaterials.find(mat => mat.code === code)?.name || '';

  }

  doorMaterials: Material[] = [
    {name: 'ЛДСП 16мм', code: 'ldsp16'},
    {name: 'ЛДСП 18мм', code: 'ldsp18'},
    {name: 'МДФ 16мм', code: 'mdf16'},
    {name: 'МДФ 19мм', code: 'mdf19'},
  ];

  getDoorMaterialsLabel(code: string): string {
    return this.doorMaterials.find(mat => mat.code === code)?.name || '';

  }
}
