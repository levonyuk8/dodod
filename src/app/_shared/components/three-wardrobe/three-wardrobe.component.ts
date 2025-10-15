import {AfterViewInit, Component, ElementRef, signal, ViewChild} from '@angular/core';
import {ThreeHelperService} from '../../../_services/three-helper.service';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {filter} from 'rxjs';
import {ButtonComponent} from '../button/button.component';

@Component({
  selector: 'app-three-wardrobe',
  imports: [
    ButtonComponent
  ],
  templateUrl: './three-wardrobe.component.html',
  styleUrl: './three-wardrobe.component.scss'
})
export class ThreeWardrobeComponent implements AfterViewInit {

  size = signal(false);

  sizeBtnLabel = ` ${this.size() ? 'Скрыть' : 'Показать'} размеры`;

  @ViewChild('canvasContainer') containerRef!: ElementRef;

  constructor(
    private cabinetConfiguratorService: CabinetConfiguratorService,
    private threeHelper: ThreeHelperService) {
  }

  ngAfterViewInit(): void {
    this.threeHelper.setElement(this.containerRef);
    this.threeHelper.initThreeJs();

    this.cabinetConfiguratorService.clearConf.subscribe(
      () => {
        this.threeHelper.clearScene();
      }
    )

    this.cabinetConfiguratorService.dataUpdatedSubject$
      .pipe(
        filter(data => !!data)
      )
      .subscribe(
        data => {
          this.threeHelper.createCabinet(data);
        }
      )
  }

  resetSizes() {
    console.log('resetSizes')
    this.threeHelper.resetSizes(this.size());
    this.size.update(v => !this.size());
  }

}
