import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Select} from 'primeng/select';
import {Material, WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Popover} from 'primeng/popover';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {InputText} from 'primeng/inputtext';
import {FileService} from '../../../_services/file.service';
import {ThreeHelperService} from '../../../_services/three-helper.service';
import {debounceTime, filter, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';

@Component({
  selector: 'app-step-4',
  imports: [
    NgOptimizedImage,
    Select,
    ReactiveFormsModule,
    Popover,
    InputText
  ],
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.scss'
})
export class Step4Component implements OnInit {
  cabinetConfiguratorService = inject(CabinetConfiguratorService);
  fb = inject(FormBuilder);

  params = this.cabinetConfiguratorService.getWardrobe();
  stepFourForm: FormGroup = this.fb.group({});
  threeHelperService = inject(ThreeHelperService);
  wps = inject(WardrobeParamsService);
  ccs = inject(CabinetConfiguratorService);
  destroyRef = inject(DestroyRef);

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
    this.threeHelperService.closeDoors();
    this.stepFourForm = this.fb.group({
      managers: new FormControl<number>(1),
      manufacturer: new FormControl<string>('AKS'),
      fastening: new FormControl<number>(1),
      backWallMaterial: new FormControl<number>(2),
      baseColor: new FormControl<string>(''),
      facadeColor: new FormControl<string>(''),
    });
    this.changeForm();
  }

  private changeForm(): void {
    this.stepFourForm?.valueChanges.pipe(
      filter(() => !this.stepFourForm?.invalid),
      startWith(this.stepFourForm.value),
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.ccs.setWardrobe({...change}, Steps.four); // 5 => высота скрытых опор (не отображается в проекте)
      })
    ).subscribe()
  }
}
