import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {debounceTime, filter, startWith, tap} from 'rxjs';
import {Slider} from 'primeng/slider';
import {Select} from 'primeng/select';

import {Material, WardrobeParamsService} from '../../../_services/wardrobe-params.service';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {Steps} from '../../../_shared/components/stepper/stepper.component';
import {FormCorrectionService} from '../../../_services/form-correction.service';
import {ThreeHelperService} from '../../../_services/three-helper.service';
import {NgOptimizedImage} from '@angular/common';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ButtonComponent} from '../../../_shared/components/button/button.component';
import {Toast} from 'primeng/toast';


@Component({
  selector: 'app-step-1',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Slider,
    Select,
    NgOptimizedImage,
    ConfirmDialog,
    ButtonComponent,
    Toast
  ],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class Step1Component implements OnInit {
  fb = inject(FormBuilder);
  wps = inject(WardrobeParamsService);
  ccs = inject(CabinetConfiguratorService);
  threeHelper = inject(ThreeHelperService);
  destroyRef = inject(DestroyRef);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  formCorrectionService = inject(FormCorrectionService);
  private readonly defaultSrL = 1600;
  private readonly defaultSrH = 2100;
  private readonly defaultSrG = 520;

  public stepOneForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.createAndPatchForm();
    this.changeForm();

    this.correctionFormValue();
  }

  confirm1(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
      },
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rejected',
          detail: 'You have rejected',
          life: 3000,
        });
      },
    });
  }

  private correctionFormValue() {
    this.formCorrectionService.setupRangeCorrection(
      this.stepOneForm,
      'srL',
      this.wps.SR_L_MIN,
      this.wps.SR_L_MAX
    );

    this.formCorrectionService.setupRangeCorrection(
      this.stepOneForm,
      'srH',
      this.wps.SR_H_MIN,
      this.wps.SR_H_MAX
    );

    this.formCorrectionService.setupRangeCorrection(
      this.stepOneForm,
      'srG',
      this.wps.SR_G_MIN,
      this.wps.SR_G_MAX
    );
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
      SR_G_ldsp: new FormControl<string>('ldsp16'),
      SR_G_fasad: new FormControl<string>('ldsp16'),
    });
  }

  private changeForm(): void {
    this.stepOneForm?.valueChanges.pipe(
      filter( () => !this.stepOneForm?.invalid),
      startWith(this.stepOneForm.value),
      debounceTime(800),
      // distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.ccs.setWardrobe(change, Steps.one);
        // this.ccs.setWardrobe(change, Steps.one);
      })
    ).subscribe()
  }

  housingMaterials: Material[] = [
    {name: 'ЛДСП 16мм', code: 'ldsp16'},
    {name: 'ЛДСП 18мм', code: 'ldsp18'},
  ];

  doorMaterials: Material[] = [
    {name: 'ЛДСП 16мм', code: 'ldsp16'},
    {name: 'ЛДСП 18мм', code: 'ldsp18'},
    {name: 'МДФ 16мм', code: 'mdf16'},
    {name: 'МДФ 19мм', code: 'mdf19'},
  ];
}
