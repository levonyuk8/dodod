import {Component, DestroyRef, inject, OnChanges, OnInit, output, Output, signal, SimpleChanges} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {IGroupData, RadioGroupComponent} from '../../../_shared/components/radio-group/radio-group.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {combineLatest, distinctUntilChanged, map, skip, startWith, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {ThreeHelperService} from '../../../_services/three-helper.service';
import {ButtonComponent} from '../../../_shared/components/button/button.component';
import {Block} from '../../../_models/block.model';
import {WardrobeParamsService} from '../../../_services/wardrobe-params.service';

@Component({
  selector: 'app-step-3',
  imports: [
    ReactiveFormsModule,
    RadioGroupComponent,
    ButtonComponent
  ],
  templateUrl: './step-3.component.html',
  styleUrl: './step-3.component.scss'
})
export class Step3Component implements OnInit, OnChanges {
  private fb = inject(FormBuilder);
  private threeHelperService = inject(ThreeHelperService);
  private cabinetConfiguratorService = inject(CabinetConfiguratorService);
  private wardrobeParamsService = inject(WardrobeParamsService);

  stepThreeForm: FormGroup = this.createAndPatchForm();

  sectionType$ =
    this.sectionType.valueChanges.pipe(startWith(this.stepThreeForm.get('sectionType')?.value));
  section$ =
    this.section.valueChanges.pipe(startWith(this.stepThreeForm.get('section')?.value));

  openingDoorType$ =
    this.openingDoorType.valueChanges.pipe(startWith(this.stepThreeForm.get('openingDoorType')?.value));

  // all$ = this.a1$.pipe(combineLatestWith(this.a2$)).pipe(
  //   combineLatestWith(this.a3$)
  // )
  all$ = combineLatest({
    sectionType: this.sectionType$, section: this.section$, openingDoorType: this.openingDoorType$
  });
  wardrobe = this.cabinetConfiguratorService.getWardrobe();


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
    options: [{
      label: '1',
      value: 1,
    }]
  } as IGroupData;

  constructor(
    private destroyRef: DestroyRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes)
  }

  ngOnInit(): void {
    // this.saveSection();
    // this.createEmptySection();
    this.isCompleteFillingEv.emit(this.isCompleteFilling())

    this.cabinetConfiguratorService.saveSectionSubject$.pipe(
      // distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
        debugger;
        console.log('cabinetConfiguratorService saveSectionSubject$');
        const nextDoorNumber = this.cabinetConfiguratorService.currentFilingAndSavedSection();
        const {srK} = this.cabinetConfiguratorService.getWardrobe();
        console.log('saveSectionSubject$', nextDoorNumber);
        console.log('saveSectionSubject$', srK);
        console.log('saveSectionSubject$', srK === nextDoorNumber);

        if (+srK <= nextDoorNumber) {
          this.isCompleteFilling.set(true);
          this.isCompleteFillingEv.emit(this.isCompleteFilling());
          this.section.setValue(null);
        } else {

          this.createEmptySection();

          this.section.setValue(this.lastSectionIndex);
          // this.section.setValue(nextDoorNumber);
        }
      })
    ).subscribe();

    this.stepThreeForm?.valueChanges.pipe(
      startWith(this.stepThreeForm?.value),
      // debounceTime(800),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.isSavedCurrentSection.set(false);
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
        const filingList = this.cabinetConfiguratorService.getSavedFilingScheme();
        const section = filingList.find((item: any) => {
          if (+item.section === +data) {
            return item;
          }
        });

        console.log('SR_yaschiki_vneshnie', this.wardrobe.SR_yaschiki_vneshnie);
        console.log('SR_yaschiki_vneshnie', this.cabinetConfiguratorService.getWardrobeScheme());

        if (+data !== 0 && this.isCompleteFilling()) {
          this.isEditSectionAfterCompleteFiling.set(true);
          this.isCompleteFillingEv.emit(false);
        }


        if (section) {
          debugger;
          console.log(this.prevSection)
          if (this.prevSection)  {
            const savedSection =
              this.cabinetConfiguratorService.getSavedFilingScheme().find((item: any) => +item.section === this.prevSection.section);

            console.log('saveSectionSubject$', this.isSavedCurrentSection());
            console.log('saveSectionSubject$', data, this.prevSection);

            if (!this.isSavedCurrentSection() || this.isEditSectionAfterCompleteFiling()) {

              console.log('if')
              console.log(data)
              console.log(section);
              console.log(savedSection);
              console.log(+this.openingDoorType.value);
              console.log(+this.fillingOption.value);


              if (savedSection) {
                if (+savedSection.openingDoorType !== +this.prevSection.openingDoorType ||
                  +savedSection.fillingOption !== +this.prevSection.fillingOption) {
                  let message = confirm("сбросить настройки");
                  alert(message); // true, если нажата OK
                  if (message) {
                    alert('saved');
                  } else {
                    alert('not saved');
                  }
                }
              }
            }
          }


          this.isNewCurrentSection.set(false);
          console.log('if section', section);
          this.sectionType.setValue(+section.sectionType);
          this.openingDoorType.setValue(+section.openingDoorType);
          this.fillingOption.setValue(+section.fillingOption);
          this.stepThreeForm.updateValueAndValidity();
          // this.threeHelperService.filingSection(+this.section.value + 1, data, +this.fillingOption.value);
          this.prevSection = section;
          this.threeHelperService.selectSectionAndOpenDoors(section, this.isNewCurrentSection());
        } else {
          console.log('else section', section);
          this.sectionType.setValue(0);
          this.openingDoorType.setValue(0);
          this.fillingOption.setValue(1);
          // // this.stepThreeForm.reset();
          // this.isNewCurrentSection.set(true);
          this.threeHelperService.selectSectionAndOpenDoors(this.stepThreeForm.getRawValue(), this.isNewCurrentSection());
        }


        if (Number(this.wardrobe.SR_yaschiki_vneshnie) === 1) {
          const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
          // @ts-ignore
          const block = scheme.find((item: Block) => {
            if (item.startPos <= +data && +data <= item.endPos) { //<= item.endPos
              return item;
            }
          });
          if (block) {
            this.sectionWithSRY(block);
          } else {
            this.deSectionWithSRY()
          }
        }
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

  saveSection() {
    console.log('saveSection', this.stepThreeForm.getRawValue());
    this.isSavedCurrentSection.set(true);
    this.cabinetConfiguratorService.saveSection(this.stepThreeForm.getRawValue());


    this.isCompleteFillingEv.emit(this.isCompleteFilling());
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
    // this.cdr.detectChanges();
  }
}
