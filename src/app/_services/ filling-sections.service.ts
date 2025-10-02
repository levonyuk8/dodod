import {inject, Injectable} from '@angular/core';
import * as THREE from 'three';
import {CabinetConfiguratorService} from './cabinet-configurator.service';

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

  public createCylinder() {
    // Создание цилиндра 30, 30, 400

    const {srL, srH, srG, wSect, SR_G_fasad} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseW = wSect - depth - depth / 2;

    const geometry = new THREE.CylinderGeometry(20, 20, baseW, 50);

    const material = new THREE.MeshBasicMaterial({color: 'gray'});

    const axis = new THREE.Vector3(0, 0, 1);
    const degrees = 90; //
    const angle = degrees * (Math.PI / 180);

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);


    const cylinder = new THREE.Mesh(geometry, material);
    cylinder.setRotationFromQuaternion(quaternion);

    // cylinder.rotation.y = 90 * Math.PI / 2

    // cylinder.position.set(0, srH / 2 - 200, 0);

    return cylinder;
  }

  createY(count = 3) {
    const {srG, wSect, SR_G_fasad} = this.data;

    const group = new THREE.Group();
    group.name = 'y';
    const meshes: THREE.Mesh[] = [];
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseH = (count * this.hY) + (count - 1) * 30 + depth;
    const baseW = wSect - depth - depth / 2;

    const shelfW = baseW - depth - depth;

    const base = this.createCube(baseW, depth, srG);
    const base2 = this.createCube(baseW, depth, srG);
    const base3 = this.createCube(depth, baseH - depth, srG);
    const base4 = this.createCube(depth, baseH - depth, srG);

    this.setPosY(base, this.SR_H_VNUTR_YASHCHIK);
    this.setPosY(base2, this.SR_H_VNUTR_YASHCHIK - baseH);
    this.setPosY(base3, this.SR_H_VNUTR_YASHCHIK - baseH / 2);
    this.setPosY(base4, this.SR_H_VNUTR_YASHCHIK - baseH / 2);

    base3.position.x = base3.position.x - (baseW - depth) / 2;
    base4.position.x = base4.position.x + (baseW - depth) / 2;

    for (let i = 0; i < count; i++) {
      const y = this.createCube(shelfW, this.hY, srG);
      y.position.y = base.position.y - depth / 2 - this.hY / 2 - ((this.hY + 30) * i);
      group.add(y);
    }


    group.add(base);
    group.add(base2);
    group.add(base3);
    group.add(base4);

    return group;
  }

  public createShelf() {
    const {srL, srH, srG, wSect, SR_G_fasad} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseW = wSect - depth - depth / 2;

    const shelf = this.createCube(baseW, depth, srG)

    const group = new THREE.Group();
    group.name = 'shelves';

    group.add(shelf);

    return group;
  }

  public addFillingToSection(sectionNumber: number | null = 1, type = 7) {
    console.log('addFillingToSection', sectionNumber);
    let group = new THREE.Group();
    group.clear();

    switch (type) {
      case 2:
        group = this.createFilling2(sectionNumber);
        break
      case 3:
        group = this.createFilling3(sectionNumber);
        break
      case 4:
        group = this.createFilling4(sectionNumber);
        break
      case 5:
        group = this.createFilling5(sectionNumber);
        break
      case 6:
        group = this.createFilling6(sectionNumber);
        break

      case 7:
        group = this.createFilling7(sectionNumber);
        break
      case 8:
        group = this.createFilling8(sectionNumber);
        break
      case 9:
        group = this.createFilling9And10(sectionNumber);
        break;
      case 10:
        group = this.createFilling9And10(sectionNumber, 3);
        break;
      case 11:
        group = this.createFilling11And12(sectionNumber);
        break;
      case 12:
        group = this.createFilling11And12(sectionNumber, 3);
        break;
      case 13:
        group = this.createFilling13And14(sectionNumber);
        break;
      case 14:
        group = this.createFilling13And14(sectionNumber, -1);
        break;
    }

    return group;
  }

  private additionalShelves(sectionNumber: number | null, addYPos: number = this.SR_H_SREDN_TRYBA) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    const sH = this.calcSectionHeight(sectionNumber);
    console.log(sH)
    if (sH > this.SR_H_NISHA_CENTR_STANDART + this.SR_H_MIN_POLKA) {
      console.log(`Additional Shelves ${sectionNumber}`);
      group.add(this.createAddShelves(sectionNumber, this.SR_H_NISHA_CENTR_STANDART));
    }
    return group;
  }

  private createAddShelves(sectionNumber: number | null, addYPos: number = this.SR_H_SREDN_TRYBA) {
    let group = new THREE.Group();
    const sH = this.calcSectionHeight(sectionNumber) - addYPos - 60;
    console.log('createAddShelves', {sH});
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      // const shelfBase = this.createShelf()
      // this.setPosX(shelfBase)
      // this.setPosY(shelfBase, addYPos + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf()
        this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, addYPos + 60 + shelvesH * i);
        group.add(shelf);
      }
      // group.add(shelfBase);
    }

    return group;
  }


  createFilling2(sectionNumber: number | null) {
    const cr = this.createCylinder();
    this.setPosX(cr, sectionNumber);
    this.setPosY(cr, this.SR_H_VERHN_TRYBA);
    const group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    group.add(cr);

    group.add(this.additionalShelves(sectionNumber, this.SR_H_VERHN_TRYBA));
    return group;
  }


  createFilling3(sectionNumber: number | null) {

    const gr = this.createFilling2(sectionNumber);

    const test = this.createShelf()

    this.setPosX(test, sectionNumber);
    this.setPosY(test, this.SR_H_NIGN_POLKA);

    gr.add(test);

    return gr;

  }

  createFilling4(sectionNumber: number | null) {

    const gr = this.createFilling2(sectionNumber);

    const test = this.createFilling3(sectionNumber)
    const test2 = this.createShelf()

    this.setPosX(test2, sectionNumber);
    this.setPosY(test2, this.SR_H_NIGN_POLKA * 2);

    gr.add(test);
    gr.add(test2);

    return gr;

  }

  createFilling5(sectionNumber: number | null) {

    const gr = this.createFilling2(sectionNumber);

    const test = this.createFilling4(sectionNumber)
    const test2 = this.createShelf()

    this.setPosX(test2, sectionNumber);
    this.setPosY(test2, this.SR_H_NIGN_POLKA * 3);

    gr.add(test);
    gr.add(test2);

    return gr;

  }

  createFilling6(sectionNumber: number | null) {
    const group = this.createFilling2(sectionNumber);
    const cr2 = this.createCylinder();
    this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, this.SR_H_NIGN_TRYBA);
    // const group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    group.add(cr2);
    group.add(cr2);
    return group;
  }

  createFilling7(sectionNumber: number | null, addYPos: number = this.SR_H_SREDN_TRYBA) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    const cr2 = this.createCylinder();
    this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, addYPos);
    group.add(cr2);
    const sH = this.calcSectionHeight(sectionNumber) - addYPos - 60;
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      const shelfBase = this.createShelf()
      this.setPosX(shelfBase)
      this.setPosY(shelfBase, addYPos + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf()
        this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, addYPos + 60 + shelvesH * i);
        group.add(shelf);
      }
      group.add(shelfBase);
    }

    return group;
  }

  createFilling8(sectionNumber: number | null) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    const cr2 = this.createCylinder();
    this.setPosX(cr2, sectionNumber);
    this.setPosY(cr2, this.SR_H_NIGN_TRYBA);
    group.add(cr2);
    const sH = this.calcSectionHeight(sectionNumber) - this.SR_H_NIGN_TRYBA - 60;
    const shelvesCount = this.calcShelvesCount(sH);
    const shelvesH = sH / shelvesCount;
    if (shelvesCount > 1) {
      const shelfBase = this.createShelf()
      this.setPosX(shelfBase)
      this.setPosY(shelfBase, this.SR_H_NIGN_TRYBA + 60);
      for (let i = 1; i < shelvesCount; i++) {
        const shelf = this.createShelf()
        this.setPosX(shelf, sectionNumber);
        this.setPosY(shelf, this.SR_H_NIGN_TRYBA + 60 + shelvesH * i);
        group.add(shelf);
      }
      group.add(shelfBase);
    }

    return group;
  }

  createFilling9And10(sectionNumber: number | null, yCount = 2) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    const cr = this.createFilling2(sectionNumber);
    group.add(cr);
    const y = this.createY(yCount);
    this.setPosX(y, sectionNumber);
    group.add(y);
    return group;
  }

  createFilling11And12(sectionNumber: number | null, yCount = 2) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;
    const y = this.createY(yCount);
    this.setPosX(y, sectionNumber);
    group.add(y);
    group.add(this.createAddShelves(sectionNumber, this.SR_H_VNUTR_YASHCHIK));
    return group;
  }

  createFilling13And14(sectionNumber: number | null, addCount = 0) {
    let group = new THREE.Group();
    group.name = 'Filling' + sectionNumber;

    let sH = this.calcSectionHeight(sectionNumber);
    const shelvesCount = this.calcShelvesCount(sH) + addCount;
    const shelvesH = sH / (shelvesCount);

    for (let i = 1; i < shelvesCount; i++) {
      const test = this.createShelf()
      this.setPosX(test, sectionNumber);
      this.setPosY(test, shelvesH * i);
      group.add(test);
    }
    return group;
  }

  private calcSectionHeight(sectionNumber: number | null) {
    const {srH, SR_antr, SR_H_antr} = this.data;
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    let emptySectionH = srH - 80 - depth * 2;
    if (SR_antr) emptySectionH -= SR_H_antr;
    return emptySectionH;
  }

  private calcShelvesCount(emptySectionH: number) {
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    const shelvesCount = Math.trunc(emptySectionH / (this.SR_H_MIN_POLKA + depth));
    console.log({shelvesCount})
    return shelvesCount;
  }

  private setPosX(group: any, sectionNumber: number | null = 1) {
    console.log(group);
    const pos = sectionNumber ? sectionNumber - 1 : 0;
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    console.log({pos, sectionNumber});
    group.position.x = ((-this.data.srL + this.data.wSect + depth) / 2) + (pos * (this.data.wSect));
  }

  private setPosY(group: any, addYPos: number) {
    const depth = this.data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    group.position.y = -this.data.srH / 2 + depth + 80 + addYPos;
  }

  private createCube(w: number, h: number, d: number, opacity = 1, test = true, color = 0xffffff): THREE.Mesh {
    const textureMaterial = test ? new THREE.MeshBasicMaterial({map: this.texture}) :
      new THREE.MeshBasicMaterial({color: color});

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
