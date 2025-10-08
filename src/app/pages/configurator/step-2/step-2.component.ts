import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {SelectButtonModule} from 'primeng/selectbutton';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  IGroupData,
  ITestOption,
  RadioGroupComponent
} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {combineLatest, debounceTime, distinctUntilChanged, forkJoin, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {BlocksComponent} from './blocks/blocks.component';
import {Slider} from 'primeng/slider';
import {InputText} from 'primeng/inputtext';
import {WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {CheckboxComponent} from '../../../_shared/components/checkbox-group/checkbox.component';
import {ThreeHelperService} from '../../../_services/three-helper.service';

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
  threeHelper = inject(ThreeHelperService);
  destroyRef = inject(DestroyRef);
  changeDetectorRef = inject(ChangeDetectorRef);
  fb = inject(FormBuilder);


  value: any;
  data = this.cabinetConfiguratorService.getWardrobe();

  public stepTwoForm: FormGroup = this.fb.group({});

  // Количество дверей
  numberOfDoors: IGroupData = this.createCountDoorsSliderData();

  isFormValid!: any;

  // @ts-ignore TODO ADD FOR 25MM
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
      SR_antr: new FormControl<number>(this.data.srH >= this.wardrobeParamsService.SR_H_MAX_FASAD ? 1 : 0),
      SR_H_antr: new FormControl<number>(400),

      SR_antr_blok: new FormControl<number>(this.data.srH > this.wardrobeParamsService.SR_H_MAX_BOK ? 1 : 0),

      SR_PLANKA: new FormControl<number>(0),
      SR_H_PLANKA_VERH: new FormControl<number>(200),
      SR_PLANKA_VERH_CHENTR: new FormControl<boolean>(false),
      SR_PLANKA_VERH_LEV: new FormControl<boolean>(false),
      SR_PLANKA_VERH_PRAV: new FormControl<boolean>(false),
      SR_PLANKA_BOK_CHENTR: new FormControl<boolean>(false),
      SR_H_PLANKA_BOK_LEV: new FormControl<boolean>(false),
      SR_H_PLANKA_BOK_PRAV: new FormControl<boolean>(false),
    });

    this.stepTwoForm.get('SR_antr')?.valueChanges.pipe(
      tap(data => {
        if (this.stepTwoForm.get('SR_antr')?.value === '0') {
          this.stepTwoForm.get('SR_antr')?.setValue(0);
        }
        // if (data && this.stepTwoForm.get('SR_PLANKA_BOK_CHENTR')?.value) {
        //   this.stepTwoForm.get('SR_PLANKA_BOK_CHENTR')?.setValue(false);
        //   this.stepTwoForm.get('SR_H_PLANKA_BOK_LEV')?.setValue(false);
        //   this.stepTwoForm.get('SR_H_PLANKA_BOK_PRAV')?.setValue(false);
        // }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_PLANKA_VERH_CHENTR')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_PLANKA_BOK_CHENTR')?.value) {
          this.stepTwoForm.get('SR_PLANKA_BOK_CHENTR')?.setValue(false);
          this.stepTwoForm.get('SR_H_PLANKA_BOK_LEV')?.setValue(false);
          this.stepTwoForm.get('SR_H_PLANKA_BOK_PRAV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_PLANKA_BOK_CHENTR')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_PLANKA_VERH_CHENTR')?.value) {
          this.stepTwoForm.get('SR_PLANKA_VERH_CHENTR')?.setValue(false);
          this.stepTwoForm.get('SR_PLANKA_VERH_LEV')?.setValue(false);
          this.stepTwoForm.get('SR_PLANKA_VERH_PRAV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_PLANKA_VERH_LEV')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_H_PLANKA_BOK_LEV')?.value) {
          this.stepTwoForm.get('SR_H_PLANKA_BOK_LEV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_H_PLANKA_BOK_LEV')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_PLANKA_VERH_LEV')?.value) {
          this.stepTwoForm.get('SR_PLANKA_VERH_LEV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_PLANKA_VERH_PRAV')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_H_PLANKA_BOK_PRAV')?.value) {
          this.stepTwoForm.get('SR_H_PLANKA_BOK_PRAV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('SR_H_PLANKA_BOK_PRAV')?.valueChanges.pipe(
      tap(data => {
        if (data && this.stepTwoForm.get('SR_PLANKA_VERH_PRAV')?.value) {
          this.stepTwoForm.get('SR_PLANKA_VERH_PRAV')?.setValue(false);
        }
      })
    ).subscribe()

    this.stepTwoForm.get('srK')?.valueChanges.pipe(
      startWith(this.stepTwoForm.get('srK')?.value),
      takeUntilDestroyed(this.destroyRef),
      tap((val) => {
        // this.threeHelper.addDoorsToCabinet(val);

        this.stepTwoForm.get('SR_yaschiki_vneshnie')?.setValue(0);
        this.updateScheme([]);
        // this.([]);
        this.externalDrawers = {
          groupName: "externalDrawers",
          options: [
            {imgUrl: 'url(/img/svg/ED1.svg)', label: 'Нет', value: 0},
            {
              imgUrl: 'url(/img/svg/ED2.svg)', label: 'Да', value: 1,
              disabled: this.data.srL <= 600
                || this.data.srG <= this.wardrobeParamsService.SR_G_MIN_VNESH_YASHCHIK
                || this.data.wSect >= this.wardrobeParamsService.SR_L_MAX_VNESH_YASHCHIK / 2,//??
              message: this.externalDrawersMessageByCondition()
            }, // todo
          ]
        }
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe()

    this.stepTwoForm.get('SR_yaschiki_vneshnie')?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((val) => {
        if (val !== 0) {
          // alert('alarm');
          this.stepTwoForm.get('SR_niz_dveri')?.setValue(0);
        }
        this.updateScheme([]);
        this.test.update(v => !v);
        // todo
        this.baseS.set({
          groupName: "base",
          options: [
            {imgUrl: 'url(/img/svg/B4.svg)', label: 'Открытый цоколь', value: 0},
            {
              imgUrl: 'url(/img/svg/B5.svg)', label: 'Закрытый цоколь', value: 1,
              disabled: this.test(),
              message: `Защита от ошибок: Недопустимо при наличии внешних выдвижных ящиков`
            }
          ]
        });
        this.changeDetectorRef.detectChanges();
      })
    ).subscribe()
    // @ts-ignore


  }

  // Внешние выдвижные ящики
  readonly externalDrawersErrMesG = `"Защита от ошибок: Нельзя сделать внешние ящики при глубине менее
${this.wardrobeParamsService.SR_G_MIN_VNESH_YASHCHIK} мм"`
  readonly externalDrawersErrMesWF = `Защита от ошибок: Внешние ящики не могут быть более
  ${this.wardrobeParamsService.SR_L_MAX_VNESH_YASHCHIK}`


  externalDrawersMessageByCondition() {
    if (this.data.srG <= this.wardrobeParamsService.SR_G_MIN_VNESH_YASHCHIK) {
      return this.externalDrawersErrMesG;
    }
    if (this.data.wSect >= this.wardrobeParamsService.SR_L_MAX_VNESH_YASHCHIK / 2) {
      return this.externalDrawersErrMesWF;
    }
    return '';
  }

  externalDrawers: IGroupData =
    {
      groupName: "externalDrawers",
      options: [
        {imgUrl: 'url(/img/svg/ED1.svg)', label: 'Нет', value: 0},
        {
          imgUrl: 'url(/img/svg/ED2.svg)', label: 'Да', value: 1,
          disabled: this.data.srL <= 600
            || this.data.srG <= this.wardrobeParamsService.SR_G_MIN_VNESH_YASHCHIK
            || this.data.wSect >= this.wardrobeParamsService.SR_L_MAX_VNESH_YASHCHIK / 2,//??
          message: this.externalDrawersMessageByCondition()
        }, // todo
      ]
    }


  // Цоколь

  items4: IGroupData =
    {
      groupName: "test4",
      options: [
        {imgUrl: 'url(/img/svg/B1.svg)', label: 'Боковины до пола', value: 0},
        {
          imgUrl: 'url(/img/svg/B2.svg)', label: 'С отступами под плинтус по 25 мм', value: 1,
          disabled: this.data.srL > this.wardrobeParamsService.SR_H_MAX_BOK,
          message: `Защита от ошибок: Недопустимо при ширине шкафа более ${this.wardrobeParamsService.SR_H_MAX_BOK} мм`,
        }
        // {imgUrl: 'url(/img/svg/B3.svg)', label: 'Цоколь спереди ножки 100 мм', value: 2},
      ]
    }


  base: IGroupData =
    {
      groupName: "base",
      options: [
        {imgUrl: 'url(/img/svg/B4.svg)', label: 'Открытый цоколь', value: 0},
        {
          imgUrl: 'url(/img/svg/B5.svg)', label: 'Закрытый цоколь', value: 1,
          disabled: this.test(),
          message: `Защита от ошибок: Недопустимо при наличии внешних выдвижных ящиков`
        }
      ]
    }


  baseS = signal(this.base);

  items3: IGroupData =
    {
      groupName: "test3",
      options: [
        {
          imgUrl: 'url(/img/svg/G42.svg)', label: 'Без антресоли', value: 0,
          disabled: this.data.srH >= this.wardrobeParamsService.SR_H_MAX_FASAD,
          message: `Защита от ошибок: Большая высота. Сделать без антресоли нельзя`
        },
        {
          imgUrl: 'url(/img/svg/G43.svg)', label: 'С антресолью', value: 1,
          disabled: this.data.srH <= this.wardrobeParamsService.SR_H_MIN_S_ANTR,
          message: `Защита от ошибок: Маленькая высота. Сделать с антресолью нельзя`
        },
      ]
    }


  items6: IGroupData =
    {
      groupName: "test6",
      options: [
        {
          imgUrl: 'url(/img/svg/G44.svg)', label: 'Общая со шкафом', value: 0,
          disabled: this.data.srH > this.wardrobeParamsService.SR_H_MAX_BOK,
          message: `Защита от ошибок: Большая высота шкафа! Сделать антресоль общую со шкафом нельзя`
        },
        {
          imgUrl: 'url(/img/svg/G45.svg)', label: 'Отдельным блоком', value: 1
        },
      ]
    }

  // items7: IGroupData =
  //   {
  //     groupName: "test7",
  //     options: [
  //       {imgUrl: 'url(/img/svg/G46.svg)', label: 'Нет', value: 0},
  //       {imgUrl: 'url(/img/svg/G47.svg)', label: 'Да', value: 1},
  //     ]
  //   }

  srPlankaVerhLev = {imgUrl: 'url(/img/svg/not.svg)', label: 'Слева', value: false};
  srPlankaVerhCentr = {imgUrl: 'url(/img/svg/not.svg)', label: 'Спереди', value: false};
  srPlankaVerhPrav = {imgUrl: 'url(/img/svg/not.svg)', label: 'Справа', value: false};

  srPlankaBokLev = {imgUrl: 'url(/img/svg/PL.svg)', label: 'Торцом вперед', value: false};
  srPlankaBokCentr = {imgUrl: 'url(/img/svg/not.svg)', label: 'Сверху', value: false};
  srPlankaBokPrav = {imgUrl: 'url(/img/svg/PR.svg)', label: 'Торцом вперед', value: false};


  ngOnInit(): void {
    this.createAndPatchForm();

    this.stepTwoForm?.valueChanges.pipe(
      startWith(this.stepTwoForm?.value),
      // debounceTime(800),
      distinctUntilChanged(), // Игнорировать повторяющиеся значения
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.cabinetConfiguratorService.setWardrobe(change, Steps.two);
      })
    ).subscribe()
  }


  updateScheme(data: any) {
    this.cabinetConfiguratorService.setWardrobeScheme(data, Steps.two);
  }


  createCountDoorsSliderData() {
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
