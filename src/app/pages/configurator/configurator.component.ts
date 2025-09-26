import {Component, signal} from '@angular/core';
import {ButtonComponent} from "../../_shared/components/button/button.component";
import {StepperComponent, Steps} from "../../_shared/components/stepper/stepper.component";
import {Step1Component} from './step-1/step-1.component';
import {Step2Component} from './step-2/step-2.component';
import {CabinetConfiguratorService} from '../../_services/cabinet-configurator.service';
import {ThreeWardrobeComponent} from '../../_shared/components/three-wardrobe/three-wardrobe.component';
import {NgTemplateOutlet} from '@angular/common';
import {Step3Component} from './step-3/step-3.component';

@Component({
  selector: 'app-configurator',
  imports: [
    ButtonComponent,
    StepperComponent,
    Step1Component,
    Step2Component,
    ThreeWardrobeComponent,
    NgTemplateOutlet,
    Step3Component
  ],
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.scss'
})
export class ConfiguratorComponent {
  protected readonly Steps = Steps;

  currentStep = signal<Steps>(Steps.one);

  constructor(private cabinetConfiguratorService: CabinetConfiguratorService) {
  }

  nextStep() {
    this.currentStep.update((v) => ++v);
  }

  startAgain() {
    this.cabinetConfiguratorService.clear();
    location.reload();
  }

  saveSection() {
    this.cabinetConfiguratorService.saveSection();
  }
}
