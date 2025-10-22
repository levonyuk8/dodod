import {ChangeDetectorRef, Component, DestroyRef, inject, OnInit, output, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {
  IGroupData,
  ITestOption,
  RadioGroupComponent
} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {combineLatest, debounceTime, distinctUntilChanged, EMPTY, filter, startWith, switchMap, tap} from 'rxjs';
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
  private cdr = inject(ChangeDetectorRef);
  private threeHelperService = inject(ThreeHelperService);
  private cabinetConfiguratorService = inject(CabinetConfiguratorService);
  private wardrobeParamsService = inject(WardrobeParamsService);


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

  sectionWithYV = false;
  isLastSection = false;
  nextSectionWithYV = false;


  prevSection: any;

  sectionTypes = {
    groupName: "sectionTypes",
    options: [
      {
        imgUrl: 'url(/img/svg/s3/ST1.svg)', label: 'Одинарная', value: 0,
        message: `Защита от ошибок: Секция не может быть одинарной`
      },
      {
        imgUrl: 'url(/img/svg/s3/ST2.svg)', label: 'Двойная', value: 1,
        message: `Защита от ошибок: Секция не может быть двойной`
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

  sectionList = {
    groupName: "sectionList",
    options: []
  } as IGroupData;


  private createAndSaveSectionByWardrobeScheme() {

    const sectionByDoors = this.createEmptySections();
    sectionByDoors.forEach(section => {


      const scheme = this.wardrobeScheme.find(item => {
          console.log('item.startPos', item.startPos)
          console.log('item.nextSectionNumber', this.cabinetConfiguratorService.nextSectionNumber(+section.value))
        return item.startPos === this.cabinetConfiguratorService.nextSectionNumber(+section.value)
      }

      );
      const filling = {
        section: section.value,
        sectionType: scheme ? 1 : 0,
        openingDoorType: 0,
        fillingOption: 1
      }
      console.log(filling)
      this.saveSection(filling);
    })
    this.sectionList.options = sectionByDoors;

    console.log(this.cabinetConfiguratorService.getSavedFilingScheme())


  }

  private disabledDoubleDoorType() {
    console.log(this.wardrobe.wSect >= this.wardrobeParamsService.SR_L_MAX_SEKCII_VNUTR / 2)
    console.log(this.nextSectionWithYV)
    return this.wardrobe.wSect >= this.wardrobeParamsService.SR_L_MAX_SEKCII_VNUTR / 2 ||
      this.nextSectionWithYV ||
      this.isLastSection;
  }

  private disabledSingleDoorType() {
    console.log(this.wardrobe.wSect >= this.wardrobeParamsService.SR_L_MAX_SEKCII_VNUTR / 2)
    console.log(this.nextSectionWithYV)
    return this.sectionWithYV;
  }

  ngOnInit(): void {
    this.createAndSaveSectionByWardrobeScheme();

    // sectionType: this.sectionType$, openingDoorType: this.openingDoorType$, filingOption: this.filingOption$

    this.all$.pipe(
      // takeUntil(this.testS),
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      switchMap(([sectionType, openingDoorType, filingOption]) => {
        console.log('$all')
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
        this.threeHelperService.selectSectionAndOpenDoors(this.stepThreeForm.getRawValue(), false)
        this.threeHelperService.filingSection(+this.section.value, +this.sectionType.value, +this.fillingOption.value);

        if (!this.sectionWithYV) {
          this.disabledFillingByWidthSection(this.stepThreeForm.getRawValue());
        }
        this.calcSectionCount();

      })
    ).subscribe();

    this.section$.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(data => {
        const filingList = this.cabinetConfiguratorService.getSavedFilingScheme();
        console.log(filingList)
        const section = filingList.find((item: any) => {
          if (+item.section === +data) {
            return item;
          }
        });
        debugger;
        console.log('section$', section);
        if (section) {
          this.stepThreeForm.patchValue({
            sectionType: +section.sectionType,
            openingDoorType: +section.openingDoorType,
            fillingOption: +section.fillingOption,
          });
          // this.sectionType.setValue(+section.sectionType);
          // this.openingDoorType.setValue(+section.openingDoorType);
          // this.fillingOption.setValue(+section.fillingOption);
          // this.stepThreeForm.updateValueAndValidity();
          this.threeHelperService.selectSectionAndOpenDoors(section, false);
          this.prevSection = data;


        }

        console.log(filingList.length);
        console.log(data);

        console.log(filingList.length === +data);
        // disabled st === 1
        const scheme = this.cabinetConfiguratorService.getWardrobeScheme();


        if (+this.wardrobe.SR_yaschiki_vneshnie === 1 && scheme.length) {

          const currentBlock = scheme.find((block: any) => {
            if (+data === block.endPos) { //<= item.endPos
              return block;
            }
          });

          const nextBlock = scheme.find((block: any) => {
            if (+data === block.startPos) { //<= item.endPos
              return block;
            }
          });

          this.nextSectionWithYV = !!nextBlock
          this.sectionWithYV = !!currentBlock
        }
        this.isLastSection = filingList.length === +data

        console.log(this.isLastSection, this.sectionWithYV, this.nextSectionWithYV);

        this.sectionTypes.options = this.sectionTypes.options.map((i: any) => {
          if (i.value === 0) {
            return {
              ...i,
              disabled: this.disabledSingleDoorType()
            }
          } else if (i.value === 1) {
            return {
              ...i,
              disabled: this.disabledDoubleDoorType()
            }
          }

        })
        this.sectionWithSRY();
        this.disabledFillingByWidthSection(section);
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

  calcSectionCount() {
    if (!this.sectionType.dirty) return;
    if (this.section.value !== this.prevSection) return;
    let newScheme = [];
    let scheme = this.cabinetConfiguratorService.getSavedFilingScheme();
    const reIndexStart = +this.section.value + 1;
    if (+this.sectionType.value === 1) {
      scheme.splice(this.section.value, 1);
      newScheme = scheme.map(
        item => {
          if (reIndexStart < +item.section) {
            return {
              ...item,
              section: item.section - 1,
            };
          }
          return item;
        }
      )


    } else if (+this.sectionType.value === 0) {
      newScheme = scheme.map(
        item => {
          if (reIndexStart <= +item.section) {
            return {
              ...item,
              section: +item.section + 1,
            };
          }
          return item;

        }
      )
      newScheme.splice(+this.section.value, 0, {
        section: reIndexStart,
        sectionType: 0,
        openingDoorType: 0,
        fillingOption: 1,
      });
    }

    this.cabinetConfiguratorService.setSavedFilingScheme(newScheme);

    this.sectionList = {
      groupName: "sectionList",
      options: this.updateSectionCount(),
    };
    this.section.updateValueAndValidity();
  }

  private sectionWithSRY() {
    console.log('sectionWithSRY', this.sectionWithYV);
    const message = 'Неподходящий вариант внешние ящики';
    const arr = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    this.fillingOptionList.options = this.fillingOptionList.options.map(
      (item: any) => {
        if (arr.includes(item.value)) {
          return {...item, disabled: this.sectionWithYV, message};
        }
        return item;
      }
    );

    // this.sectionTypes.options = this.sectionTypes.options.map((i: any) => i);
    //
    // this.sectionType.setValue(1);
    // this.openingDoorType.setValue(0);

  }

  private disabledFillingByWidthSection(section: any, block: Block | null = null) {
    if (this.sectionWithYV) return;
    console.log('disabledFillingByWidthSection', this.sectionWithYV);
    const message = 'Неподходящий вариант ширина секции';
    const fillingW = this.threeHelperService.getSectionFillingWBySection(section)
    const arr = [9, 10, 11, 12];
    this.fillingOptionList.options = this.fillingOptionList.options.map(
      (item: any) => {
        if (arr.includes(item.value)) {
          return {...item, disabled: fillingW < 400, message};
        }
        return item;
      }
    );
  }

  private deSectionWithSRY() {
    this.fillingOptionList.options = this.fillingOptionList.options.map(
      (item: any) => {
        delete item.disabled;
        delete item.message;
        return item;
      }
    );

    // this.sectionTypes.options = this.sectionTypes.options.map((i: any) => {
    //   delete i.disabled;
    //   delete i.message;
    //   return i;
    // });

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
    this.cabinetConfiguratorService.saveSection(data);
  }

  editAfterFilingSection() {
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

  updateSectionCount() {
    // this.sectionList.options.;
    const res: ITestOption[] = []
    const sectionCount = this.cabinetConfiguratorService.getSavedFilingScheme().length;
    for (let i = 1; i <= sectionCount; i++) {
      res?.push(({label: i.toString(), value: i}) as ITestOption)
    }
    return res;
  }
}
