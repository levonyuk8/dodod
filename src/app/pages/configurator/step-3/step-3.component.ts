import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  IGroupData,
  ITestOption,
  RadioGroupComponent
} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {combineLatest, distinctUntilChanged, map, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {ThreeHelperService} from '../../../_services/three-helper.service';

@Component({
  selector: 'app-step-3',
  imports: [
    ReactiveFormsModule,
    RadioGroupComponent
  ],
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.scss'
})
export class Step3Component implements OnInit {
  private fb = inject(FormBuilder);
  stepThreeForm: FormGroup = this.createAndPatchForm();

  a1$ =
    this.sectionType.valueChanges.pipe(startWith(this.stepThreeForm.get('sectionType')?.value));
  a2$ =
    this.section.valueChanges.pipe(startWith(this.stepThreeForm.get('section')?.value));

  a3$ =
    this.openingDoorType.valueChanges.pipe(startWith(this.stepThreeForm.get('openingDoorType')?.value));

  // all$ = this.a1$.pipe(combineLatestWith(this.a2$)).pipe(
  //   combineLatestWith(this.a3$)
  // )
  all$ = combineLatest({
    sectionType: this.a1$, section: this.a2$, openingDoorType: this.a3$
  });


  sectionTypes = {
    groupName: "sectionTypes",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/ST1.svg)', label: 'Одинарная', value: 0,
        disabled: false,
        message: ``
      },
      {
        imgUrl: 'url(/img/svg/s3/ST2.svg)', label: 'Двойная', value: 1,
        disabled: false,
        message: ``
      },
    ]
  }
  openingDoorTypes = {
    groupName: "openingDoorTypes",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/ODT1.svg)', label: 'Влево', value: 0,
        disabled: false,
        message: ``
      },
      {
        imgUrl: 'url(/img/svg/s3/ODT2.svg)', label: 'Без двери', value: 1,
        disabled: false,
        message: ``
      },
      {
        imgUrl: 'url(/img/svg/s3/ODT3.svg)', label: 'Вправо', value: 2,
        disabled: false,
        message: ``
      },
    ]
  }

  fillingOptions = {
    groupName: "fillingOptions",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/1.svg)', label: 'без наполнения', value: 1,
      },
      {
        imgUrl: 'url(/img/svg/s3/1.svg)', label: 'труба в', value: 2,
      },
      {
        imgUrl: 'url(/img/svg/s3/2.svg)', label: 'труба в + 1 п н', value: 3,
      },
      {
        imgUrl: 'url(/img/svg/s3/3.svg)', label: 'труба в + 2 п н', value: 4,
      },
      {
        imgUrl: 'url(/img/svg/s3/4.svg)', label: 'труба в + п н макс', value: 5,
      },
      {
        imgUrl: 'url(/img/svg/s3/5.svg)', label: 'труба в + труба н', value: 6,
      },
      {
        imgUrl: 'url(/img/svg/s3/6.svg)', label: 'п в + труба ц', value: 7,
      },
      {
        imgUrl: 'url(/img/svg/s3/7.svg)', label: 'п в + труба н', value: 8,
      },
      {
        imgUrl: 'url(/img/svg/s3/8.svg)', label: 'труба в + 2 ящика', value: 9,
      },
      {
        imgUrl: 'url(/img/svg/s3/9.svg)', label: 'труба в + 3 ящика', value: 10,
      },
      {
        imgUrl: 'url(/img/svg/s3/10.svg)', label: 'п в + 2 ящика', value: 11,
      },
      {
        imgUrl: 'url(/img/svg/s3/11.svg)', label: 'пв + 3 ящика', value: 12,
      },
      {
        imgUrl: 'url(/img/svg/s3/12.svg)', label: 'алл макс полки', value: 13,
      },
      {
        imgUrl: 'url(/img/svg/s3/12.svg)', label: 'алл мин полки', value: 14,
      },
    ]
  }

  // numberShelvesInMainSection = this.createCountOptions();

  lastSectionIndex = 1;

  sectionList = {
    groupName: "sectionList",
    options: []
  } as IGroupData

  constructor(
    private destroyRef: DestroyRef, private threeHelperService: ThreeHelperService,
    private cabinetConfiguratorService: CabinetConfiguratorService) {

  }

  ngOnInit(): void {
    this.createEmptySection();
    // this.createAndPatchForm();
    this.cabinetConfiguratorService.saveSectionSubject$.pipe(
      tap(() => {
        console.log("saveSectionSubject$");
        this.createEmptySection();
      })
    ).subscribe();

    this.stepThreeForm?.valueChanges.pipe(
      startWith(this.stepThreeForm?.value),
      // debounceTime(800),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        console.log(change)
        this.cabinetConfiguratorService.setWardrobe({}, Steps.three);
      })
    ).subscribe()


    this.all$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      map(({sectionType, section, openingDoorType}) => {
        console.log('all')
        this.threeHelperService.selectSection(section, sectionType, openingDoorType);
      })
    ).subscribe();

    this.a1$.pipe(
      tap( data => {
        console.log('a1$', {data});
        if (+data === 0) this.threeHelperService.removeFilingBySection(+this.section.value + 1);
        if (+data === 1) {
          console.log('a1 _ 1', +this.section.value + 1, this.fillingOption.value)
          this.threeHelperService.filingSection(+this.section.value + 1, 0, +this.fillingOption.value);
        }
      })
    ).subscribe();

    this.fillingOption.valueChanges.pipe(
      tap(data => {
        console.log(data);
        this.threeHelperService.filingSection(+this.section.value, +this.sectionType.value, +data);
      })
    ).subscribe();

  }

  get sectionType() {
    return this.stepThreeForm.get('sectionType') as FormControl;
  }

  get section() {
    return this.stepThreeForm.get('section') as FormControl;
  }

  get openingDoorType() {
    return this.stepThreeForm.get('openingDoorType') as FormControl;
  }

  get fillingOption() {
    return this.stepThreeForm.get('fillingOptions') as FormControl;
  }

  private createAndPatchForm() {
    return this.stepThreeForm = this.fb.group({
      section: new FormControl<number>(1),
      sectionType: new FormControl<number>(0),
      openingDoorType: new FormControl<number>(0),
      fillingOptions: new FormControl<number>(1),
    })
  }

  private createEmptySection() {
    this.sectionList.options.push({label: this.lastSectionIndex.toString(), value: this.lastSectionIndex});
    this.lastSectionIndex++;
    // this.cdr.detectChanges();
  }

  // private createCountOptions(max = 9) {
  //   let res: ITestOption[] = []
  //   for (let i = 0; i <= max; i++) {
  //     res?.push(({label: i.toString(), value: i}) as ITestOption)
  //   }
  //
  //   return {
  //     groupName: "test5",
  //     options: res
  //   } as IGroupData
  // }
}
