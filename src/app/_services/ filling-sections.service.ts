import {inject, Injectable} from '@angular/core';
import * as THREE from 'three';
import {CabinetConfiguratorService} from './cabinet-configurator.service';
import {Block} from '../_models/block.model';

@Injectable({
  providedIn: 'root'
})
export class FillingSectionsService {

  private readonly SR_H_VERHN_TRYBA = 1740;
  private readonly SR_H_VNUTR_YASHCHIK = 870;
  private readonly SR_H_NIGN_POLKA = 300;
  // 7
  private readonly SR_H_NISHA_CENTR_STANDART = 1800;
  private readonly SR_H_SREDN_TRYBA = 1100;
  private readonly SR_H_MIN_POLKA = 280;

  // 8
  private readonly SR_H_NIGN_TRYBA = 870;

  cabinetConfiguratorService = inject(CabinetConfiguratorService);

  get savedSectionList(): Array<any> {
    return this._savedSectionList;
  }

  set savedSectionList(value: Array<any>) {
    this._savedSectionList = value;
  }

  get sectionList(): Array<any> {
    return this._sectionList;
  }

  set sectionList(value: Array<any>) {
    this._sectionList = value;
  }

  get currentSection(): number {
    return this._currentSection;
  }

  set currentSection(value: number) {
    this._currentSection = value;
  }

  private _currentSection = 1;
  private _sectionList: Array<any> = [];
  private _savedSectionList: Array<any> = [];

  private texture = new THREE.TextureLoader().load('img/qwe.jpg');

  private data = this.cabinetConfiguratorService.getWardrobe();

  private readonly hY = 200;

  public createCylinder(isDual = false, sectionW = 0) {
    // Создание цилиндра 30, 30, 400

    const {srL, srH, srG, wSect, SR_G_fasad, srK} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;

    // const sectionW = (srL - (depth * 2) - (depth * (srK - 1))) / srK;

    const baseW = sectionW;
    const geometry = new THREE.CylinderGeometry(20, 20, baseW, 50);
    const material = new THREE.MeshBasicMaterial({color: 'gray'});
    const axis = new THREE.Vector3(0, 0, 1);
    const degrees = 90; //
    const angle = degrees * (Math.PI / 180);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);
    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.setRotationFromQuaternion(quaternion);
    return cylinder;
  }

  createY(count = 3, isDual = false, sectionW = 0) {
    const {srG, wSect, SR_G_fasad} = this.data;

    const group = new THREE.Group();
    group.name = 'y';
    // const meshes: THREE.Mesh[] = [];
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseH = (count * this.hY) + (count - 1) * 30 + depth;
    // let baseW = wSect - depth - depth / 2;

    const shelfW = sectionW - depth - depth;

    const base = this.createCube(sectionW, depth, srG);
    const base2 = this.createCube(sectionW, depth, srG);
    const base3 = this.createCube(depth, baseH - depth, srG);
    const base4 = this.createCube(depth, baseH - depth, srG);

    this.setPosY(base, this.SR_H_VNUTR_YASHCHIK);
    this.setPosY(base2, this.SR_H_VNUTR_YASHCHIK - baseH);
    this.setPosY(base3, this.SR_H_VNUTR_YASHCHIK - baseH / 2);
    this.setPosY(base4, this.SR_H_VNUTR_YASHCHIK - baseH / 2);

    base3.position.x = base3.position.x - (sectionW - depth) / 2;
    base4.position.x = base4.position.x + (sectionW - depth) / 2;

    for (let i = 0; i < count; i++) {
      const y = this.createCube(shelfW, this.hY, srG);
      const black = this.createCube(shelfW, 30, 30, 1, false, 0x2c1a0d);
      y.position.y = base.position.y - depth / 2 - this.hY / 2 - ((this.hY + 30) * i);
      if (i !== count - 1) {
        black.position.y = y.position.y - (this.hY + 30) / 2;
        black.position.z = srG / 2 - 30;
        group.add(black);
      }
      group.add(y);
    }

    group.add(base);
    group.add(base2);
    group.add(base3);
    group.add(base4);

    return group;
  }

  public createShelf(isDual = false, sectionW = 0) {
    const {srG, SR_G_fasad} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const shelf = this.createCube(sectionW, depth, srG)
    shelf.name = 'Shelf';
    return shelf;
  }

  public addFillingToSection(sectionNumber: number = 1, type = 7, isDual = false) {
    let group = new THREE.Group();
    group.clear();

    // const sectionW = (w - (thickness * 2) - (thickness * (srK - 1))) / 3;

    const {srL, SR_G_fasad, srK} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;

    let sectionW = ((srL - (depth * 2) - (depth * (srK - 1))) / srK) - 8;

    if (isDual) {
      sectionW *= 2;
      sectionW += depth * 2;
      sectionW -= 8;
    }


    switch (type) {
      case 2:
        group = this.createFilling2(sectionNumber, isDual, sectionW);
        break
      case 3:
        group = this.createFilling3(sectionNumber, isDual, sectionW);
        break
      case 4:
        group = this.createFilling4(sectionNumber, isDual, sectionW);
        break
      case 5:
        group = this.createFilling5(sectionNumber, isDual, sectionW);
        break
      case 6:
        group = this.createFilling6(sectionNumber, isDual, sectionW);
        break
      case 7:
        group = this.createFilling7(sectionNumber, isDual, this.SR_H_SREDN_TRYBA, sectionW);
        break
      case 8:
        group = this.createFilling8(sectionNumber, isDual, sectionW);
        break
      case 9:
        group = this.createFilling9And10(sectionNumber, isDual, 2, sectionW);
        break;
      case 10:
        group = this.createFilling9And10(sectionNumber, isDual, 3, sectionW);
        break;
      case 11:
        group = this.createFilling11And12(sectionNumber, isDual, 2, sectionW);
        break;
      case 12:
        group = this.createFilling11And12(sectionNumber, isDual, 3, sectionW);
        break;
      case 13:
        group = this.createFilling13And14(sectionNumber, isDual, 0, sectionW);
        break;
      case 14:
        group = this.createFilling13And14(sectionNumber, isDual, -1, sectionW);
        break;
    }

    group.name = 'Filling' + sectionNumber;
    group.userData = {
      sectionW
    }

    return group;
  }

  private additionalShelves(sectionNumber: number, isDual = false, addYPos: number = this.SR_H_SREDN_TRYBA, sectionW = 0) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    const sH = this.calcSectionHeight(sectionNumber);
    if (sH > this.SR_H_NISHA_CENTR_STANDART + this.SR_H_MIN_POLKA) {
      group.add(this.createAddShelves(sectionNumber, this.SR_H_NISHA_CENTR_STANDART, isDual, sectionW));
    }
    return group;
  }

  private createAddShelves(sectionNumber: number, addYPos: number = this.SR_H_SREDN_TRYBA, isDual = false, sectionW = 0) {
    let group = new THREE.Group();
    const sH = this.calcSectionHeight(sectionNumber) - addYPos - 60;
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      // const shelfBase = this.createShelf()
      // this.setPosX(shelfBase)
      // this.setPosY(shelfBase, addYPos + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf(isDual, sectionW)
        // this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, addYPos + 60 + shelvesH * i);
        group.add(shelf);
      }
      // group.add(shelfBase);
    }

    return group;
  }


  createFilling2(sectionNumber: number, isDual = false, sectionW = 0) {
    const cr = this.createCylinder(isDual, sectionW);
    // this.setPosX(cr, sectionNumber);
    this.setPosY(cr, this.SR_H_VERHN_TRYBA);
    const group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    group.add(cr);
    group.add(this.additionalShelves(sectionNumber, isDual, this.SR_H_VERHN_TRYBA, sectionW));
    return group;
  }


  createFilling3(sectionNumber: number, isDual = false, sectionW = 0) {

    const gr = this.createFilling2(sectionNumber, isDual, sectionW);

    const shelf = this.createShelf(isDual, sectionW);

    // console.log('createFilling3', sectionW)
    //
    // this.setPosX(shelf, sectionNumber, sectionW);
    this.setPosY(shelf, this.SR_H_NIGN_POLKA);
    //
    gr.add(shelf);

    return gr;

  }

  createFilling4(sectionNumber: number, isDual = false, sectionW = 0) {
    const gr = this.createFilling2(sectionNumber, isDual, sectionW);
    const s1 = this.createFilling3(sectionNumber, isDual, sectionW);
    const s2 = this.createShelf(isDual, sectionW)
    // this.setPosX(s2, sectionNumber);
    this.setPosY(s2, this.SR_H_NIGN_POLKA * 2);
    gr.add(s1);
    gr.add(s2);
    return gr;
  }

  createFilling5(sectionNumber: number, isDual = false, sectionW = 0) {
    const gr = this.createFilling2(sectionNumber, isDual, sectionW);
    const s1 = this.createFilling4(sectionNumber, isDual, sectionW)
    const s2 = this.createShelf(isDual, sectionW)
    // this.setPosX(s2, sectionNumber);
    this.setPosY(s2, this.SR_H_NIGN_POLKA * 3);
    gr.add(s1);
    gr.add(s2);
    return gr;
  }

  createFilling6(sectionNumber: number, isDual = false, sectionW = 0) {
    const gr = this.createFilling2(sectionNumber, isDual, sectionW);
    const cr2 = this.createCylinder(isDual, sectionW);
    // this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, this.SR_H_NIGN_TRYBA);
    // const group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    gr.add(cr2);
    gr.add(cr2);
    return gr;
  }

  createFilling7(sectionNumber: number, isDual = false, addYPos: number, sectionW: number) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    const cr2 = this.createCylinder(isDual, sectionW);
    // this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, addYPos);
    group.add(cr2);
    const sH = this.calcSectionHeight(sectionNumber) - addYPos - 60;
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      const shelfBase = this.createShelf(isDual, sectionW)
      // this.setPosX(shelfBase, sectionNumber)
      this.setPosY(shelfBase, addYPos + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf(isDual, sectionW)
        // this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, addYPos + 60 + shelvesH * i);
        group.add(shelf);
      }
      group.add(shelfBase);
    }

    return group;
  }

  createFilling8(sectionNumber: number, isDual = false, sectionW = 0) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    const cr2 = this.createCylinder(isDual, sectionW);
    // this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, this.SR_H_NIGN_TRYBA);
    group.add(cr2);
    const sH = this.calcSectionHeight(sectionNumber) - this.SR_H_NIGN_TRYBA - 60;
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      const shelfBase = this.createShelf(isDual, sectionW)
      // this.setPosX(shelfBase, sectionNumber)
      this.setPosY(shelfBase, this.SR_H_NIGN_TRYBA + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf(isDual, sectionW)
        // this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, this.SR_H_NIGN_TRYBA + 60 + shelvesH * i);
        group.add(shelf);
      }
      group.add(shelfBase);
    }

    return group;
  }

  createFilling9And10(sectionNumber: number, isDual = false, yCount = 2, sectionW = 0) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    const cr = this.createFilling2(sectionNumber, isDual, sectionW);
    group.add(cr);
    const y = this.createY(yCount, isDual, sectionW);
    // this.setPosX(y, sectionNumber);
    group.add(y);
    return group;
  }

  createFilling11And12(sectionNumber: number, isDual = false, yCount = 2, sectionW = 0) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;
    const y = this.createY(yCount, isDual, sectionW);
    // this.setPosX(y, sectionNumber);
    group.add(y);
    group.add(this.createAddShelves(sectionNumber, this.SR_H_VNUTR_YASHCHIK, isDual, sectionW));
    return group;
  }

  createFilling13And14(sectionNumber: number, isDual = false, addCount = 0, sectionW = 0) {
    let group = new THREE.Group();
    // group.name = 'Filling' + sectionNumber;

    let sH = this.calcSectionHeight(sectionNumber);
    const shelvesCount = this.calcShelvesCount(sH) + addCount;
    const shelvesH = sH / (shelvesCount);

    let startYPos = 0;

    const {srH, SR_antr, SR_H_antr, SR_yaschiki_vneshnie} = this.data;

    if (Number(SR_yaschiki_vneshnie) === 1) {
      const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
      // @ts-ignore
      const block = scheme.find((item: Block) => {
        if (item.startPos <= +sectionNumber && +sectionNumber <= item.endPos) { //<= item.endPos
          return item;
        }
      });
      if (block) {
        startYPos = this.hY * block.SR_yaschiki_vneshnie_kol;
      }
    }

    for (let i = 1; i < shelvesCount; i++) {
      const test = this.createShelf(isDual, sectionW)
      // this.setPosX(test, sectionNumber);
      this.setPosY(test, startYPos + shelvesH * i);
      group.add(test);
    }
    return group;
  }

  private calcSectionHeight(sectionNumber: number) {
    const {srH, SR_antr, SR_H_antr, SR_yaschiki_vneshnie} = this.data;
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    let emptySectionH = srH - 80 - depth * 2;
    let yH = 0;

    if (Number(SR_yaschiki_vneshnie) === 1) {
      const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
      // @ts-ignore
      const block = scheme.find((item: Block) => {
        if (item.startPos <= +sectionNumber && +sectionNumber <= item.endPos) { //<= item.endPos
          return item;
        }
      });
      if (block) {
        yH = this.hY * block.SR_yaschiki_vneshnie_kol;
        emptySectionH -= yH;
      }
    }
    if (SR_antr) emptySectionH -= SR_H_antr;
    return emptySectionH;
  }

  private calcShelvesCount(emptySectionH: number) {
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    const shelvesCount = Math.trunc(emptySectionH / (this.SR_H_MIN_POLKA + depth));
    return shelvesCount;
  }

  private setPosX(group: any, sectionNumber: number, sectionW = 0) {
    console.log(group);
    const pos = this.cabinetConfiguratorService.nextSectionNumber(sectionNumber); // ? sectionNumber - 1 : 0;
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    console.log({pos, sectionNumber});

    console.log(group.type)

    const obj = group.type === "Group" ? group.children[0] : group;
    let par = obj.geometry.type === 'CylinderGeometry' ? 'height' : 'width';
    const sW = obj.geometry.parameters[par];
    console.log(par)
    console.log(sW)
    console.log('setPosX', this.data.wSect)
    group.position.x = ((-this.data.srL + sW + 4) / 2) + ((sectionW + depth) * pos) + depth;


    // group.position.x = ((-this.data.srL + this.data.wSect + depth) / 2) + (pos * (this.data.wSect));
  }

  private setPosY(group: any, addYPos: number) {
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    group.position.y = -this.data.srH / 2 + depth + 80 + addYPos;
  }

  private createCube(w: number, h: number, d: number, opacity = 1, test = true, color = 0xffffff): THREE.Mesh {
    const textureMaterial = test ? new THREE.MeshBasicMaterial({map: this.texture}) :
      new THREE.MeshBasicMaterial({color: color, opacity: opacity, transparent: true});

    const geometry = new THREE.BoxGeometry(w, h, d);
    const cube = new THREE.Mesh(geometry, textureMaterial);

    const edges = new THREE.EdgesGeometry(geometry);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000, linewidth: 6,
      transparent: true,
      opacity: opacity
    }); // Black border
    const line = new THREE.LineSegments(edges, lineMaterial);


    cube.add(line)
    return cube
  }
}
