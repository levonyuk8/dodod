import {ElementRef, inject, Injectable} from '@angular/core';

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {CabinetConfiguratorService} from './cabinet-configurator.service';
import {Steps} from '../_shared/components/stepper/stepper.component';
import {Section} from '../_models/section.model';
import {BlockTypes} from '../pages/configurator/step-2/step-2.component';
import {Wardrobe} from '../_models/wardrobe.model';
import {FormControl} from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ThreeHelperService {

  cabinetConfiguratorService = inject(CabinetConfiguratorService)
  // @ViewChild('coords') coordsDisplay!: ElementRef;
  // wardrobeCanvas
  // @ViewChild('myCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Высота цоколя 80мм
  plinth = 80;
  // Ширина Материала
  depth = 40;
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
    this.renderer = new THREE.WebGLRenderer();
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
    this.scene.clear();
    this.createBaseCabinet()
    this.createDimensions();
    switch (step) {
      case Steps.one: {
        // this.createBaseCabinet()
        this.addSrPlanka()
        break;
      }
      case Steps.two: {
        // this.createBaseCabinet();

        // this.testAl();
        // this.addSectionsToCabinet();
        this.addDoorsToCabinet();
        this.addVYToCabinet();
        this.addAntresoli();
        this.addSrPlanka();
        break;
      }
    }
  }

  private createBaseCabinet() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const walls =
      this.createWalls(data.srL, data.srH, data.srG, this.depth, data?.SR_tsokol.toString());

    walls.forEach(wall => {
      wall.element.position.set(wall.position.x, wall.position.y, wall.position.z);
      meshes.push(wall.element)
      //
    })
    group.add(...meshes);
    this.scene.add(group);
  }

  private addSectionsToCabinet() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    console.log('addSectionsToCabinet', scheme);

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const sections = this.createSections(data.srL, data.srH, data.srG, this.depth, data.srK, scheme);


    sections.forEach(section => {
      section.element.position.set(section.position.x, section.position.y, section.position.z);
      meshes.push(section.element)
    })

    group.add(...meshes);
    this.scene.add(group);

  }

  testAl() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];

    const sectionW = Math.round(data.srL / scheme.length * 10) / 10;
    console.log({sectionW});

    scheme.forEach((section) => {


      if (section.block.blockType === BlockTypes.custom) {
        if (section.block.SR_yaschiki_vneshnie) {
          const yv = this.createCube(sectionW * 2, this.yvH, this.depth);

          const startPos = this.calcStartPosForElement(data, section, sectionW, this.yvH, this.depth);
          console.log({yv})
          console.log({startPos})

          let al: any;
          for (let i = 1; i < section.block.SR_yaschiki_vneshnie_kol; i++) {

            al = {
              element: yv,
              position: {
                x: startPos.x - this.depth + section.block.na * sectionW,
                y: startPos.y + this.yvH / 2 + this.yvH * i,
                z: startPos.z + this.depth / 2
              }
            }
            meshes.push(al);
            debugger;
          }

          // const yv = {
          //   bloc: i,
          //   section: i,
          //   name: 'внешний выдвижной ящик',
          //   element: this.createCube(wYV + thickness, 200, thickness),
          //   position: {
          //     // x: 0,
          //     x: (-w / 2) + wYV / 2 - thickness / 2 + wYV * section.block.na,
          //     y: (this.plinth - h / 2 + 200 / 2) + 200 * i,
          //     z: d / 2 + thickness / 2
          //   },
          //   // position: {x: -w / 2 - (wYV / 2) - thickness + i * wYV, y: this.plinth * .1 / 2, z: d / 2},
          // }

          // x : -data.srL / 2 - this.depth + section.block.na * w,
          // y: -data.srH / 2 + this.plinth + h / 2,
          // z: data.srG / 2 + d / 2

          // yv.position.set(pos.x, pos.y, pos.z);
          // meshes.push(yv)

          group.add(...meshes);

        }
      }


    })
    this.scene.add(group);

  }

  calcStartPosForElement(data: Wardrobe, section: Section, w: number, h: number, d: number) {

    console.log('calcStartPosForElement', (-data.srL / 2) + w - d / 2 + w * 2 * section.block.na,)
    console.log('calcStartPosForElement', (-data.srL / 2))

    return {
      // x : -data.srL / 2 - this.depth + section.block.na * w,
      // y: -data.srH / 2 + this.plinth + h / 2,
      // z: data.srG / 2 + d / 2
      x: -data.srL / 2,
      y: -data.srH / 2 + this.plinth,
      z: data.srG / 2
    }
    // pos;
  }

  private addSrPlanka() {
    const data = this.cabinetConfiguratorService.getWardrobe();
    // const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    // console.log('addSectionsToCabinet', scheme);

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    const planki = this.createPlanki(data.srL, data.srH, data.srG, this.depth, data.srK, data);


    planki.forEach(planka => {
      planka.element.position.set(planka.position.x, planka.position.y, planka.position.z);
      meshes.push(planka.element)
    })

    group.add(...meshes);
    this.scene.add(group);


  }

  private createPlanki(w: number, h: number, d: number, thickness: number, srK: number, data: Wardrobe) {
    const res = [];
    if (data.SR_PLANKA_VERH_CHENTR) {
      res.push(
        {
          name: 'верхняя потолок',
          element: this.createCube(w, 100, thickness, 1, false, 0xFFA500),
          position: {x: 0, y: h / 2 + 100 / 2, z: (d - thickness) / 2},
        },
      )
    }
    if (data.SR_PLANKA_VERH_LEV) {
      res.push(
        {
          name: 'левая потолок',
          element: this.createCube(thickness, 100, d, 1, false, 0xFFA500),
          position: {x: (-w / 2) + thickness / 2, y: h / 2 + 100 / 2, z: -1},
        },
      )
    }
    if (data.SR_PLANKA_VERH_PRAV) {
      res.push(
        {
          name: 'правая потолок',
          element: this.createCube(thickness, 100, d, 1, false, 0xFFA500),
          position: {x: (w / 2) - thickness / 2, y: h / 2 + 100 / 2, z: -1},
        },
      )
    }
    if (data.SR_H_PLANKA_BOK_PRAV) {
      res.push(
        {
          name: 'правая',
          element: this.createCube(100, h, thickness, 1, false, 0xFFA500),
          position: {x: (w / 2) + 100 / 2, y: 0, z: (d + this.depth) / 2},
        },
      )
    }

    if (data.SR_H_PLANKA_BOK_LEV) {
      res.push(
        {
          name: 'левая',
          element: this.createCube(100, h, thickness, 1, false, 0xFFA500),
          position: {x: (-w / 2) - 100 / 2, y: 0, z: (d + this.depth) / 2},
        },
      )
    }

    if (data.SR_PLANKA_BOK_CHENTR) {
      res.push(
        {
          name: 'верхняя',
          element: this.createCube(w + 200, 100, thickness, 1, false, 0xFFA500),
          position: {x: 0, y: h / 2 + 100 / 2, z: (d + this.depth) / 2},
        },
      )
    }
    // SR_PLANKA_VERH_CHENTR: new FormControl<boolean>(false),
    //   SR_PLANKA_VERH_LEV: new FormControl<boolean>(false),
    // SR_PLANKA_VERH_PRAV: new FormControl<boolean>(false),
    // SR_PLANKA_BOK_CHENTR: new FormControl<boolean>(false),
    // SR_H_PLANKA_BOK_LEV: new FormControl<boolean>(false),
    // SR_H_PLANKA_BOK_PRAV: new FormControl<boolean>(false),

    let qwe = [
      {
        name: 'верхняя потолок',
        element: this.createCube(w, 100, thickness, 1, false, 0xFFA500),
        position: {x: 0, y: h / 2 + 100 / 2, z: (d - thickness) / 2},
      },
      // ...res,
      {
        name: 'левая потолок',
        element: this.createCube(thickness, 100, d, 1, false, 0xFFA500),
        position: {x: (-w / 2) + thickness / 2, y: h / 2 + 100 / 2, z: -1},
      },
      {
        name: 'правая потолок',
        element: this.createCube(thickness, 100, d, 1, false, 0xFFA500),
        position: {x: (w / 2) - thickness / 2, y: h / 2 + 100 / 2, z: -1},
      },
      // {
      //   name: 'правая боковая',
      //   element: this.createCube(thickness, baseH, d),
      //   position: {x: w / 2 - thickness / 2, y: boxwoodCupboardYPos, z: 0},
      // },
      // {
      //   name: 'верхняя',
      //   element: this.createCube(w + 200, 100, thickness, 1, false, 0xFFA500),
      //   position: {x: 0, y: h / 2 + 100 / 2, z: (d - thickness) / 2},
      // },
      //
      // {
      //   name: 'левая',
      //   element: this.createCube(100, h, thickness, 1, false, 0xFFA500),
      //   position: {x: (-w / 2) - 100 / 2, y:0, z: (d - thickness) / 2},
      // },
      // {
      //   name: 'правая',
      //   element: this.createCube(100, h, thickness, 1, false, 0xFFA500),
      //   position: {x: (w / 2) + 100 / 2, y:0, z: (d - thickness) / 2},
      // },
      // {
      //   name: 'нижняя',
      //   element: this.createCube(lowerPartW, thickness, d),
      //   position: {x: 0, y: -(h / 2 - thickness / 2 - this.plinth), z: 0},
      // },
    ]
    console.log(qwe)

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
            element: this.createCube(w, thickness, d + 100, 1, false),
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
    console.log(doorCount);
    const data = this.cabinetConfiguratorService.getWardrobe();

    const scheme = this.cabinetConfiguratorService.getWardrobeScheme();

    console.log('addSectionsToCabinet', scheme);

    const group = new THREE.Group();
    const meshes: THREE.Mesh[] = [];
    // SR_niz_dveri
    const doors = this.createDoors(data.srL, data.srH, data.srG, this.depth, data.srK, scheme, data);

    doors.forEach(door => {
      door.element.position.set(door.position.x, door.position.y, door.position.z);
      meshes.push(door.element)
    })
    group.add(...meshes);
    this.scene.add(group);

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

  createSections(w: number, h: number, d: number, thickness: number, srK: number, scheme: Section[]) {

    const sectionW = (w - thickness - thickness * scheme.length) / scheme.length + thickness * 2;

    console.log({sectionW});
    console.log(thickness * scheme.length);

    let listS: any[] = []; // = scheme;


    scheme.forEach((section, i) => {
      console.log('createSections h', h - thickness * 2 - this.plinth)

      const sect = {
        bloc: i,
        section: i,
        name: 'внешний выдвижной ящик',
        element: this.createCube(thickness, h - thickness * 2 - this.plinth, d),
        position: {
          x: (-w / 2) + sectionW * i - thickness / 2,
          y: thickness,
          z: 0
        },

        // position: {x: -w / 2 - (wYV / 2) - thickness + i * wYV, y: this.plinth * .1 / 2, z: d / 2},
      }
      listS.push(sect);
    })
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
        name: 'дверь',
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
      case '2':
        res.push(
          {
            name: 'цоколь п',
            element: this.createCube(w, this.plinth, thickness),
            position: {x: 0, y: -(h / 2 - this.plinth / 2), z: d / 2 - thickness / 2},
          },
        )

        break;
      case '1':
        res.push(...this.cocolOne(w, h, d, thickness));
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

    const wCocol = w - 2 * thickness - 2 * plintus;

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

    debugger


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
    sprite.scale.set(size * 3, size * 0.8, 1);

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

  private dimensionsGroup!: THREE.Group;
  cubeSize = 1000;

  createDimensions() {
    const data = this.cabinetConfiguratorService.getWardrobe();

    // Удаляем старые размеры если есть

    if (this.dimensionsGroup) {
      this.scene.remove(this.dimensionsGroup);
      this.dimensionsGroup.children.forEach(child => {
        console.log('createDimensions IF')
        // if (child?.geometry) child?.geometry.dispose();
        // if (child?.material) child?.material.dispose();
      });
    }

    this.dimensionsGroup = new THREE.Group();
    const offset = 200;

    console.log(data)

    // ШИРИНА (X) - красный
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

    // ВЫСОТА (Y) - зеленый
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

    // ГЛУБИНА (Z) - синий
    // const depthLine = this.createOuterDimensionLine(
    //   new THREE.Vector3(this.cubeSize/2 + offset/2, this.cubeSize/2 + offset, -this.cubeSize/2 - offset),
    //   new THREE.Vector3(this.cubeSize/2 + offset/2, this.cubeSize/2 + offset, this.cubeSize/2 + offset),
    //   0.4,
    //   0x4444ff
    // );
    // this.dimensionsGroup.add(depthLine);
    //
    // const depthLabel = this.createTextLabel(
    //   `${this.cubeSize.toFixed(1)}m`,
    //   new THREE.Vector3(this.cubeSize/2 + offset/2 + 0.8, this.cubeSize/2 + offset, 0),
    //   0x4444ff
    // );
    // this.dimensionsGroup.add(depthLabel);
    //
    // // Стрелочки
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(-this.cubeSize/2 - offset, -this.cubeSize/2 - offset, this.cubeSize/2 + offset/2),
    //   Math.PI/2,
    //   0xff4444
    // ));
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(this.cubeSize/2 + offset, -this.cubeSize/2 - offset, this.cubeSize/2 + offset/2),
    //   -Math.PI/2,
    //   0xff4444
    // ));
    //
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(this.cubeSize/2 + offset, -this.cubeSize/2 - offset, this.cubeSize/2 + offset/2),
    //   0,
    //   0x44ff44
    // ));
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(this.cubeSize/2 + offset, this.cubeSize/2 + offset, this.cubeSize/2 + offset/2),
    //   Math.PI,
    //   0x44ff44
    // ));
    //
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(this.cubeSize/2 + offset/2, this.cubeSize/2 + offset, -this.cubeSize/2 - offset),
    //   -Math.PI/2,
    //   0x4444ff
    // ));
    // this.dimensionsGroup.add(this.createArrow(
    //   new THREE.Vector3(this.cubeSize/2 + offset/2, this.cubeSize/2 + offset, this.cubeSize/2 + offset),
    //   Math.PI/2,
    //   0x4444ff
    // ));

    this.scene.add(this.dimensionsGroup);
  }

  resetSizes() {
    this.dimensionsGroup.clear();
    // this.dimensionsGroup.children.forEach(child => {})
  }
}
