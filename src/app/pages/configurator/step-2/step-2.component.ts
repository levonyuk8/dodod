import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  IGroupData,
  ITestOption,
  RadioGroupComponent
} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {debounceTime, distinctUntilChanged, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {BlocksComponent} from './blocks/blocks.component';
import {Slider} from 'primeng/slider';
import {InputText} from 'primeng/inputtext';
import {WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {CheckboxComponent} from '../../../_shared/components/checkbox-group/checkbox.component';

export interface ISR_K {
  SR_K_min: number;
  SR_K_max: number;
}

export enum BlockTypes {
  default = 'default',
  custom = 'custom',
}

@Component({
  selector: 'app-step-2',
  imports: [
    SelectButtonModule,
    FormsModule,
    RadioGroupComponent,
    ReactiveFormsModule,
    BlocksComponent,
    Slider,
    InputText,
    CheckboxComponent
  ],
  templateUrl: './step-2.component.html',
  styleUrl: './step-2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Step2Component implements OnInit {
  cabinetConfiguratorService = inject(CabinetConfiguratorService);
  wardrobeParamsService = inject(WardrobeParamsService);
  destroyRef = inject(DestroyRef);
  changeDetectorRef = inject(ChangeDetectorRef);
  fb = inject(FormBuilder);


  value: any;
  data = this.cabinetConfiguratorService.getWardrobe();

  // blockList: any[] = [];

  public stepTwoForm: FormGroup = this.fb.group({});

  // srL = new FormControl<any>(6);

  // Количество дверей
  numberOfDoors: IGroupData = this.createCountDoorsSliderData();

  // myControlValueSignal!: any;
  isFormValid!: any;

  // @ts-ignore
  test = signal<boolean>(this.stepTwoForm['SR_yaschiki_vneshnie']?.value === '0');

  constructor() {
    // this.myControlValueSignal = toSignal(this.stepTwoForm['SR_yaschiki_vneshnie']?.valueChanges);
  }

  private createAndPatchForm(): void {
    this.stepTwoForm = this.fb.group({
      srK: new FormControl<number>(this.data.SR_K_min),
      SR_yaschiki_vneshnie: new FormControl<number>(0),
      // SR_yaschiki_vneshnie_kol: new FormControl<number>(2),
      SR_tsokol: new FormControl<number>(0),
      SR_niz_dveri: new FormControl<number>(0),
      SR_antr: new FormControl<number>(0),
      SR_H_antr: new FormControl<number>(400),

      SR_antr_blok: new FormControl<number>(0),

      SR_PLANKA: new FormControl<number>(0),
      SR_H_PLANKA_VERH: new FormControl<number>(200),
      SR_PLANKA_VERH_CHENTR: new FormControl<number>(0),
      SR_PLANKA_VERH_LEV: new FormControl<number>(0),
      SR_PLANKA_VERH_PRAV: new FormControl<number>(0),
      SR_PLANKA_BOK_CHENTR: new FormControl<number>(0),
      SR_H_PLANKA_BOK_LEV: new FormControl<number>(0),
      SR_H_PLANKA_BOK_PRAV: new FormControl<number>(0),
    });

    this.stepTwoForm.get('srK')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((val) => {
        this.stepTwoForm.get('SR_yaschiki_vneshnie')?.setValue(0);
        this.updateScheme([]);
      })
    ).subscribe()

    this.stepTwoForm.get('SR_yaschiki_vneshnie')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((val) => {
        if (val = 1) {
          this.stepTwoForm.get('SR_niz_dveri')?.setValue(0);
        }
        console.log('SR_yaschiki_vneshnie', val)
        console.log(this.stepTwoForm.get('SR_yaschiki_vneshnie')?.value.toString() === '0')
        // this.base = this.base;
        console.log('isFormValid', this.test());
        this.test.update(v => !v);
        // todo
        this.baseS.set({
          groupName: "base",
          options: [
            {imgUrl: 'url(/img/svg/B4.svg)', label: 'До цоколя (Открытый цоколь)', value: 0},
            {
              imgUrl: 'url(/img/svg/B5.svg)', label: 'Закрытый цоколь', value: 1,
              disabled: this.test(),
            }
          ]
        });
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe()
    // @ts-ignore


  }

  // Внешние выдвижные ящики
  externalDrawers: IGroupData =
    {
      groupName: "externalDrawers",
      options: [
        {imgUrl: 'url(/img/svg/ED1.svg)', label: 'Нет', value: 0},
        {
          imgUrl: 'url(/img/svg/ED2.svg)', label: 'Да', value: 1,
          disabled: this.data.srL <= 600 || this.data.srG <= 435
        }, // todo
      ]
    }


  // Цоколь

  items4: IGroupData =
    {
      groupName: "test4",
      options: [
        {imgUrl: 'url(/img/svg/B1.svg)', label: 'Боковины до пола', value: 0},
        {imgUrl: 'url(/img/svg/B2.svg)', label: 'С отступами под плинтус', value: 1, disabled: this.data.srL > 2760},
        {imgUrl: 'url(/img/svg/B3.svg)', label: 'Цоколь спереди ножки 100 мм', value: 2},
      ]
    }


  base: IGroupData =
    {
      groupName: "base",
      options: [
        {imgUrl: 'url(/img/svg/B4.svg)', label: 'До цоколя (Открытый цоколь)', value: 0},
        {
          imgUrl: 'url(/img/svg/B5.svg)', label: 'Закрытый цоколь', value: 1,
          disabled: this.test(),
        }
      ]
    }


  baseS = signal(this.base);

  items3: IGroupData =
    {
      groupName: "test3",
      options: [
        {imgUrl: 'url(/img/svg/G42.svg)', label: 'Без антресоли', value: 0},
        {imgUrl: 'url(/img/svg/G43.svg)', label: 'С антресолью', value: 1, disabled: this.data.srH <= 2000},
      ]
    }


  items6: IGroupData =
    {
      groupName: "test6",
      options: [
        {imgUrl: 'url(/img/svg/G44.svg)', label: 'Общая со шкафом', value: 0},
        {imgUrl: 'url(/img/svg/G45.svg)', label: 'Отдельным блоком', value: 1, disabled: true},
      ]
    }

  items7: IGroupData =
    {
      groupName: "test7",
      options: [
        {imgUrl: 'url(/img/svg/G46.svg)', label: 'Нет', value: 0},
        {imgUrl: 'url(/img/svg/G47.svg)', label: 'Да', value: 1},
      ]
    }

  srPlankaVerhLev = {imgUrl: 'url(/img/svg/not.svg)', label: 'Слева', value: 0};
  srPlankaVerhCentr = {imgUrl: 'url(/img/svg/not.svg)', label: 'Спереди', value: 0};
  srPlankaVerhPrav = {imgUrl: 'url(/img/svg/not.svg)', label: 'Справа', value: 0};

  srPlankaBokLev = {imgUrl: 'url(/img/svg/PL.svg)', label: 'Торцом вперед', value: 0};
  srPlankaBokCentr = {imgUrl: 'url(/img/svg/not.svg)', label: 'Сверху', value: 0};
  srPlankaBokPrav = {imgUrl: 'url(/img/svg/PR.svg)', label: 'Торцом вперед', value: 0};


  ngOnInit(): void {
    console.log('ngOnInit', this.data);
    this.createAndPatchForm();

    this.stepTwoForm?.valueChanges.pipe(
      startWith(this.stepTwoForm?.value),
      debounceTime(500),
      distinctUntilChanged(), // Игнорировать повторяющиеся значения
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        console.log('srL change', change);
        // this.createWardrobeScheme(change.srK);
        this.cabinetConfiguratorService.setWardrobe(change, Steps.two);
        // this.changeDetectorRef.detectChanges();

      })
    ).subscribe()
  }


  updateScheme(data: any) {
    this.cabinetConfiguratorService.setWardrobeScheme(data, Steps.two);
  }


  createCountDoorsSliderData() {
    console.log('createCountDoorsSliderData');
    let res: ITestOption[] = []
    for (let i = this.data.SR_K_min; i <= this.data.SR_K_max; i += 1) {
      res?.push(({label: i.toString(), value: i}) as ITestOption)
    }

    return {
      groupName: "test5",
      options: res
    } as IGroupData
  }
}
