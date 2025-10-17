import {Component, DestroyRef, inject, OnChanges, OnInit, output, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  IGroupData,
  ITestOption,
  RadioGroupComponent
} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged, EMPTY,
  filter,
  map,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap
} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {ThreeHelperService} from '../../../_services/three-helper.service';
import {Block} from '../../../_models/block.model';
import {WardrobeParamsService} from '../../../_services/wardrobe-params.service';

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
  private destroyRef = inject(DestroyRef);
  private threeHelperService = inject(ThreeHelperService);
  private cabinetConfiguratorService = inject(CabinetConfiguratorService);
  private wardrobeParamsService = inject(WardrobeParamsService);


  private testS = new Subject<any>();
  private variable: any;

  stepThreeForm: FormGroup = this.createAndPatchForm();

  section$ =
    this.section.valueChanges.pipe(startWith(this.stepThreeForm.get('section')?.value));

  sectionType$ =
    this.sectionType.valueChanges.pipe(
      distinctUntilChanged(),
      startWith(this.stepThreeForm.get('sectionType')?.value));

  openingDoorType$ =
    this.openingDoorType.valueChanges.pipe(distinctUntilChanged(), startWith(this.stepThreeForm.get('openingDoorType')?.value));

  filingOption$ =
    this.fillingOption.valueChanges.pipe(distinctUntilChanged(), startWith(this.stepThreeForm.get('fillingOption')?.value));

  all$ = combineLatest([
    this.sectionType$, this.openingDoorType$, this.filingOption$
  ]).pipe(filter(Boolean));

  wardrobe = this.cabinetConfiguratorService.getWardrobe();
  wardrobeScheme = this.cabinetConfiguratorService.getWardrobeScheme();


  sectionTypes = {
    groupName: "sectionTypes",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/ST1.svg)', label: 'Одинарная', value: 0,
        disabled: Number(this.wardrobe.SR_yaschiki_vneshnie) === 1,
        message: `Неподходящий вариант`
      },
      {
        imgUrl: 'url(/img/svg/s3/ST2.svg)', label: 'Двойная', value: 1,
        disabled: this.wardrobe.wSect >= this.wardrobeParamsService.SR_L_MAX_SEKCII_VNUTR / 2,
        message: `Защита от ошибок: Секция не может быть более ${this.wardrobeParamsService.SR_L_MAX_SEKCII_VNUTR}`
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

  openingDualDoorTypes = {
    groupName: "openingDoorTypes",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/ODT1.svg)', label: 'Двери', value: 0,
        disabled: false,
        message: ``
      },
      {
        imgUrl: 'url(/img/svg/s3/ODT2.svg)', label: 'Без двери', value: 1,
        disabled: false,
        message: ``
      }
    ]
  }


  fillingOptionList = {
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

  isCompleteFilling = signal(false);
  isEditSectionAfterCompleteFiling = signal(false);
  isNewCurrentSection = signal(false);
  isSavedCurrentSection = signal(false);
  isCompleteFillingEv = output<boolean>();

  prevSection: any = null;

  sectionList = {
    groupName: "sectionList",
    options: []
  } as IGroupData;


  private createAndSaveSectionByWardrobeScheme() {

    const sectionByDoors = this.createEmptySections();
    sectionByDoors.forEach(section => {
      const scheme = this.wardrobeScheme.find(item =>
        item.startPos === this.cabinetConfiguratorService.nextSectionNumber(+section.value)
      );
      const filing = {
        section: section.value,
        sectionType: scheme ? 1 : 0,
        openingDoorType: 0,
        fillingOption: 1
      }
      this.saveSection(filing);
    })
    this.sectionList.options = sectionByDoors;
  }

  ngOnInit(): void {
    this.createAndSaveSectionByWardrobeScheme();

    // sectionType: this.sectionType$, openingDoorType: this.openingDoorType$, filingOption: this.filingOption$

    // TODO
    this.variable = this.all$.pipe(
      // takeUntil(this.testS),
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      switchMap(([sectionType, openingDoorType, filingOption]) => {
        console.log('all$')
        console.log(this.section.value)
        console.log(this.section.getRawValue())
        console.log({sectionType, openingDoorType, filingOption})
        const filing = {
          section: +this.section.getRawValue(),
          sectionType: +sectionType,
          openingDoorType: +openingDoorType,
          fillingOption: +filingOption
        }

        this.saveSection(filing);

        return EMPTY;
      })
    ).subscribe()

    // this.isCompleteFillingEv.emit(this.isCompleteFilling())

    // this.cabinetConfiguratorService.saveSectionSubject$.pipe(
    //   // distinctUntilChanged(),
    //   takeUntilDestroyed(this.destroyRef),
    //   tap(() => {
    //     console.log('cabinetConfiguratorService saveSectionSubject$');
    //     const nextDoorNumber = this.cabinetConfiguratorService.currentFilingAndSavedSection();
    //     const {srK} = this.cabinetConfiguratorService.getWardrobe();
    //     console.log('saveSectionSubject$', nextDoorNumber);
    //     console.log('saveSectionSubject$', srK);
    //     console.log('saveSectionSubject$', srK === nextDoorNumber);
    //
    //     if (+srK <= nextDoorNumber) {
    //       this.isCompleteFilling.set(true);
    //       this.isCompleteFillingEv.emit(this.isCompleteFilling());
    //       this.section.setValue(null);
    //     } else {
    //
    //       this.createEmptySection();
    //
    //       this.section.setValue(this.lastSectionIndex);
    //       // this.section.setValue(nextDoorNumber);
    //     }
    //   })
    // ).subscribe();

    this.stepThreeForm?.valueChanges.pipe(
      startWith(this.stepThreeForm?.value),
      // debounceTime(800),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        // this.isSavedCurrentSection.set(false);
        this.cabinetConfiguratorService.setWardrobe({}, Steps.three);
      })
    ).subscribe()


    this.sectionType$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(data => {
        this.threeHelperService.selectSectionAndOpenDoors(this.stepThreeForm.getRawValue(), this.isNewCurrentSection())
        this.threeHelperService.filingSection(+this.section.value, +this.sectionType.value, +this.fillingOption.value);
      })
    ).subscribe();

    this.section$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(data => {
        console.log('section$', data)
        debugger;
        const filingList = this.cabinetConfiguratorService.getSavedFilingScheme();
        const section = filingList.find((item: any) => {
          if (+item.section === +data) {
            return item;
          }
        });
        console.log(section)
        if (section) {
          console.log('path')

          this.stepThreeForm.patchValue({
            sectionType: +section.sectionType,
            openingDoorType: +section.openingDoorType,
            fillingOption: +section.fillingOption,
          });
          console.log(' end path')
          // this.sectionType.setValue(+section.sectionType);
          // this.openingDoorType.setValue(+section.openingDoorType);
          // this.fillingOption.setValue(+section.fillingOption);
          // this.stepThreeForm.updateValueAndValidity();
          this.threeHelperService.selectSectionAndOpenDoors(section, false);
        }

        console.log('section$ end')
        // if (Number(this.wardrobe.SR_yaschiki_vneshnie) === 1) {
        //   const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
        //   // @ts-ignore
        //   const block = scheme.find((item: Block) => {
        //     if (item.startPos <= +data && +data <= item.endPos) { //<= item.endPos
        //       return item;
        //     }
        //   });
        //   if (block) {
        //     this.sectionWithSRY(block);
        //   } else {
        //     this.deSectionWithSRY()
        //   }
        // }
      })
    ).subscribe();

    this.openingDoorType$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(data => {
        this.threeHelperService.selectSectionAndOpenDoors(this.stepThreeForm.getRawValue());
        // this.threeHelperService.filingSection(+this.section.value, +this.sectionType.value, +data);
      })
    ).subscribe();


    this.fillingOption.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(data => {
        this.threeHelperService.filingSection(+this.section.value, +this.sectionType.value, +data);
      })
    ).subscribe();

  }

  private sectionWithSRY(section: Block) {
    console.log('sectionWithSRY', section);
    const message = 'Неподходящий вариант';
    const arr = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    this.fillingOptionList.options = this.fillingOptionList.options.map(
      (item: any) => {
        if (arr.includes(item.value)) {
          return {...item, disabled: true, message};
        }
        return item;
      }
    );

    this.sectionTypes.options = this.sectionTypes.options.map((i: any) => i);

    this.sectionType.setValue(1);
    this.openingDoorType.setValue(0);

  }

  private deSectionWithSRY() {

    console.log('deSectionWithSRY')
    this.fillingOptionList.options = this.fillingOptionList.options.map(
      (item: any) => {
        delete item.disabled;
        delete item.message;
        return item;
      }
    );

    this.sectionTypes.options = this.sectionTypes.options.map((i: any) => {
      delete i.disabled;
      delete i.message;
      return i;
    });

    // this.sectionType.setValue(1);
    // this.openingDoorType.setValue(0);
  }

  private createAndPatchForm() {
    return this.stepThreeForm = this.fb.group({
      section: new FormControl<number>(1),
      sectionType: new FormControl<number>(0),
      openingDoorType: new FormControl<number>(0),
      fillingOption: new FormControl<number>(1),
    })
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
    return this.stepThreeForm.get('fillingOption') as FormControl;
  }

  saveSection(data: any) {
    console.log('saveSection', data);
    // this.isSavedCurrentSection.set(true);
    this.cabinetConfiguratorService.saveSection(data);
    // this.isCompleteFillingEv.emit(this.isCompleteFilling());
  }

  editAfterFilingSection() {
    console.log('saveSection', this.stepThreeForm.getRawValue());
    this.isSavedCurrentSection.set(true);
    this.isEditSectionAfterCompleteFiling.set(false);
    this.section.setValue(0)
    this.cabinetConfiguratorService.saveSection(this.stepThreeForm.getRawValue());


    this.isCompleteFillingEv.emit(this.isCompleteFilling());
  }

  private createEmptySection() {
    this.lastSectionIndex++;
    this.sectionList.options.push({label: String(this.lastSectionIndex), value: this.lastSectionIndex});
  }


  createEmptySections() {
    const res: ITestOption[] = []
    const sectionCount = this.wardrobe.srK - this.wardrobeScheme.length;
    for (let i = 1; i <= sectionCount; i++) {
      res?.push(({label: i.toString(), value: i}) as ITestOption)
    }
    return res;
  }
}
