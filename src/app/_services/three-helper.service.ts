import {ElementRef, inject, Injectable} from '@angular/core';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CabinetConfiguratorService} from './cabinet-configurator.service';
import {Steps} from '../_shared/components/stepper/stepper.component';
import {Wardrobe} from '../_models/wardrobe.model';
import {Block} from '../_models/block.model';
import {FillingSectionsService} from './ filling-sections.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeHelperService {

  cabinetConfiguratorService = inject(CabinetConfiguratorService)
  fillingSectionsService = inject(FillingSectionsService)

  // Высота цоколя 80мм
  plinth = 80;
  // Ширина Материала
  depth = 16;
  // Внешние выдвижные ящики
  yvH = 200;

  private canvasContainerRef!: ElementRef;

  parentSize: { width: number; height: number } | null = null;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private mesh!: THREE.Mesh;
  private controls!: OrbitControls;

  private texture = new THREE.TextureLoader().load('img/qwe.jpg');

  setElement(el: ElementRef): void {
    this.canvasContainerRef = el;
  }

  clearScene() {
    while (this.scene.children.length > 0) {
      this.scene.remove(this.scene.children[0]);
    }
  }

  private getParentSize() {
    const parentElement = this.canvasContainerRef.nativeElement.parentElement;
    console.log(parentElement.offsetWidth)
    console.log(parentElement.offsetHeight)
    if (parentElement) {
      this.parentSize = {
        width: parentElement.offsetWidth,
        height: parentElement.offsetHeight
      };
    }
  }

  initThreeJs() {
    this.getParentSize();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FFF');
    if (!this.parentSize) {
      return;
    }
    console.log('initThreeJs')

    this.camera = new THREE.PerspectiveCamera(75, this.parentSize?.width / this.parentSize?.height, 1, 4500);
    this.camera.position.set(0, 0, 3000);
    this.renderer = new THREE.WebGLRenderer(
      {
        // antialias: true,
        // alpha: true
      }
    );
    this.renderer.setSize(this.parentSize.width, this.parentSize.height);

//
// Добавляем оси (красная - X, зеленая - Y, синяя - Z)
//     const axesHelper = new THREE.AxesHelper(1000);
//     this.scene.add(axesHelper);

// Добавляем сетку
//     const gridHelper = new THREE.GridHelper(120, 120); // Размер сетки, количество сегментов
//     this.scene.add(gridHelper);

    // Добавление управления камерой
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.05;

    this.canvasContainerRef.nativeElement.appendChild(this.renderer.domElement);

    // const group = new THREE.Group();
    // const meshes: THREE.Mesh[] = [];
    //
    //
    // group.add(...meshes);
    //
    // group.rotation.set(0, 0, 0);
    //
    //
    // this.scene.add(group);


    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update(1)
    this.renderer.render(this.scene, this.camera);
  }

  createCabinet(step?: Steps) {
    // todo
    // this.scene.clear();
    switch (step) {
      case Steps.one: {
        this.createBaseCabinet()
        this.scene.add(this.fillingSectionsService.createCylinder());
        this.scene.add(this.fillingSectionsService.createY());
        // this.scene.add(this.fillingSectionsService.createShelf());
        // this.scene.add(this.fillingSectionsService.createCoatHanger());

        // this.createDimensions();
        break;
      }
      case Steps.two: {
        // this.createBaseCabinet();
        // this.createStepTwoDimensions();

        this.addDoorsToCabinet();
        // this.addVYToCabinet();
        // this.addAntresoli();
        // this.addSrPlanka();
        this.scene.add(this.fillingSectionsService.createY());
        this.addSectionsToCabinet();
        break;
      }
      case Steps.three: {
        console.log('Steps.three')
        // this.scene.clear();
        // this.createBaseCabinet()
        // this.addSectionsToCabinet();
        // this.addDoorsToCabinet();
        // while(this.scene.children.length > 0) {
        //   this.scene.remove(this.scene.children[0]);
        // }
      }
    }
  }

  private createBaseCabinet() {
    this.removeByGroupName('Cabinet');
    const data = this.cabinetConfiguratorService.getWardrobe();
    this.depth = data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    const group = new THREE.Group();
    group.name = 'Cabinet';
    const meshes: THREE.Mesh[] = [];
    const walls =
      this.createWalls(data.srL, data.srH, data.srG, this.depth, data?.SR_tsokol.toString());

    walls.forEach(wall => {
      wall.element.position.set(wall.position.x, wall.position.y, wall.position.z);
      wall.element.name = wall.name;
      debugger
      meshes.push(wall.element)
      //
    })
    group.add(...meshes);
    this.scene.add(group);
  }

  private addSectionsToCabinet() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    this.removeByGroupName('Sections');
    console.log('addSectionsToCabinet', data);

    const group = new THREE.Group();

    group.name = 'Sections';
    const meshes: THREE.Mesh[] = [];
    const sections = this.createSections(data.srL, data.srH, data.srG, this.depth, data.srK, scheme);


    sections.forEach(section => {
      section.element.position.set(section.position.x, section.position.y, section.position.z);
      meshes.push(section.element)
    })

    group.add(...meshes);
    this.scene.add(group);

  }

  private addSrPlanka() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    console.log('addSrPlanka data', data);
    console.log('addSrPlanka data', data.SR_tsokol);

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const planki = this.createPlanki(data.srL, data.srH, data.srG, this.depth, data.srK, data);

    if (!planki.length) return;


    planki.forEach(planka => {
      planka.element.position.set(planka.position.x, planka.position.y, planka.position.z);
      meshes.push(planka.element)
    })

    group.add(...meshes);
    this.scene.add(group);


  }

  private createPlanki(w: number, h: number, d: number, thickness: number, srK: number, data: Wardrobe) {
    console.log('data.SR_tsokol', data.SR_tsokol)


    console.log('data.SR_tsokol', data.SR_tsokol)

    const res = [];
    if (data?.SR_PLANKA_VERH_CHENTR) {
      res.push(
        {
          name: 'верхняя потолок крепёж',
          element: this.createCube(w - thickness * 4, data.SR_H_PLANKA_VERH, thickness, 1, false, 0xFFA500),
          position: {x: 0, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: (d + thickness) / 2 - thickness},
        },
      );
      res.push(
        {
          name: 'верхняя потолок',
          element: this.createCube(w, data.SR_H_PLANKA_VERH, thickness),
          position: {x: 0, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: (d + thickness) / 2},
        },
      );
    }
    if (data?.SR_PLANKA_VERH_LEV) {
      res.push(
        {
          name: 'левая потолок крепёж',
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d, 1, false, 0xFFA500),
          position: {x: (-w / 2) + thickness / 2 + thickness, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: -1},
        },
      );
      res.push(
        {
          name: 'левая потолок',
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d),
          position: {x: (-w / 2) + thickness / 2, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: -1},
        },
      );
    }
    if (data?.SR_PLANKA_VERH_PRAV) {
      res.push(
        {
          name: 'правая потолок крепёж',
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d, 1, false, 0xFFA500),
          position: {x: (w / 2) - thickness / 2 - thickness, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: -1},
        },
      );
      res.push(
        {
          name: 'правая потолок',
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d),
          position: {x: (w / 2) - thickness / 2, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: -1},
        },
      );
    }

    const plankaBokD = 100;
    const plankaBokH = +data.SR_tsokol === 0 ? h : h - this.plinth;
    const plankaBokYPos = +data.SR_tsokol === 0 ? 0 : this.plinth / 2;

    if (data?.SR_H_PLANKA_BOK_PRAV) {
      res.push(
        {
          name: 'правая',
          element: this.createCube(thickness, plankaBokH, plankaBokD),
          position: {x: (w / 2) + thickness / 2, y: plankaBokYPos, z: (d - plankaBokD) / 2 + thickness},
        },
      )
    }

    if (data?.SR_H_PLANKA_BOK_LEV) {
      res.push(
        {
          name: 'левая',
          element: this.createCube(thickness, plankaBokH, plankaBokD),
          position: {x: (-w / 2) - thickness / 2, y: plankaBokYPos, z: (d - plankaBokD) / 2 + thickness},
        },
      )
    }

    let plankaBokCenterW = w;
    let plankaBokCenterXPos = 0;

    if (data?.SR_H_PLANKA_BOK_PRAV) {
      plankaBokCenterW += thickness;
      plankaBokCenterXPos += thickness;
    }
    if (data?.SR_H_PLANKA_BOK_LEV) {
      plankaBokCenterW += thickness;
      plankaBokCenterXPos -= thickness;
    }

    if (data?.SR_PLANKA_BOK_CHENTR) {
      res.push(
        {
          name: 'верхняя',
          element: this.createCube(plankaBokCenterW, thickness, plankaBokD),
          position: {x: plankaBokCenterXPos / 2, y: h / 2 + this.depth / 2, z: (d - plankaBokD) / 2 + thickness},
        },
      )
    }

    return res;
  }

  private addAntresoli() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    if (data.SR_antr.toString() === '0') return;

    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();


    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];


    const list = this.createAntresoli(data.srL, data.srH, data.srG, this.depth, data.srK, data);


    list.forEach((yv: any) => {
      yv.element.position.set(yv.position.x, yv.position.y, yv.position.z);
      meshes.push(yv.element)
    })


    group.add(...meshes);
    this.scene.add(group);
  }

  createAntresoli(w: number, h: number, d: number, thickness: number, srK: number, data: Wardrobe) {

    const wSect = ((w) / srK) - thickness;
    const doorW = wSect + thickness;
    let doors = []

    for (let i = 0; i < srK; i++) {
      let doorH = data.SR_H_antr;

      const startX = (-w / 2) + (doorW / 2)

      const startY = data.SR_niz_dveri.toString() === '0' ? this.plinth : 0;

      const door = {
        bloc: i,
        section: i,
        name: 'Антресоль',
        element: this.createCube(doorW, doorH, thickness),
        position: {
          x: startX + i * doorW, //+ (doorW / 2) + (thickness / 2) + i * doorW  / 2,
          y: ((h - doorH) / 2), //+ this.plinth / 2 - thickness / 2,
          z: (d + thickness) / 2
        },
      }

      if (data?.SR_antr_blok.toString() !== '0') {
        doors.push(
          {
            name: 'верхняя',
            element: this.createCube(w, 0, d),
            position: {
              x: 0, y: h / 2 - doorH,
              //h / 2 - thickness / 2,
              z: 0
            },
          },
        );
      }


      doors.push(door);
    }
    return doors;
  }

  // External drawers
  private addVYToCabinet() {
    const data = this.cabinetConfiguratorService.getWardrobe();

    const schemeVY = this.cabinetConfiguratorService.getWardrobeScheme();

    if (!(schemeVY && schemeVY.length)) return;

    console.log('addSectionsToCabinet', schemeVY);

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];


    const YV = this.createYaschikVneshnie(data.srL, data.srH, data.srG, this.depth, data.srK, schemeVY);

    console.log({YV})

    YV.forEach((yv: any) => {
      yv.element.position.set(yv.position.x, yv.position.y, yv.position.z);
      meshes.push(yv.element)
    })


    group.add(...meshes);
    this.scene.add(group);
  }


  addDoorsToCabinet(doorCount: number = 0) {
    this.removeByGroupName('Doors')
    const data = this.cabinetConfiguratorService.getWardrobe();

    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    const group = new THREE.Group();
    group.name = 'Doors';
    const meshes: THREE.Mesh[] = [];
    // SR_niz_dveri
    const doors = this.createDoors(data.srL, data.srH, data.srG, this.depth, data.srK, scheme, data);

    doors.forEach(door => {
      door.element.position.set(door.position.x, door.position.y, door.position.z);
      door.element.name = door.name;
      meshes.push(door.element)
    })
    group.add(...meshes);
    this.scene.add(group);

  }

  private removeByGroupName(groupName: string) {
    this.scene.children.forEach(object => {
      if (object.name === groupName) {
        this.scene.remove(object);
      }
    });
  }

  // step 3
  public selectSection(sectionNumber: number | null, sectionType: number, openingDoorType: any) {

    console.log({sectionNumber, sectionType, openingDoorType});
    if (!sectionNumber) return;

    const test = this.scene.children.find((child: THREE.Object3D) =>
      child.name === 'Doors')

    console.log(test)

    test?.children.forEach((child: any, index) => {
      this.transparentDoor(child);
      if (child.userData && (child.userData === 'openDoorLeft' || child.userData === 'openDoorRight')) {
        this.closeDoor(child);
      }
    });

    test?.children.forEach((child: any, index) => {


      console.log({index, sectionNumber})
      console.log(index + 1 === +sectionNumber)


      if (index + 1 === +sectionNumber) {

        if (+openingDoorType === 1) {
          child.visible = false;
          if (+sectionType === 1) {
            test.children[index + 1].visible = false;
          }
          return;
        } else {
          child.visible = true;
          test.children[index + 1].visible = true;
        }

        console.log(index)
        console.log({sectionNumber})
        this.openDoor(child, +openingDoorType === 2 ? 'Right' : 'Left');

        // this.closeDoor(child);

        if (+sectionType === 1) {
          this.openDoor(test.children[index + 1], 'Right');
          // this.closeDoor(test.children[index + 1]);
        }


      }

    })

  }

  private transparentDoor(child: any) {
    const textureMaterial = new THREE.MeshBasicMaterial({map: this.texture, opacity: .6, transparent: true});
    child.material.dispose();
    child.material = textureMaterial;
  }

  private openDoor(child: any, side: 'Left' | 'Right' = 'Left') {
    const wSect = child.geometry.parameters.width;
    const axis = new THREE.Vector3(0, 1, 0);
    const degrees = 90; //
    const angle = degrees * (Math.PI / 180);
    const doorW = wSect + this.depth;
    const pos = child.position;

    if (side === 'Left') {
      child.position.set(pos.x - wSect / 2 + this.depth / 2, pos.y, pos.z + wSect / 2);
    }
    if (side === 'Right') {
      child.position.set(pos.x + wSect / 2 + this.depth / 2, pos.y, pos.z + wSect / 2);
    }

    child.userData = 'openDoor' + side;

    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(axis, angle);
    child.setRotationFromQuaternion(quaternion);
  }

  private closeDoor(child: any, side: 'Left' | 'Right' = 'Left') {
    const wSect = child.geometry.parameters.width;
    const axis = new THREE.Vector3(0, 1, 0);
    const angle = (Math.PI / 180);
    const doorW = wSect + this.depth;

    const pos = child.position;

    if (child.userData === 'openDoorLeft') {
      child.position.set(pos.x + wSect / 2 - this.depth / 2, pos.y, pos.z - wSect / 2);
    }
    if (child.userData === 'openDoorRight') {
      child.position.set(pos.x - wSect / 2 - this.depth / 2, pos.y, pos.z - wSect / 2);
    }

    child.userData = 'close'

    const quaternion = new THREE.Quaternion();

    quaternion.setFromAxisAngle(axis, angle);
    child.setRotationFromQuaternion(quaternion);
  }

  private createCube(w: number, h: number, d: number, opacity = 1, test = true, color = 0xffffff): THREE.Mesh {
    const textureMaterial = test ? new THREE.MeshBasicMaterial({map: this.texture}) :
      new THREE.MeshBasicMaterial({color: color});

    const geometry = new THREE.BoxGeometry(w, h, d);
    const cube = new THREE.Mesh(geometry, textureMaterial);

    const edges = new THREE.EdgesGeometry(geometry);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: .05,
      transparent: true,
      opacity: opacity
    }); // Black border
    const line = new THREE.LineSegments(edges, lineMaterial);


    cube.add(line)
    return cube
  }

  createSections(w: number, h: number, d: number, thickness: number, srK: number, scheme: Block[]) {

    const sectionW = (w - thickness - thickness * srK) / srK + thickness * 2;

    console.log({sectionW});

    let listS: any[] = []; // = scheme;


    for (let i = 1; i < srK; i++) {
      console.log('createSections h', h - thickness * 2 - this.plinth)

      const sect = {
        bloc: i,
        section: i,
        name: 'внешний выдвижной ящик',
        element: this.createCube(thickness, h - thickness * 2 - this.plinth, d),
        position: {
          x: (-w / 2) + sectionW * i - thickness / 2,
          y: this.plinth / 2, //thickness - (this.plinth / 2),
          z: 0
        },

        // position: {x: -w / 2 - (wYV / 2) - thickness + i * wYV, y: this.plinth * .1 / 2, z: d / 2},
      }
      listS.push(sect);
    }

    console.log({listS});
    return listS;
  }

  createYaschikVneshnie(w: number, h: number, d: number, thickness: number, srK: number, scheme: any[]) {
    // const wSect = ((w - thickness * 2) / srK) - thickness;

    const wSect = ((w) / srK) - thickness;

    // const doorW = wSect + thickness;

    const wYV = wSect * 2 + thickness;
    console.log({wYV})

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];

    const res: any = [];

    const el = this.createCube(wYV, this.yvH, thickness);


    for (let iS = 0; iS < scheme.length; iS++) {
      console.log('section', iS)
      const section = scheme[iS];
      const nextSection = scheme[iS + 1];

      console.log({section})

      const startX = (-w + wYV + thickness) / 2

      // x: startX  + i * doorW , //+ (doorW / 2) + (thickness / 2) + i * doorW  / 2,
      // y:  - ( (h - doorH) / 2) + this.plinth + allYVH, //+ this.plinth / 2 - thickness / 2,
      // z: (d + thickness) / 2
      for (let j = 0; j < section.SR_yaschiki_vneshnie_kol; j++) {
        // const startX = (-w / 2) + wYV / 2 + thickness / 2;
        const sect = {
          name: 'sect',
          element: this.createCube(wYV + thickness, this.yvH, thickness),
          position: {
            // (-w / 2) + (doorW / 2) + (thickness / 2) + i * doorW + thickness / 2
            x: startX + section.startPos * ((wYV + thickness) / 2),
            // x: (-w / 2) + (wYV / 2) + iS * wYV + thickness / 2 ,
            y: (this.plinth - h / 2 + 200 / 2) + 200 * j,
            z: (d + thickness) / 2
          },
        }
        res.push(sect)
      }
    }

    return res;

  }

  createDoors(w: number, h: number, d: number, thickness: number, srK: number, scheme: any[], data: Wardrobe) {
    // data.SR_niz_dveri.toString(), data.SR_antr.toString())

    const wSect = ((w) / srK) - thickness;
    const doorW = wSect + thickness;
    let doors = []
    for (let i = 0; i < srK; i++) {
      let qwe = null;
      qwe = scheme.find((item) => {
        return item.startPos === i || item.endPos === i;
      })
      let doorH = data.SR_niz_dveri.toString() === '0' ? h - this.plinth : h;
      let allYVH = 0;

      if (qwe) {
        allYVH = qwe.SR_yaschiki_vneshnie_kol * this.yvH;
        doorH = doorH - allYVH;

      }

      if (data.SR_antr.toString() === '1') {

        console.log('1111111111111111111111111')

        console.log(data.SR_H_antr)
        doorH = doorH - data.SR_H_antr;
      }


      const startX = (-w / 2) + (doorW / 2)

      const startY = data.SR_niz_dveri.toString() === '0' ? this.plinth : 0;

      const door = {
        bloc: i,
        section: i,
        name: 'door',
        element: this.createCube(doorW, doorH, thickness),
        position: {
          x: startX + i * doorW, //+ (doorW / 2) + (thickness / 2) + i * doorW  / 2,
          y: -((h - doorH) / 2) + startY + allYVH, //+ this.plinth / 2 - thickness / 2,
          z: (d + thickness) / 2
        },
      }
      doors.push(door);
    }
    return doors;
  }

  // Создаем объемные стены шкафа
  private createWalls(w: number, h: number, d: number, thickness: number, SR_tsokol = '0') {

    const baseH = SR_tsokol === '0' ? h : h - this.plinth - thickness;
    const boxwoodCupboardYPos = SR_tsokol === '0' ? 0 : (thickness + this.plinth) / 2;
    const lowerPartW = SR_tsokol === '0' ? w - 2 * thickness : w;

    const res: any = [];

    switch (SR_tsokol) {
      case '0':
        res.push(...this.cololZero(w, h, d, thickness));
        break;
      case '1':
        res.push(...this.cocolOne(w, h, d, thickness));
        break;
      case '2':
        res.push(
          {
            name: 'цоколь п',
            element: this.createCube(w, this.plinth, thickness),
            position: {x: 0, y: -(h / 2 - this.plinth / 2), z: d / 2 - thickness / 2},
          },
        )

        break;

      default:
        res.push(...this.cololZero(w, h, d, thickness));

    }

    return [
      ...res,
      {
        name: 'левая боковая',
        element: this.createCube(thickness, baseH, d),
        position: {x: (-w / 2) + thickness / 2, y: boxwoodCupboardYPos, z: 0},
      },
      {
        name: 'правая боковая',
        element: this.createCube(thickness, baseH, d),
        position: {x: w / 2 - thickness / 2, y: boxwoodCupboardYPos, z: 0},
      },
      {
        name: 'верхняя',
        element: this.createCube(w - 2 * thickness, thickness, d),
        position: {x: 0, y: h / 2 - thickness / 2, z: 0},
      },
      {
        name: 'нижняя',
        element: this.createCube(lowerPartW, thickness, d),
        position: {x: 0, y: -(h / 2 - thickness / 2 - this.plinth), z: 0},
      },
    ]
  }

  private cololZero(w: number, h: number, d: number, thickness: number) {
    return [
      {
        name: 'цоколь п',
        element: this.createCube(w - 2 * thickness, this.plinth, thickness),
        position: {x: 0, y: -(h / 2 - this.plinth / 2), z: d / 2 - thickness / 2},
      },
      {
        name: 'цоколь з',
        element: this.createCube(w - 2 * thickness, this.plinth, thickness),
        position: {x: 0, y: -(h / 2 - this.plinth / 2), z: -(d / 2 - thickness / 2)},
      },
    ]
  }

  private cocolOne(w: number, h: number, d: number, thickness: number) {

    // todo
    const plintus = 25;

    const wCocol = w - 2 * plintus;

    return [
      {
        name: 'цоколь л',
        element: this.createCube(thickness, this.plinth, d - 2 * thickness - plintus),
        // position: {x: (-w / 2) + thickness + thickness / 2 , y: -(h / 2 - this.plinth / 2), z: plintus},
        position: {
          x: (-w / 2) + thickness + thickness / 2 + plintus,
          y: -(h / 2 - this.plinth / 2),
          z: plintus / 2
        }
      },
      {
        name: 'цоколь п',
        element: this.createCube(thickness, this.plinth, d - 2 * thickness - plintus),
        position: {x: (w / 2) - thickness - thickness / 2 - plintus, y: -(h / 2 - this.plinth / 2), z: plintus / 2},
      },
      {
        name: 'цоколь п',
        element: this.createCube(wCocol, this.plinth, thickness),
        position: {x: 0, y: -(h / 2 - this.plinth / 2), z: d / 2 - thickness / 2},

      },
      {
        name: 'цоколь з',
        element: this.createCube(wCocol, this.plinth, thickness),
        position: {x: 0, y: -(h / 2 - this.plinth / 2), z: -(d / 2 - thickness / 2 - plintus)},
      }
    ];
  }

//   size
  createOuterDimensionLine(start: any, end: any, extension = 0.3, color = 0x000000, isHorizontal = true) {
    const group = new THREE.Group();

    // Основная линия
    const mainPoints = [start, end];
    const mainGeometry = new THREE.BufferGeometry().setFromPoints(mainPoints);
    const mainMaterial = new THREE.LineBasicMaterial({
      color: color,
      linewidth: 3
    });
    const mainLine = new THREE.Line(mainGeometry, mainMaterial);
    group.add(mainLine);

    if (isHorizontal) {
    }

    // Выносные линии
    const createExtensionLine = (position: any) => {
      const points = [
        new THREE.Vector3(position.x, position.y, position.z),
        new THREE.Vector3(
          isHorizontal ? position.x : position.x + extension,
          isHorizontal ? position.y + extension : position.y, position.z)
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({color: color});
      return new THREE.Line(geometry, material);
    };

    group.add(createExtensionLine(start));
    group.add(createExtensionLine(end));

    return group;
  }

  createTextLabel(text: string, position: any, color = 0xffffff, size = 200, isHorizontal = true) {
    const canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    if (!context) return;
    canvas.width = 256;
    canvas.height = 64;

    // canvas.translate = 'translate(0, 90px)';

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = '30px Arial';
    context.fillStyle = `rgb(${(color >> 16) & 0xff}, ${(color >> 8) & 0xff}, ${color & 0xff})`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.strokeText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      rotation: isHorizontal ? 0 : Math.PI / 2
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(size * 2.5, size * 0.7, 1);

    return sprite;
  }

  // createArrow(position: any, rotation: any, color:any, size = 0.1) {
  //   const coneGeometry = new THREE.ConeGeometry(0.08, 0.15, 8);
  //   const coneMaterial = new THREE.MeshBasicMaterial({ color });
  //   const arrow = new THREE.Mesh(coneGeometry, coneMaterial);
  //   arrow.position.copy(position);
  //   arrow.rotation.x = rotation;
  //   arrow.scale.set(size, size, size);
  //   return arrow;
  // }

  private dimensionsGroup: THREE.Group = new THREE.Group();
  private dimensionsViewGroup!: THREE.Group;

  createDimensions(offset = 200) {
    console.log(this.scene)
    const data = this.cabinetConfiguratorService.getWardrobe();

    // Удаляем старые размеры если есть

    this.resetSizes();
    // if (this.dimensionsGroup) {
    //   this.scene.remove(this.dimensionsGroup);
    //   this.dimensionsGroup.children.forEach(child => {
    //     console.log('createDimensions IF')
    //     // if (child?.geometry) child?.geometry.dispose();
    //     // if (child?.material) child?.material.dispose();
    //   });
    // }

    this.dimensionsGroup = new THREE.Group();

    console.log(data)

    // ШИРИНА (X)
    const widthLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      new THREE.Vector3(data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      offset,
      0x000
    );
    console.log('widthLine', widthLine)
    this.dimensionsGroup.add(widthLine);


    const widthLabel = this.createTextLabel(
      `${data.srL}mm`,
      new THREE.Vector3(0, -data.srH / 2 - offset + 50, data.srG / 2),
      0x000
    );
    if (widthLabel) {
      this.dimensionsGroup.add(widthLabel);
    }

    // ВЫСОТА
    const heightLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2 - offset, -data.srH / 2, data.srG / 2),
      new THREE.Vector3(-data.srL / 2 - offset, data.srH / 2, data.srG / 2),
      // new THREE.Vector3(this.cubeSize/2 + offset, this.cubeSize/2 + offset, this.cubeSize/2 + offset/2),
      offset,
      0x000,
      false
      // 0x44ff44
    );
    this.dimensionsGroup.add(heightLine);

    const heightLabel = this.createTextLabel(
      `${data.srH}mm`,
      new THREE.Vector3(-data.srL / 2 - offset - 50, 0, data.srG / 2),
      0x000,
      200,
      false
    );
    if (heightLabel) {
      this.dimensionsGroup.add(heightLabel);
    }

    this.scene.add(this.dimensionsGroup);
  }

  createStepTwoDimensions() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    this.dimensionsGroup = new THREE.Group();
    const offset = 150;

    this.createDimensions(450);
    this.createBaseDimension(data);
    this.createCabinetHDimension(data);
    this.createSectionHDimension(data)

    // X dimensions
    const widthSectionLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      new THREE.Vector3(data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      offset,
      0x000
    );
    console.log('widthLine', widthSectionLine)
    this.dimensionsGroup.add(widthSectionLine);

    let remainderWSect = data.srL % data.srK;


    for (let i = 0; i < data.srK; i++) {
      const testAl = this.createOuterDimensionLine(
        new THREE.Vector3(-data.srL / 2 + data.wSect * i, -data.srH / 2 - offset, data.srG / 2),
        new THREE.Vector3(-data.srL / 2 + data.wSect * i, -data.srH / 2 - offset, data.srG / 2),
        offset,
        0x000
      );

      let wSectLabel = Math.trunc(data.wSect)

      if (remainderWSect > 0) {
        ++wSectLabel;
        --remainderWSect;
      }


      console.log('widthLine', data.srL / data.srK)
      const sWidthLabel = this.createTextLabel(
        `${wSectLabel}mm`,
        new THREE.Vector3((-data.srL + data.wSect) / 2 + data.wSect * i, -data.srH / 2 - offset + 50, data.srG / 2),
        0x000
      );
      if (sWidthLabel) {
        this.dimensionsGroup.add(sWidthLabel);
      }

      this.dimensionsGroup.add(testAl);
    }

    this.scene.add(this.dimensionsGroup);
  }

  private createBaseDimension(data: Wardrobe, offset = 300) {
    const qwe = data.SR_tsokol.toString() === '0' ? this.depth : 25;

    const widthLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2 + qwe, -data.srH / 2 - offset, data.srG / 2),
      new THREE.Vector3(data.srL / 2 - qwe, -data.srH / 2 - offset, data.srG / 2),
      offset,
      0x000
    );
    this.dimensionsGroup.add(widthLine);

    const widthLabel = this.createTextLabel(
      `${data.srL - qwe * 2}mm`,
      new THREE.Vector3(0, -data.srH / 2 - offset + 50, data.srG / 2),
      0x000
    );
    if (widthLabel) {
      this.dimensionsGroup.add(widthLabel);
    }
  }

  private createSectionHDimension(data: Wardrobe, offset = 150) {
    this.createCabinetHDimension(data, 150, true);

    const dimensionPlinthData = {
      x: -data.srL / 2 - offset,
      y: -data.srH / 2,
      z: data.srG / 2,
      x1: this.plinth
    }

    this.createDem(dimensionPlinthData);

    if (data.SR_antr) {
      const dimensionAntrData = {
        x: -data.srL / 2 - offset,
        y: data.srH / 2,
        z: data.srG / 2,
        x1: -data.SR_H_antr
      }
      this.createDem(dimensionAntrData)
    }

    if (data.SR_yaschiki_vneshnie) {
      const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
      let yaschikiSet: Set<number> = new Set();
      if (scheme?.length) {
        scheme.forEach(scheme => {
          yaschikiSet.add(+scheme?.SR_yaschiki_vneshnie_kol);

        });
      }

      for (let i = 0; i < Math.max(...yaschikiSet); i++) {
        const offset = 150;
        const dimensionYaschikiData = {
          x: -data.srL / 2 - offset,
          y: -data.srH / 2 + this.plinth + i * this.yvH,
          z: data.srG / 2,
          x1: this.yvH
        }

        this.createDem(dimensionYaschikiData);
      }

    } else {
      let doorH = data.srH - this.plinth;
      let antrH = 0;
      if (data.SR_antr.toString() === '1') {
        antrH = data.SR_H_antr;
      }

      const dimensionDoorData = {
        x: -data.srL / 2 - offset,
        y: data.srH / 2 - doorH,
        z: data.srG / 2,
        x1: doorH - antrH
      }
      this.createDem(dimensionDoorData);
    }

    if (data.SR_PLANKA_VERH_CHENTR || data.SR_PLANKA_VERH_LEV || data.SR_PLANKA_VERH_PRAV) {
      const offset = 450;
      const dimensionPlankaData = {
        x: -data.srL / 2 - offset,
        y: data.srH / 2,
        z: data.srG / 2,
        x1: data.SR_H_PLANKA_VERH
      }
      this.createDem(dimensionPlankaData);
    }
  }

  private createDem(data: {
    x: number,
    y: number,
    z: number,
    x1: number
  }, color = 0xffffff, size = 200, isHorizontal = true) {

    const {x, y, z, x1} = data;
    const vector = this.createOuterDimensionLine(
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x, y + x1, z),
      450,
      0x000,
      false
    );

    const textLabel = this.createTextLabel(
        Math.abs(x1).toString(),
        new THREE.Vector3(x - 50, y + x1 / 2, z),
        0x000,
        200,
        false
      )
    ;

    if (textLabel) {
      this.dimensionsGroup.add(textLabel);
    }

    this.dimensionsGroup.add(vector);
  }

  private createCabinetHDimension(data: Wardrobe, offset = 300, withoutLabel = false) {
    const heightLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2 - offset, -data.srH / 2 + this.plinth, data.srG / 2),
      new THREE.Vector3(-data.srL / 2 - offset, data.srH / 2, data.srG / 2),
      // new THREE.Vector3(this.cubeSize/2 + offset, this.cubeSize/2 + offset, this.cubeSize/2 + offset/2),
      offset,
      0x000,
      false
      // 0x44ff44
    );
    this.dimensionsGroup.add(heightLine);

    if (withoutLabel) return;

    const heightLabel = this.createTextLabel(
      `${data.srH - this.plinth}mm`,
      new THREE.Vector3(-data.srL / 2 - offset - 50, 0, data.srG / 2),
      0x000,
      200,
      false
    );
    if (heightLabel) {
      this.dimensionsGroup.add(heightLabel);
    }
  }

  resetSizes() {
    this.scene.remove(this.dimensionsGroup);
    this.dimensionsGroup.clear();
    // this.dimensionsGroup.children.forEach(child => {})
  }
}
