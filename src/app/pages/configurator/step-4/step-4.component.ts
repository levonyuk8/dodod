import {Component, inject} from '@angular/core';
import {ButtonComponent} from "../../../_shared/components/button/button.component";
import {WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';

@Component({
  selector: 'app-step-4',
  imports: [
    ButtonComponent
  ],
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.scss'
})
export class Step4Component {

  cabinetConfiguratorService = inject(CabinetConfiguratorService);
  params = this.cabinetConfiguratorService.getWardrobe();

  docList = [
    'Эскиз для сборки',
    'Список фурнитуры',
    'Деталировка (размеры деталей+оклейка кромкой)',
    'Присадка (места и размеры сверления отверстий)',
    '3-D модель шкафа в программе "Базис Мебельщик"',
  ]
}
