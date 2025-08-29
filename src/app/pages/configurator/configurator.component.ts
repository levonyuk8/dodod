import {Component, signal} from '@angular/core';
import {ButtonComponent} from "../../_shared/components/button/button.component";
import {StepperComponent, Steps} from "../../_shared/components/stepper/stepper.component";
import {WardrobeDesignerComponent} from "../../_shared/components/wardrobe-designer/wardrobe-designer.component";
import {Step1Component} from './step-1/step-1.component';
import {Step2Component} from './step-2/step-2.component';

@Component({
  selector: 'app-configurator',
  imports: [
    ButtonComponent,
    StepperComponent,
    WardrobeDesignerComponent,
    Step1Component,
    Step2Component
  ],
  templateUrl: './configurator.component.html',
  styleUrl: './configurator.component.scss'
})
export class ConfiguratorComponent {
  currentStep = signal<Steps>(Steps.two);

  nextStep() {
    this.currentStep.update( (v) => ++v);
  }

  startAgain() {
    this.currentStep.set(Steps.one)
  }

  protected readonly Steps = Steps;
}
