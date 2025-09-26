import {Injectable} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {WardrobeParamsService} from './wardrobe-params.service';
import {Wardrobe} from '../_models/wardrobe.model';
import {Steps} from '../_shared/components/stepper/stepper.component';
import {Block} from '../_models/block.model';

@Injectable({
  providedIn: 'root'
})
export class CabinetConfiguratorService {

  private data = new Wardrobe();
  private wardrobeScheme: Block[] = [];

  dataUpdatedSubject$ = new BehaviorSubject<Steps | null>(null);
  saveSectionSubject$ = new Subject<void>();

  clearConf = new Subject<void>;


  constructor(private wps: WardrobeParamsService) {
  }

  getWardrobe() {
    return this.data;
  }

  getWardrobeScheme() {
    return this.wardrobeScheme;
  }

  setWardrobe(data: any, step: Steps = Steps.one) {
    Object.assign(this.data, data);
    if (step === Steps.one) {
      this.calcNumberOfDoors();
      this.data.wSect = ((this.data.srL) / this.data.srK);
    }

    if (step === Steps.two) {
      this.data.wSect = ((this.data.srL) / this.data.srK);
    }

    this.dataUpdatedSubject$.next(step);
  }

  setWardrobeScheme(scheme: any, step: Steps = Steps.one) {
    this.wardrobeScheme = scheme;
    this.dataUpdatedSubject$.next(step);
  }

  clear(): void {
    this.setWardrobe(new Wardrobe());
    this.setWardrobeScheme([]);
    this.clearConf.next();
  }

  calcNumberOfDoors() {
    if (!this.data?.srL) return;
    this.data.SR_K_min = this.minCalcNumberOfDoors(this.data?.srL);
    this.data.SR_K_max = this.maxCalcNumberOfDoors(this.data?.srL);
    this.data.srK =  this.data.SR_K_min;
  }

  // SR_K_min=(SR_L/600) и округлить в большую сторону	Формула для минимального кол-ва дверей
  private minCalcNumberOfDoors(width: number) {
    return Math.round(width / this.wps.SR_L_MAX_FASAD);
  }

  // SR_K_max=(SR_L/SR_L_MIN) и округлить в большую сторону	Формула для максимального кол-ва дверей
  private maxCalcNumberOfDoors(width: number) {
    return Math.round(width / this.wps.SR_L_MIN);
  }

  saveSection() {
    this.saveSectionSubject$.next();
  }
}
