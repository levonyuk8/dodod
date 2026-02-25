import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {Select} from 'primeng/select';
import {Material} from '../../../_services/wardrobe-params.service';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {Popover} from 'primeng/popover';

@Component({
  selector: 'app-step-4',
  imports: [
    NgOptimizedImage,
    Select,
    ReactiveFormsModule,
    Popover
  ],
  templateUrl: './step-4.component.html',
  styleUrl: './step-4.component.scss'
})
export class Step4Component implements OnInit {

  @ViewChild('op') op!: Popover;

  fb = inject(FormBuilder);

  stepFourForm: FormGroup = this.fb.group({});

  backWallMaterials: Material[] = [
    {name: 'Без задней стенки', value:  1},
    {name: 'В накладку', value: 2},
    {name: 'В четверть', value: 3},
  ];



  ngOnInit(): void {
    this.stepFourForm = this.fb.group({
      backWallMaterial: new FormControl<number>(2),
    });
    // this.op.align();
  }


}
