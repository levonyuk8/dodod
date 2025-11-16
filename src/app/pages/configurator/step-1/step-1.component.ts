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
import {NgOptimizedImage} from '@angular/common';
import {ConfirmationService, MessageService} from 'primeng/api';


@Component({
  selector: 'app-step-1',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    Slider,
    Select,
    NgOptimizedImage
  ],
  templateUrl: './step-1.component.html',
  styleUrl: './step-1.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class Step1Component implements OnInit {
  fb = inject(FormBuilder);
  wps = inject(WardrobeParamsService);
  ccs = inject(CabinetConfiguratorService);
  destroyRef = inject(DestroyRef);

  formCorrectionService = inject(FormCorrectionService);
  private readonly defaultSrL = 1600;
  private readonly defaultSrH = 2200;
  private readonly defaultSrG = 520;

  public stepOneForm: FormGroup = this.fb.group({});

  ngOnInit(): void {
    this.createAndPatchForm();
    this.changeForm();
    this.correctionFormValue();
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
      filter(() => !this.stepOneForm?.invalid),
      startWith(this.stepOneForm.value),
      debounceTime(800),
      // distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap((change: any) => {
        this.ccs.setWardrobe(change, Steps.one);
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
