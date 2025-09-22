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

  clearConf = new Subject<void>;


  constructor(private wardrobeParamsService: WardrobeParamsService) {
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

  // todo change 600 and 300
  // SR_K_min=(SR_L/600) и округлить в большую сторону	Формула для минимального кол-ва дверей
  private minCalcNumberOfDoors(width: number) {
    return Math.ceil(width / 600);
  }

  // SR_K_max=(SR_L/SR_L_MIN) и округлить в большую сторону	Формула для максимального кол-ва дверей
  private maxCalcNumberOfDoors(width: number) {
    return Math.ceil(width / 300);
  }

  // Создаем объемные двери шкафа
  // private createDoors(w: number, h: number, d: number, thickness: number) {
  //   const doorW = w / 4;
  //
  //   let doors = []
  //
  //   for (let i = 1; i <= 4; i++) {
  //     console.log({doorW});
  //     const door = {
  //       name: 'дверь',
  //       vertices: this.createWall(doorW, h - this.wardrobeParamsService.HEIGHT_BASE, d, {
  //         x: -w / 2 - (doorW / 2) + i * doorW,
  //         y: -(thickness / 2 + this.wardrobeParamsService.HEIGHT_BASE) / 2,
  //         z: 0
  //       }),
  //       color: '#c3ac9f',
  //       faces: [
  //         [0, 1, 2, 3],
  //         // [4, 5, 6, 7],
  //         // [0,1, 5, 4], [2,3,7,6],
  //         // [0, 3, 7, 4],
  //         // [1, 2, 6,5]
  //       ]
  //     }
  //     doors.push(door);
  //   }
  //   return doors;
  // }
}
