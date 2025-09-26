import {inject, Injectable} from '@angular/core';
import * as THREE from 'three';
import {CabinetConfiguratorService} from './cabinet-configurator.service';

@Injectable({
  providedIn: 'root'
})
export class FillingSectionsService {

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

    cylinder.position.set(0, srH / 2 - 200, 0);

    return cylinder;
  }

  createY(count = 4) {
    const {srL, srH, srG, wSect, SR_G_fasad} = this.data;

    const group = new THREE.Group();
    group.name = 'shelves';
    const meshes: THREE.Mesh[] = [];
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseH = count * (this.hY + depth) + depth;
    const baseW = wSect - depth - depth / 2;

    const shelfW = baseW - depth - depth;

    const base = this.createCube(baseW, baseH, srG);

    // Internal drawers
    for (let i = 0; i < count; i++) {
      const y = this.createCube(shelfW, this.hY, srG);
      y.position.z = 10;
      y.position.y = ((-baseH + this.hY) / 2) + depth + ((this.hY + depth) * i);

      group.add(y);
    }


    group.add(base);

    group.position.set((-srL + baseW) / 2 + depth + ((baseW + depth) * 1), (-srH + baseH) / 2 + 80 + depth, 0);

    return group;
  }

  public createShelf(count = 4) {
    const {srL, srH, srG, wSect, SR_G_fasad} = this.data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const baseW = wSect - depth - depth / 2;

    const shelf = this.createCube(baseW, depth, srG)

    const group = new THREE.Group();
    group.name = 'shelves';

    group.add(shelf);

    return group;
  }

  createCoatHanger() {
    const hangerGroup = new THREE.Group();

    // Крючок (изогнутая труба)
    const hookCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 20, 0),
      new THREE.Vector3(3, 22, 0),
      new THREE.Vector3(0, 24, 0)
    ]);

    const hookGeometry = new THREE.TubeGeometry(hookCurve, 20, 0.03, 8, false);
    const hookMaterial = new THREE.MeshStandardMaterial({color: 0x8B4513});
    const hook = new THREE.Mesh(hookGeometry, hookMaterial);
    hook.castShadow = true;

    // Основание вешалки (треугольник)
    const basePoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(8, 4),
      new THREE.Vector2(0, 8),
      new THREE.Vector2(-8, 4)
    ];

    const baseShape = new THREE.Shape(basePoints);
    const baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelSegments: 3
    });

    const baseMaterial = new THREE.MeshStandardMaterial({
      color: 0xC0C0C0,
      metalness: 0.8,
      roughness: 0.2
    });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 18;
    base.rotation.x = Math.PI / 2;
    base.castShadow = true;

    hangerGroup.add(hook);
    hangerGroup.add(base);

    return hangerGroup;
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
