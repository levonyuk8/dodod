import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Select} from 'primeng/select';
import {Material} from '../../../_services/wardrobe-params.service';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Popover} from 'primeng/popover';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';

@Component({
  selector: 'app-step-4',
  imports: [
    NgOptimizedImage,
    Select,
    ReactiveFormsModule,
    Popover
  ],
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.scss'
})
export class Step4Component implements OnInit {

  cabinetConfiguratorService = inject(CabinetConfiguratorService);
  fb = inject(FormBuilder);

  params = this.cabinetConfiguratorService.getWardrobe();
  stepFourForm: FormGroup = this.fb.group({});

  backWallMaterials: Material[] = [
    {name: 'Без задней стенки', value:  1},
    {name: 'В накладку', value: 2},
    {name: 'В четверть', value: 3},
  ];

  list1: Material[] = [
    {name: 'Шариковые', value:  1},
    {name: 'Скрытого монтажа', value: 2},
  ];

  list2: Material[] = [
    {name: 'AKS', code:  'AKS'},
    {name: 'AQ (STEALTH soft)', code:  'AQ (STEALTH soft)'},
    {name: 'Blum', code:  'Blum'},
    {name: 'Boyard', code:  'Boyard'},
    {name: 'DTS', code:  'DTS'},
    {name: 'Firmax', code:  'Firmax'},
    {name: 'GTV', code:  'GTV'},
    {name: 'Hettich', code:  'Hettich'},
  ];

  list3: Material[] = [
    {name: 'Саморез', value:  1},
    {name: 'Евровинт', value: 2},
  ];

  ngOnInit(): void {
    this.stepFourForm = this.fb.group({
      managers: new FormControl<number>(1),
      fastening: new FormControl<number>(1),
      manufacturer: new FormControl<string | null>(null),
      backWallMaterial: new FormControl<number>(2),
      baseColor: new FormControl<string>(''),
      facadeColor: new FormControl<string>(''),
    });
  }
}
