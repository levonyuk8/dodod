import {inject, Injectable} from '@angular/core';
import {Material} from './wardrobe-params.service';
import {CabinetConfiguratorService} from './cabinet-configurator.service';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private ccs = inject(CabinetConfiguratorService)

  getContent() {
    const content = this.getBaseToFile() + this.getAdd() + this.getSectionsAndFilling();
    this.downloadTxtFile(content);
  }

  private getBaseToFile() {
    const wardrobe = this.ccs.getWardrobe();
    return `<base>` + '\n' +
      `"w": ` + wardrobe.srL + ',' + '\n' +
      `"h": ` + wardrobe.srH + ',' + '\n' +
      `"d": ` + wardrobe.srG + ',' + '\n' +
      `"hm": ` + this.getHousingMaterialLabel(wardrobe.SR_G_ldsp) + ',' + '\n' +
      `"dm": ` + this.getDoorMaterialLabel(wardrobe.SR_G_fasad) + ',' + '\n' +
      `"SR_antr": ` + wardrobe.SR_antr + ',' + '\n' +
      `"SR_antr_blok": ` + wardrobe.SR_antr_blok + ',' + '\n' +
      `"SR_H_antr": ` + wardrobe.SR_H_antr + ',' + '\n';
  }

  private getAdd() {
    const wardrobe = this.ccs.getWardrobe();
    console.log('wardrobe', wardrobe)
    return `<add>` + '\n' +
      `"srK": ` + wardrobe.srK + ',' + '\n' +
      `"SR_tsokol": ` + wardrobe.SR_tsokol + ',' + '\n' +
      `"SR_niz_dveri": ` + wardrobe.SR_niz_dveri + ',' + '\n' +
      `"SR_PLANKA_VERH_LEV": ` + wardrobe.SR_PLANKA_VERH_LEV + ',' + '\n' +
      `"SR_PLANKA_VERH_CHENTR": ` + wardrobe.SR_PLANKA_VERH_CHENTR + ',' + '\n' +
      `"SR_PLANKA_VERH_PRAV": ` + wardrobe.SR_PLANKA_VERH_PRAV + ',' + '\n' +
      `"SR_H_PLANKA_VERH": ` + wardrobe.SR_H_PLANKA_VERH + ',' + '\n' +
      `"SR_H_PLANKA_BOK_LEV": ` + wardrobe.SR_H_PLANKA_BOK_LEV + ',' + '\n' +
      `"SR_PLANKA_BOK_CHENTR": ` + wardrobe.SR_PLANKA_BOK_CHENTR + ',' + '\n' +
      `"SR_H_PLANKA_BOK_PRAV": ` + wardrobe.SR_H_PLANKA_BOK_PRAV + ',' + '\n' +
      `"managers": ` + wardrobe?.managers + ',' + '\n' +
      `"manufacturer": ` + wardrobe?.manufacturer + ',' + '\n' +
      `"fastening": ` + wardrobe?.fastening  + ',' + '\n' +
      `"backWallMaterials": ` + wardrobe?.backWallMaterial  + ',' + '\n' +
      `"baseColor": ` + wardrobe?.baseColor  + ',' + '\n' +
      `"facadeColor": ` + wardrobe?.facadeColor  + ',' + '\n';
  }

  getSectionsAndFilling() {
    let str = `<BeginSections> \n`;
    const scheme = this.ccs.getSavedFilingScheme();
    const wardrobe = this.ccs.getWardrobe();
    const {wSect, srL, srK} = wardrobe;
    let remainderWSect = srL % srK;
    let w = 0;
    scheme.forEach(item => {
      w += item.sectionType === 1 ? Math.trunc(wSect) * 2 : Math.trunc(wSect);
      if (remainderWSect > 0) {
        if (item.sectionType === 1) {
          if (remainderWSect >= 2) {
            w += 2;
            remainderWSect -= 2;
          } else {
            ++w;
            --remainderWSect;
          }
        } else {
          ++w;
          --remainderWSect;
        }
      }
      str += `<BeginSection> \n` +
        `"${item.section}": ` + w + ',' + '\n' +
        `"SR_yaschiki_vneshnie": ` + item.sectionWithVY + ',' + '\n' +
        `"filling": ` + item.fillingOption + ',' + '\n' +
        `"sectionType": ` + item.sectionType + ',' + '\n' +
        this.getDoorTypes(item) + ',' + '\n' +
        `<EndSection> \n`
    })
    str += `<EndSections>\n`;
    return str;
  }

  wS() {
    // for (let i = 0; i < data.srK; i++) {
    //   const testAl = this.createOuterDimensionLine(
    //     new THREE.Vector3(-data.srL / 2 + data.wSect * i, -data.srH / 2 - offset, data.srG / 2),
    //     new THREE.Vector3(-data.srL / 2 + data.wSect * i, -data.srH / 2 - offset, data.srG / 2),
    //     offset,
    //     0x000
    //   );
    //
    //   let wSectLabel = Math.trunc(data.wSect)
    //
    //   if (remainderWSect > 0) {
    //     ++wSectLabel;
    //     --remainderWSect;
    //   }
    //
    //
    //   const sWidthLabel = this.createTextLabel(
    //     `${wSectLabel}`,
    //     new THREE.Vector3((-data.srL + data.wSect) / 2 + data.wSect * i, -data.srH / 2 - offset + 50, data.srG / 2),
    //     0x000
    //   );
    //   if (sWidthLabel) {
    //     this.dimensionsGroup.add(sWidthLabel);
    //   }
    //
    //   debugger;
    //
    //   this.dimensionsGroup.add(testAl);
    // }
  }

  getDoorTypes(item: any) {
    return item.sectionType === 1
      ? `"openingDualDoorTypes": ` + item.openingDoorType
      : `"openingDoorTypes": ` + item.openingDoorType;
  }

  downloadTxtFile(content: string, fileName: string = 'файл.txt'): void {
    const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getHousingMaterialLabel(code: string) {
    return this.housingMaterials.find(mat => mat.code === code)?.name || '';
  }

  getDoorMaterialLabel(code: string) {
    return this.doorMaterials.find(mat => mat.code === code)?.name || '';
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
