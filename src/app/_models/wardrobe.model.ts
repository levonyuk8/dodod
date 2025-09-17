export class Wardrobe {
  // base
  wSect: number;
  // 1
  srL: number;
  srH: number;
  srG: number;
  SR_G_ldsp: string;
  SR_G_fasad: string;
  // 2
  srK: number;
  SR_K_max: number;
  SR_K_min: number;
  SR_yaschiki_vneshnie?: number;
  SR_tsokol: number;
  SR_niz_dveri: number;
  SR_antr: number;
  SR_H_antr: number;
  SR_antr_blok: number;
  SR_PLANKA: number;
  SR_H_PLANKA_VERH: number;
  SR_PLANKA_VERH_CHENTR: number; // new FormControl<boolean>(false),
  SR_PLANKA_VERH_LEV: number; // new FormControl<boolean>(false),
  SR_PLANKA_VERH_PRAV: number; // new FormControl<boolean>(false),
  SR_PLANKA_BOK_CHENTR: number; // new FormControl<boolean>(false),
  SR_H_PLANKA_BOK_LEV: number; // new FormControl<boolean>(false),
  SR_H_PLANKA_BOK_PRAV: number; // new FormControl<boolean>(false),
  // SR_PLANKA_VERH_LEV: new FormControl<boolean>(false),
  // SR_PLANKA_VERH_PRAV: new FormControl<boolean>(false),
  // SR_PLANKA_BOK_CHENTR: new FormControl<boolean>(false),
  // SR_H_PLANKA_BOK_LEV: new FormControl<boolean>(false),
  // SR_H_PLANKA_BOK_PRAV: new FormControl<boolean>(false),

  constructor() {
    this.wSect = 0;
    this.srL = 0;
    this.srH = 0;
    this.srG = 0;
    this.SR_G_ldsp = '';
    this.SR_G_fasad = '';
    this.srK = 0;
    this.SR_K_min = 0;
    this.SR_K_max = 0;
    this.SR_yaschiki_vneshnie = 0;
    this.SR_tsokol = 0; // 0-Боковины до пола 1-Цоколь с зазорами под плинтус 2-Цоколь только спереди + кухонные опоры 100мм
    this.SR_niz_dveri = 0; // 0-До цоколя 1-До пола
    this.SR_antr = 0; // 0-Шкаф без антресоли 1-Шкаф с антресолью
    this.SR_H_antr = 0; // 0-Шкаф без антресоли 1-Шкаф с антресолью
    this.SR_antr_blok = 0; // 0-Шкаф и антресоль не разделены 1-Шкаф и антресоль разделены

    this.SR_PLANKA = 0;
    this.SR_H_PLANKA_VERH = 0;
    this.SR_PLANKA_VERH_CHENTR = 0;
    this.SR_PLANKA_VERH_LEV = 0;
    this.SR_PLANKA_VERH_PRAV = 0;
    this.SR_PLANKA_BOK_CHENTR = 0;
    this.SR_H_PLANKA_BOK_LEV = 0;
    this.SR_H_PLANKA_BOK_PRAV = 0;
  }
}
