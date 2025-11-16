import {Injectable} from '@angular/core';
import {BehaviorSubject, count, Subject} from 'rxjs';
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
  private _savedFilingScheme: any[] = [];

  dataUpdatedSubject$ = new BehaviorSubject<Steps | null>(null);
  saveSectionSubject$ = new Subject<void>();

  clearConf = new Subject<void>;


  constructor(private wps: WardrobeParamsService) {
  }

  getWardrobe() {
    return this.data;
  }

  getSavedFilingScheme() {
    return this._savedFilingScheme;
  }

  setSavedFilingScheme(value: any[]) {
    this._savedFilingScheme = value;
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

  calcMaxHAntr() {
    const emptyH = this.data.srH - this.wps.SR_H_MIN;

    return this.wps.SR_H_MIN_ANTR < emptyH && emptyH< this.wps.SR_H_MAX_ANTR ? emptyH : this.wps.SR_H_MAX_ANTR;
    // this.wps.SR_H_MAX_ANTR = readonly SR_H_MIN_ANTR = 	340; //	Минимально возможная высота антресоли (зависит от толщины ЛДСП). Здесь зазоры не учитываем	Раньше считал это значение по формуле (SR_H_MIN_GL)+(SR_G_ldsp)+(SR_G_ldsp)/2
    // readonly SR_H_MAX_ANTR = 	635;
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
    this.data.srK = this.data.SR_K_min;
  }

  // SR_K_min=(SR_L/600) и округлить в большую сторону	Формула для минимального кол-ва дверей
  private minCalcNumberOfDoors(width: number) {
    return Math.ceil(width / this.wps.SR_L_MAX_FASAD);
  }

  // SR_K_max=(SR_L/SR_L_MIN) и округлить в большую сторону	Формула для максимального кол-ва дверей
  private maxCalcNumberOfDoors(width: number) {
    return Math.floor(width / this.wps.SR_L_MIN);
  }

  saveSection(val: any) {
    const editElement = this._savedFilingScheme.find((el: any) => el.section === val.section);
    if (!editElement) {
      this._savedFilingScheme.push(val);
    } else {
      this._savedFilingScheme = this._savedFilingScheme.map(s => {
        if (s.section === val.section) {
          return val;
        }
        return s;
      });
    }
    this.saveSectionSubject$.next();
  }

  nextSectionNumber(sectionNA: number): number {
    let count = 0;

    if (!this._savedFilingScheme.length) return count;

    for (let i = 0; i < sectionNA - 1; i++) {
      ++count;
      if (+this._savedFilingScheme[i].sectionType === 1) {
        ++count;
      }
    }
    return count;
  }

  currentFilingAndSavedSection(): number {
    let count = 0;

    for (let i = 0; i < this._savedFilingScheme?.length; i++) {
      ++count
      if (+this._savedFilingScheme[i].sectionType === 1) ++count;
    }
    return count;
  }
}
