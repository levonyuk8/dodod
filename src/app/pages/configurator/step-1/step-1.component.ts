import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Material, WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {Slider} from 'primeng/slider';
import {Select} from 'primeng/select';
import {InputText} from 'primeng/inputtext';
import {debounceTime, distinctUntilChanged, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {Steps} from '../../../_shared/components/stepper/stepper.component';


@Component({
  selector: 'app-step-1',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Slider,
    Select,
    InputText
  ],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss'
})
export class Step1Component implements OnInit {

  fb = inject(FormBuilder);
  wps = inject(WardrobeParamsService);
  ccs = inject(CabinetConfiguratorService);
  cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  private readonly defaultSrL = 1600;
  private readonly defaultSrH = 2100;
  private readonly defaultSrG = 520;
  // SR_L: number; //Ширина шкафа
  // SR_H: number; //Высота шкафа
  // SR_G: number; //Глубина шкафа
  // height: number;
  // SR_G_ldsp: Material; //Материал корпуса

  public stepOneForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.createAndPatchForm();
    this.changeForm();
  }

  private createAndPatchForm(): void {
    this.stepOneForm = this.fb.group({
      srL: new FormControl<number>(this.defaultSrL, [
        Validators.required,
        Validators.min(this.wps.SR_L_MIN),
        Validators.max(this.wps.SR_L_MAX)
      ]),
      srH: new FormControl<number>(this.defaultSrH, [
        Validators.required,
        Validators.min(this.wps.SR_H_MIN),
        Validators.max(this.wps.SR_H_MAX)
      ]),
      srG: new FormControl<number>(this.defaultSrG, [
        Validators.required,
        Validators.min(this.wps.SR_G_MIN),
        Validators.max(this.wps.SR_G_MAX)
      ]),
      SR_G_ldsp: new FormControl<string>('mdf16'),
      SR_G_fasad: new FormControl<string>('ldsp16'),
    });
  }

  private changeForm(): void {
    this.stepOneForm?.valueChanges.pipe(
      startWith(this.stepOneForm.value),
      debounceTime(300), // Задержка 300ms
      distinctUntilChanged(), // Игнорировать повторяющиеся значения
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.ccs.setWardrobe(change, Steps.one);

        // return this.ccs.test(change);

      })
    ).subscribe()
  }


  housingMaterials: Material[] = [
    {name: 'МДФ 16мм', code: 'mdf16'},
    {name: 'МДФ 18мм', code: 'mdf18'},
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


  protected readonly tap = tap;
}
