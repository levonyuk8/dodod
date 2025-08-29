import {Injectable} from '@angular/core';

export interface WardrobeParams {
  SR_L: number; //Ширина шкафа
  SR_H: number; //Высота шкафа
  SR_G: number; //Глубина шкафа
  height: number;
  SR_G_ldsp: Material; //Материал корпуса
}

export interface Material {
  name: string;
  code: string;
}

@Injectable({
  providedIn: 'root'
})
export class WardrobeParamsService {
  readonly SR_L_MAX = 3000; //Максимально возможная ширина шкафа
  readonly SR_L_MIN = 300; //Минимально возможная ширина шкафа
  readonly SR_H_MAX = 3360; //Максимально возможная высота шкафа
  readonly SR_H_MIN = 1945; //Минимально возможная высота шкафа

  readonly SR_H_MAX_FASAD = 2700; // Максимально возможная высота фасада
  readonly SR_L_MAX_FASAD = 600; //Максимальная ширина фасада без учета зазоров
  readonly SR_H_MAX_BOK = 2760; //Максимально возможная высота боковой стойки


  readonly SR_G_MAX = 750; //Максимально возможная глубина шкафа (опреденено визуально)
  readonly SR_G_MIN = 200; //Минимально возможная глубина шкафа
}
