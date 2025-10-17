import {ElementRef, inject, Injectable} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CabinetConfiguratorService} from './cabinet-configurator.service';
import {Steps} from '../_shared/components/stepper/stepper.component';
import {Wardrobe} from '../_models/wardrobe.model';
import {Block} from '../_models/block.model';
import {FillingSectionsService} from './ filling-sections.service';
import {WardrobeParamsService} from './wardrobe-params.service';

@Injectable({
  providedIn: 'root'
})
export class ThreeHelperService {

  cabinetConfiguratorService = inject(CabinetConfiguratorService)
  wardrobeParamsService = inject(WardrobeParamsService)
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
  private group = new THREE.Group();
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
    if (parentElement) {
      this.parentSize = {
        width: parentElement.offsetWidth,
        height: parentElement.offsetHeight
      };
    }
  }

  initThreeJs() {


// Использование


    this.getParentSize();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#FFF');
    if (!this.parentSize) {
      return;
    }

    this.camera = new THREE.PerspectiveCamera(75, this.parentSize?.width / this.parentSize?.height, 1, 5500);
    this.camera.position.set(0, 0, 2100);
    this.renderer = new THREE.WebGLRenderer(
      {
        antialias: true,
        // alpha: true
      }
    );

    this.renderer.setSize(this.parentSize.width, this.parentSize.height);

    // Добавление управления камерой
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.enableDamping = true;
    // this.controls.dampingFactor = 0.05;
    // this.controls.maxZoom = 0.1;
    // this.controls.minDistance = 1000;
    // this.controls.maxDistance = 4000;


    this.canvasContainerRef.nativeElement.appendChild(this.renderer.domElement);
    this.scene.add(this.group);
    // window.addEventListener('resize', this.onWindowResize, false);
    this.animate();
  }

  private onWindowResize() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (!this.camera) return;
    this.camera.aspect = newWidth / newHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(newWidth, newHeight);
  }

  private center(el: any) {
    const box = new THREE.Box3().setFromObject(el);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const params = box.getParameter(new THREE.Vector3(), new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = this.camera.fov * (Math.PI / 180); // Convert FOV to radians
    const cameraZ = Math.abs((maxDim / 2) / Math.tan(fov / 2));

    debugger;

    this.camera.position.set(center.x, center.y, center.z + cameraZ);
    this.camera.lookAt(center);

    this.controls.target.copy(center);
    this.controls.update();
  }

  createBoxWithBorders(width: any, height: any, depth: any, color = 0x8B4513) {
    const group = new THREE.Group();

    // Параметры геометрии
    const geometry = new THREE.BoxGeometry(width, height, depth);


    // Основной материал
    const boxMaterial = new THREE.MeshPhongMaterial({
      color: 0xFF0000,
      // transparent: true,
      // opacity: .9,
      // shininess: 100
    });

    // Создание основного бокса
    const box = new THREE.Mesh(geometry, boxMaterial);

    // box.position.set(width/2, height / 2, 0);
    group.add(box);

    // this.center(box);

    // Создание границ
    const edges = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: 0xFF0000,
      linewidth: 100  // Толщина границ
    });

    const borders = new THREE.LineSegments(edges, borderMaterial);
    group.add(borders);

    return group;
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  createCabinet(step?: Steps) {
    // todo
    const data = this.cabinetConfiguratorService.getWardrobe();
    switch (step) {
      case Steps.one: {
        // this.scene.clear();

        this.camera.position.set(0, 0, data.srH);
        this.createBaseCabinet(data)
        // this.scene.add(this.fillingSectionsService.createCylinder());
        // this.scene.add(this.fillingSectionsService.createY());
        // this.scene.add(this.fillingSectionsService.createShelf());
        // this.scene.add(this.fillingSectionsService.createCoatHanger());

        this.createDimensions();
        break;
      }
      case Steps.two: {
        this.scene.clear();
        this.createBaseCabinet(data);
        this.createStepTwoDimensions();

        this.addDoorsToCabinet();
        this.addVYToCabinet();
        this.addAntresoli();
        this.addSrPlanka();
        // this.scene.add(this.fillingSectionsService.createY());
        this.addSectionsToCabinet();
        break;
      }
      case Steps.three: {
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

  private createBaseCabinet(data: Wardrobe) {
    this.removeByGroupName('Cabinet');

    // this.depth = data.SR_G_fasad === 'ldsp16' ? 16 : 18;
    const group = new THREE.Group();
    group.name = 'Cabinet';
    const meshes: THREE.Mesh[] = [];
    const walls =
      this.createWalls(data.srL, data.srH, data.srG, this.depth, data?.SR_tsokol.toString());

    walls.forEach(wall => {
      wall.element.position.set(wall.position.x, wall.position.y, wall.position.z);
      wall.element.name = wall.name;
      meshes.push(wall.element)
      //
    })
    group.add(...meshes);
    this.scene.add(group);
  }

  private addSectionsToCabinet() {
    const doors: any = this.scene.children.find(child => {
      return child.name === 'Doors';
    })
    const doorW = doors?.children[0].geometry.parameters.width
    const data = this.cabinetConfiguratorService.getWardrobe();
    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();
    this.removeByGroupName('Sections');
    const group = new THREE.Group();
    group.name = 'Sections';
    const meshes: THREE.Mesh[] = [];
    const sections = this.createSections(data.srL, data.srH, data.srG, this.depth, data.srK, scheme, doorW);
    sections.forEach((section: any, index) => {
      if (index === sections.length - 1) {
        section.element.visible = false;
      }
      section.element.position.set(section.position.x, section.position.y, section.position.z);
      meshes.push(section.element)
    })
    group.add(...meshes);
    this.scene.add(group);
  }

  private addSrPlanka() {
    const data = this.cabinetConfiguratorService.getWardrobe();

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const planki = this.createPlanki(data.srL, data.srH, data.srG, this.depth, data.srK, data);

    if (!planki.length) return;


    planki.forEach(planka => {
      planka.element.position.set(planka.position.x, planka.position.y, planka.position.z);
      group.add(planka.element)
    })

    group.add(...meshes);
    this.scene.add(group);


  }

  private createPlanki(w: number, h: number, d: number, thickness: number, srK: number, data: Wardrobe) {
    const res = [];
    let plankaVCenterW = w;
    let plankaVCenterXPos = 0;
    if (data?.SR_H_PLANKA_BOK_PRAV) {
      plankaVCenterW += thickness;
      plankaVCenterXPos += thickness;
    }
    if (data?.SR_H_PLANKA_BOK_LEV) {
      plankaVCenterW += thickness;
      plankaVCenterXPos -= thickness;
    }
    if (data?.SR_PLANKA_VERH_CHENTR) {
      res.push(
        {
          name: 'верхняя потолок крепёж',
          element: this.createCube(w - thickness * 4, data.SR_H_PLANKA_VERH, thickness),
          position: {x: 0, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: (d + thickness) / 2 - thickness},
        },
      );
      res.push(
        {
          name: 'верхняя потолок',
          element: this.createCube(plankaVCenterW, data.SR_H_PLANKA_VERH, thickness),
          position: {x: plankaVCenterXPos / 2, y: h / 2 + data.SR_H_PLANKA_VERH / 2, z: (d + thickness) / 2},
        },
      );
    }
    if (data?.SR_PLANKA_VERH_LEV) {
      res.push(
        {
          name: 'левая потолок крепёж',
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d),
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
          element: this.createCube(thickness, data.SR_H_PLANKA_VERH, d),
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
    if (Number(data.SR_antr) === 0) return;

    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();


    const group = new THREE.Group();
    group.name = 'EntresolList'
    const meshes: THREE.Mesh[] = [];


    const list = this.createAntresoli(data.srL, data.srH, data.srG, this.depth, data.srK, data);


    list.forEach((entr: any) => {
      entr.element.position.set(entr.position.x, entr.position.y, entr.position.z);
      entr.element.name = entr.name;
      meshes.push(entr.element)
    })


    group.add(...meshes);
    this.scene.add(group);
  }

  createAntresoli(w: number, h: number, d: number, thickness: number, srK: number, data: Wardrobe) {

    const wSect = ((w) / srK) - thickness;
    const doorW = wSect + thickness;
    let doors = []

    let doorH = data.SR_H_antr;

    for (let i = 0; i < srK; i++) {

      const startX = (-w / 2) + (doorW / 2)

      const startY = data.SR_niz_dveri.toString() === '0' ? this.plinth : 0;

      const door = {
        bloc: i,
        section: i,
        name: 'Entresol',
        element: this.createCube(doorW, doorH, thickness),
        position: {
          x: startX + i * doorW, //+ (doorW / 2) + (thickness / 2) + i * doorW  / 2,
          y: ((h - doorH) / 2), //+ this.plinth / 2 - thickness / 2,
          z: (d + thickness) / 2
        },
      }
      doors.push(door);
    }

    if (data.SR_H_antr - thickness / 2 > this.wardrobeParamsService.SR_H_MIN_POLKA_ANTR * 2) {
      const shelf =
        {
          name: 'Entresol shelf',
          element: this.createCube(w - 4 - thickness * 2, thickness, d - 4),
          position: {
            x: 0,
            y: h / 2 - doorH / 2,
            z: 0
          },
        }

      doors.push(shelf);
    }


    if (Number(data?.SR_antr_blok) === 0) {
      doors.push(
        {
          name: 'Entresol shelf',
          element: this.createCube(w - thickness * 2, thickness, d),
          position: {
            x: 0, y: h / 2 - doorH,
            //h / 2 - thickness / 2,
            z: 0
          },
        },
      );
    } else if (Number(data?.SR_antr_blok) === 1) {
      doors.push(
        {
          name: 'Entresol shelf',
          element: this.createCube(w - thickness * 2, thickness, d),
          position: {
            x: 0,
            y: h / 2 - doorH + (thickness / 2),
            z: 0
          },
        },
      );
      doors.push(
        {
          name: 'Entresol shelf',
          element: this.createCube(w + 2, 2, d),
          position: {
            x: 0,
            y: h / 2 - doorH,
            z: 0
          },
        },
      );
      doors.push(
        {
          name: 'Entresol shelf',
          element: this.createCube(w - thickness * 2, thickness, d),
          position: {
            x: 0,
            y: h / 2 - doorH - (thickness / 2),
            z: 0
          },
        },
      );
    }

    return doors;
  }

  // External drawers
  private addVYToCabinet() {
    const data = this.cabinetConfiguratorService.getWardrobe();

    const schemeVY = this.cabinetConfiguratorService.getWardrobeScheme();

    if (!(schemeVY && schemeVY.length)) return;

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];


    const YV = this.createYaschikVneshnie(data.srL, data.srH, data.srG, this.depth, schemeVY, data);

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
    // const meshes: THREE.Mesh[] = [];
    // SR_niz_dveri
    const doors = this.createDoors(data.srL, data.srH, data.srG, this.depth, data.srK, scheme, data);

    doors.forEach(door => {
      door.element.position.set(door.position.x, door.position.y, door.position.z);
      door.element.name = door.name;
      group.add(door.element)
    })
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

  filingSection(sectionNumber: number, sectionType: number, filing: number, isNew = false) {
    this.removeFilingBySection(sectionNumber);
    this.scene.add(this.fillingSectionsService.addFillingToSection(sectionNumber, filing, +sectionType === 1))
    const pos = this.cabinetConfiguratorService.nextSectionNumber(sectionNumber)
    const testFiling: any = this.scene.children.find(object =>
      object.name === "Filling" + sectionNumber);
    const sections: any = this.scene.children.find((child: THREE.Object3D) =>
      child.name === 'Sections');
    const section: any = sections?.children[pos];
    if (+filing === 1) return;

    if (+sectionType === 1) {
      const section: any = sections?.children[pos];
      testFiling.position.x = section.position.x + this.depth / 2 - 4;
    } else {
      const section: any = sections?.children[pos];
      testFiling.position.x = section.position.x - testFiling.userData.sectionW / 2 - this.depth / 2 - 4;
    }

    //
  }

  public removeFilingBySection(sectionNumber: number) {
    const oldFiling = this.scene.children.find(object =>
      object.name === "Filling" + sectionNumber);


    if (oldFiling) this.scene.remove(oldFiling);
    // this.scene.children.forEach(object => {
    //   if (object.name === "Filling" + sectionNumber) {
    //     this.scene.remove(object);
    //   }
    // })
  }

  private closeAllAntr(list: any) {
    if (!list && !list?.length) return;
    list.forEach((child: any) => {
      this.transparentDoor(child);
      if (child.userData && child.userData === 'openDoorDown') {
        this.closeDoor(child);
      }
      if (child.userData && (child.userData === 'openDoorLeft' || child.userData === 'openDoorRight')) {
        this.closeDoor(child);
      }
    });
  }


  private closeAllDoors(doors: any) {
    doors?.children.forEach((child: any) => {
      this.transparentDoor(child);
      if (child.userData && (child.userData === 'openDoorLeft' || child.userData === 'openDoorRight')) {
        this.closeDoor(child);
      }
    });
  }


  public selectSectionAndOpenDoors(selectedSection: any, isNew = true) {
    const doors = this.scene.children.find((child: THREE.Object3D) =>
      child.name === 'Doors');
    this.closeAllDoors(doors);
    const doorsEntr = this.scene.children.find((child: THREE.Object3D) =>
      child.name === 'EntresolList');
    const onlyDoorsEntr = doorsEntr?.children.filter((child: THREE.Object3D) =>
      child.name === 'Entresol');
    this.closeAllAntr(onlyDoorsEntr);
    if (!selectedSection.section) return;
    let {section, sectionType, openingDoorType} = selectedSection;
    section = this.cabinetConfiguratorService.nextSectionNumber(section);
    // const addDoorPos = this.cabinetConfiguratorService.nextSectionNumber(section);
    const addDoorPos = +section + 1;

    if (doors?.children) {
      const mainDoor = doors?.children[section];
      const addDoor = doors?.children[addDoorPos];
      const partitions = this.scene.children.find((child: THREE.Object3D) =>
        child.name === 'Sections');
      const partition = partitions?.children[section];
      if (!mainDoor) return;
      if (+sectionType === 1 && partition) {
        partition.visible = false;
      } else if (partition) {
        partition.visible = true;
      }
      if (+openingDoorType === 1) {
        mainDoor.visible = false;
        if (+sectionType === 1 && addDoor) {
          addDoor.visible = false;
        }
        return;
      } else {
        mainDoor.visible = true;
        if (+sectionType === 1 && addDoor) {
          addDoor.visible = true;
        }
      }
      this.openDoor(mainDoor, +openingDoorType === 2 ? 'Right' : 'Left');
      if (+sectionType === 1 && addDoor) {
        this.openDoor(addDoor, 'Right');
      }
      if (!onlyDoorsEntr) return;
      this.openAntisoleDoors(selectedSection);
    }
  }

  private openAntisoleDoors(selectedSection: any) {
    if (!selectedSection) return;
    let {section, sectionType, openingDoorType} = selectedSection;
    section = this.cabinetConfiguratorService.nextSectionNumber(section);
    const addDoorPos = +section + 1;
    const {wSect, SR_H_antr} = this.cabinetConfiguratorService.getWardrobe();
    const doorsEntr = this.scene.children.find((child: THREE.Object3D) =>
      child.name === 'EntresolList');
    const onlyDoorsEntr = doorsEntr?.children.filter((child: THREE.Object3D) =>
      child.name === 'Entresol');
    this.closeAllAntr(onlyDoorsEntr);
    if (!onlyDoorsEntr) return;
    const mainDoor = onlyDoorsEntr[section];
    const addDoor = onlyDoorsEntr[addDoorPos];
    if (SR_H_antr < wSect + 35) {
      this.openDoor(mainDoor, "Down");
      if (+sectionType === 1 && addDoor) {
        this.openDoor(addDoor, 'Down');
      }
    } else {
      this.openDoor(mainDoor, +openingDoorType === 0 ? 'Left' : 'Right');
      if (+sectionType === 1 && addDoor) {
        this.openDoor(addDoor, 'Right');
      }
    }
  }

  private transparentDoor(child: any) {
    const textureMaterial = new THREE.MeshBasicMaterial({map: this.texture, opacity: .6, transparent: true});
    child.material.dispose();
    child.material = textureMaterial;
  }

  private openDoor(child: any, side: 'Left' | 'Right' | 'Down' = 'Left') {

    debugger;
    const wSect = child.geometry.parameters.width;
    const hSect = child.geometry.parameters.height;
    const angle = 90 * (Math.PI / 180);

    if (side === 'Left') {
      child.rotation.y = angle;
      child.position.x = child.position.x - wSect / 2;
      child.position.z = child.position.z + wSect / 2;
    } else if (side === 'Right') {
      child.rotation.y = angle;
      child.position.x = child.position.x + wSect / 2;
      child.position.z = child.position.z + wSect / 2;
      // child.position.set(pos.x + wSect / 2 + this.depth / 2, pos.y, pos.z + wSect / 2);
    }

    if (side === 'Down') {
      child.rotation.x = angle;
      child.position.y = child.position.y + hSect / 2;
      child.position.z = child.position.z + hSect / 2;
    }

    child.userData = 'openDoor' + side;
  }

  private closeDoor(child: any, side: 'Left' | 'Right' = 'Left') {
    const wSect = child.geometry.parameters.width;
    const hSect = child.geometry.parameters.height;
    let angle = 0;

    const pos = child.position;

    if (child.userData === 'openDoorLeft') {
      child.rotation.y = angle;
      child.position.x = child.position.x + wSect / 2;
      child.position.z = child.position.z - wSect / 2;

      // child.position.set(pos.x + wSect / 2 - this.depth / 2, pos.y, pos.z - wSect / 2);
    }
    if (child.userData === 'openDoorRight') {
      child.rotation.y = angle;
      child.position.x = child.position.x - wSect / 2;
      child.position.z = child.position.z - wSect / 2;
    }

    if (child.userData === 'openDoorDown') {
      child.rotation.x = angle;
      child.position.y = child.position.y - hSect / 2;
      child.position.z = child.position.z - hSect / 2;
    }
    child.userData = 'close'
  }

  private createCube(w: number, h: number, d: number, opacity = 1, test = true, color = 0xffffff) {
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

  createSections(w: number, h: number, d: number, thickness: number, srK: number, scheme: Block[], doorW: any) {
    let listS: any[] = []; // = scheme;

    for (let i = 1; i <= srK; i++) {
      const sect = {
        bloc: i,
        section: i,
        name: 'section',
        element: this.createCube(thickness, h - thickness * 2 - this.plinth - 8, d),
        position: {
          x: (-w / 2) + doorW * i,
          y: this.plinth / 2, //thickness - (this.plinth / 2),
          z: 0
        },
      }
      listS.push(sect);
    }

    return listS;
  }

  createYaschikVneshnie(w: number, h: number, d: number, thickness: number, scheme: any[], data: any) {
    const {srL, SR_G_fasad, srK} = data;
    const depth = SR_G_fasad === 'ldsp16' ? 16 : 18;
    const wSect = ((w) / srK) - thickness;
    const wYV = wSect * 2 + thickness;
    const res: any = [];
    let sectionW = ((srL - (depth * 2) - (depth * (srK - 1))) / srK) - 8;
    sectionW *= 2;
    sectionW += thickness;
    for (let iS = 0; iS < scheme.length; iS++) {
      const section = scheme[iS];
      const nextSection = scheme[iS + 1];
      const startX = (-w + wYV + thickness) / 2
      const sectShelf = {
        name: 'sectShelf',
        element: this.createCube(sectionW, thickness, d - 4),
        position: {
          x: startX + section.startPos * ((wYV + thickness) / 2),
          y: this.plinth - h / 2 + 200 * section.SR_yaschiki_vneshnie_kol - thickness / 2,
          z: 0
        },
      }
      res.push(sectShelf);
      for (let j = 0; j < section.SR_yaschiki_vneshnie_kol; j++) {
        const sect = {
          name: 'sect',
          element: this.createCube(wYV + thickness, this.yvH, thickness),
          position: {
            x: startX + section.startPos * ((wYV + thickness) / 2),
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

    switch (+SR_tsokol) {
      case 0:
        res.push(...this.cololZero(w, h, d, thickness));
        break;
      case 1:
        res.push(...this.cocolOne(w, h, d, thickness));
        break;
      case 2:
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
        element: this.createCube(w - 2 * thickness - 4, thickness, d),
        position: {x: 0, y: h / 2 - thickness / 2, z: 0},
      },
      {
        name: 'нижняя',
        element: this.createCube(lowerPartW - 4, thickness, d),
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
    sprite.scale.set(size * 4, size, 1);

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

  createDimensions(offsetX = 200, offsetY = 200) {
    const data = this.cabinetConfiguratorService.getWardrobe();

    // Удаляем старые размеры если есть

    // this.resetSizes();
    this.scene.remove(this.dimensionsGroup);
    this.dimensionsGroup.clear();
    // if (this.dimensionsGroup) {
    //   this.scene.remove(this.dimensionsGroup);
    //   this.dimensionsGroup.children.forEach(child => {
    //     // if (child?.geometry) child?.geometry.dispose();
    //     // if (child?.material) child?.material.dispose();
    //   });
    // }

    this.dimensionsGroup = new THREE.Group();

    // ШИРИНА (X)
    const widthLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2, -data.srH / 2 - offsetX, data.srG / 2),
      new THREE.Vector3(data.srL / 2, -data.srH / 2 - offsetX, data.srG / 2),
      offsetX,
      0x000
    );
    this.dimensionsGroup.add(widthLine);


    const widthLabel = this.createTextLabel(
      `${data.srL}`,
      new THREE.Vector3(0, -data.srH / 2 - offsetX + 50, data.srG / 2),
      0x000
    );
    if (widthLabel) {
      this.dimensionsGroup.add(widthLabel);
    }

    // ВЫСОТА
    const heightLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2 - offsetY, -data.srH / 2, data.srG / 2),
      new THREE.Vector3(-data.srL / 2 - offsetY, data.srH / 2, data.srG / 2),
      // new THREE.Vector3(this.cubeSize/2 + offset, this.cubeSize/2 + offset, this.cubeSize/2 + offset/2),
      offsetY,
      0x000,
      false
      // 0x44ff44
    );
    this.dimensionsGroup.add(heightLine);

    const heightLabel = this.createTextLabel(
      `${data.srH}`,
      new THREE.Vector3(-data.srL / 2 - offsetY - 50, 0, data.srG / 2),
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

    this.createDimensions(300, 450);
    // this.createBaseDimension(data);
    this.createCabinetHDimension(data);
    this.createSectionHDimension(data)

    // X dimensions
    const widthSectionLine = this.createOuterDimensionLine(
      new THREE.Vector3(-data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      new THREE.Vector3(data.srL / 2, -data.srH / 2 - offset, data.srG / 2),
      offset,
      0x000
    );
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


      const sWidthLabel = this.createTextLabel(
        `${wSectLabel}`,
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
      offset,
      0x000,
      false
    );
    this.dimensionsGroup.add(heightLine);

    if (withoutLabel) return;

    const heightLabel = this.createTextLabel(
      `${data.srH - this.plinth}`,
      new THREE.Vector3(-data.srL / 2 - offset - 50, 0, data.srG / 2),
      0x000,
      200,
      false
    );
    if (heightLabel) {
      this.dimensionsGroup.add(heightLabel);
    }
  }

  resetSizes(visible: boolean) {
    // this.scene.remove(this.dimensionsGroup);
    // this.dimensionsGroup.clear();
    this.dimensionsGroup.visible = visible;
    // this.dimensionsGroup.children.forEach(child => {})
  }
}
