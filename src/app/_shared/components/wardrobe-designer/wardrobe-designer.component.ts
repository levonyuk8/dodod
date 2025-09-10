import {AfterViewInit, Component, ElementRef, HostListener, inject, ViewChild} from '@angular/core';
import {ButtonComponent} from '../button/button.component';
import {CabinetConfiguratorService} from '../../../_services/cabinet-configurator.service';
import {filter} from 'rxjs';

@Component({
  selector: 'app-wardrobe-designer',
  imports: [
    ButtonComponent
  ],
  templateUrl: './wardrobe-designer.component.html',
  styleUrl: './wardrobe-designer.component.scss'
})
export class WardrobeDesignerComponent implements AfterViewInit {

  cabinetConfiguratorService = inject(CabinetConfiguratorService);

  // Высота цоколя 80мм
  testH = 80;
  // Состояние приложения
  showAxisX = true;
  showAxisY = true;
  showAxisZ = true;
  depth = 50;

  // Цвета для осей
  axisXColor = '#e74c3c'; // Красный
  axisYColor = '#2ecc71'; // Зеленый
  axisZColor = '#3498db'; // Синий

  // @ViewChild('myCanvas') canvas!: HTMLCanvasElement;
  @ViewChild('canvasContainer') containerRef!: ElementRef;
  @ViewChild('coords') coordsDisplay!: ElementRef;
  // wardrobeCanvas
  @ViewChild('myCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  walls !: any;
  doors !: any;
  parentSize: { width: number; height: number } | null = null;
  showWireframe = false;

  showGrid = true;

  customGuides = {
    vertical: [],
    horizontal: []
  };

  selectedGuide: unknown = null;


  params = {
    centerX: 0,
    centerY: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
  }

  // Параметры камеры
  fov = 200;
  cameraZ = 1000;

  color = '#BBB1A7';

  // Функция создания объемной стены (параллелепипед)
  createWall(width: number, height: number, depth: number, position: any) {
    const halfW = width / 2;
    const halfH = height / 2;
    const halfD = depth / 2;


    return [
      // Передняя грань
      {x: -halfW, y: halfH, z: -halfD},
      {x: halfW, y: halfH, z: -halfD},
      {x: halfW, y: -halfH, z: -halfD},
      {x: -halfW, y: -halfH, z: -halfD},

      // Задняя грань
      {x: -halfW, y: halfH, z: halfD * 2},
      {x: halfW, y: halfH, z: halfD * 2},
      {x: halfW, y: -halfH, z: halfD * 2},
      {x: -halfW, y: -halfH, z: halfD * 2},
    ]
      .map(vertex => ({
        x: vertex.x + position.x,
        y: vertex.y + position.y,
        z: vertex.z + position.z
      }));
  }

  // Обработчик изменения размера окна
  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
    this.draw();
  }

  private resizeCanvas() {

    this.getParentSize();
    this.setCanvasSize();

    this.draw();
  }


  ngAfterViewInit(): void {

    this.cabinetConfiguratorService.clearConf.subscribe(
      () => {
        this.clearCTX();
      }
    )
    if (this.canvasRef && this.canvasRef.nativeElement) {
      this.canvas = this.canvasRef.nativeElement;
      this.ctx = this.canvas.getContext('2d')!; // Use '2d' or 'webgl' as needed
    }

    this.cabinetConfiguratorService.data$
      .pipe(
        filter(data => !!data)
      )
      .subscribe(
      data => {
        this.init(data);
        this.draw();
      }
    )


    // this.resizeCanvas();

    // Отслеживание положения курсора для отображения координат
    this.canvas.addEventListener('mousemove', (e: any) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Преобразуем координаты canvas в 3D координаты
      const centerX = this.canvas.width / 2;
      const centerY = this.canvas.height / 2;

      const worldX = x - centerX;
      const worldY = centerY - y; // Инвертируем Y для привычной системы координат
      const worldZ = 0; // По умолчанию Z=0

      this.coordsDisplay.nativeElement.textContent = `X: ${worldX}, Y: ${worldY}, Z: ${worldZ}`;
    });
  }

  private getParentSize() {
    const parentElement = this.containerRef.nativeElement.parentElement;
    console.log(parentElement.offsetWidth)
    console.log(parentElement.offsetHeight)
    if (parentElement) {
      this.parentSize = {
        width: parentElement.offsetWidth,
        height: parentElement.offsetHeight
      };
    }
  }

  setCanvasSize() {
    if (this.parentSize) {
      this.canvas.width = this.parentSize.width;
      this.canvas.height = this.parentSize.height;
    }
  }


  init(data: any) {

    this.getParentSize();
    this.setCanvasSize();

    // Центр холста
    this.params.centerX = this.canvas.width / 2;
    this.params.centerY = this.canvas.height / 2;
    // const centerX = this.canvas.width / 2;
    // const centerY = this.canvas.height / 2;

// Размеры шкафа (ширина, высота, глубина)
    this.fov = Math.ceil(data.srH * 0.1);

    const w = data.srL; // Width
    const h = data.srH; // Height
    const d = data.srG; // Depth
    const thickness = 20;  // Толщина стенок

    this.walls = this.createWalls(w, h, d, thickness);
    this.doors = this.createDoors(w, h, d, thickness);
  }

  // Функция поворота точки
  rotatePoint(point: any, rx: any, ry: any, rz: any) {
    let x = point.x, y = point.y, z = point.z;

    const cosX = Math.cos(rx), sinX = Math.sin(rx);
    const y1 = y * cosX - z * sinX;
    const z1 = y * sinX + z * cosX;

    const cosY = Math.cos(ry), sinY = Math.sin(ry);
    const x1 = x * cosY + z1 * sinY;
    const z2 = -x * sinY + z1 * cosY;

    const cosZ = Math.cos(rz), sinZ = Math.sin(rz);
    const x2 = x1 * cosZ - y1 * sinZ;
    const y2 = x1 * sinZ + y1 * cosZ;

    return {x: x2, y: y2, z: z2, original: point};
  }

  // Функция проекции
  projectPoint(point: any) {
    const {centerX, centerY} = this.params;
    const factor = this.fov / (this.fov + point.z + this.cameraZ);
    const x = point.x * factor + centerX;
    const y = point.y * factor + centerY;
    return {x, y, z: point.z};
  }

  // Расчет освещения
  calculateLighting(normal: any, baseColor: any) {
    const lightDir = {x: 1, y: -1, z: 1};
    const length = Math.sqrt(lightDir.x ** 2 + lightDir.y ** 2 + lightDir.z ** 2);
    lightDir.x /= length;
    lightDir.y /= length;
    lightDir.z /= length;

    let intensity = normal.x * lightDir.x + normal.y * lightDir.y + normal.z * lightDir.z;
    intensity = Math.max(0.2, Math.min(1, intensity));

    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    return `rgb(${Math.floor(r * intensity)}, ${Math.floor(g * intensity)}, ${Math.floor(b * intensity)})`;
  }

  // Расчет нормали
  calculateNormal(vertices: any) {
    const v1 = vertices[0], v2 = vertices[1], v3 = vertices[2];
    const u = {x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z};
    const v = {x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z};

    const normal = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x
    };

    const length = Math.sqrt(normal.x ** 2 + normal.y ** 2 + normal.z ** 2);
    if (length > 0) {
      normal.x /= length;
      normal.y /= length;
      normal.z /= length;
    }

    return normal;
  }

  // Отрисовка объемного объекта
  drawVolume(vertices: any, faces: any, baseColor: any) {
    const {rotationX, rotationY, rotationZ} = this.params;
    const rotated = vertices.map((v: any) => this.rotatePoint(v, rotationX, rotationY, rotationZ));
    const projected = rotated.map((v: any) => this.projectPoint(v));

    const faceData: any = faces.map((faceIndices: any) => {
      const faceVerts = faceIndices.map((i: any) => rotated[i]);
      const centerZ = faceVerts.reduce((sum: any, v: any) => sum + v.z, 0) / faceVerts.length;
      const normal = this.calculateNormal(faceVerts);

      // Отбрасываем невидимые грани (смотрящие от камеры)
      // const dotProduct = normal.z;
      // if (dotProduct > 0) return null;

      return {
        vertices: faceIndices.map((i: any) => projected[i]),
        color: baseColor,//this.calculateLighting(normal, baseColor),
        zIndex: centerZ,
        original: faceVerts
      };
    }).filter(Boolean);

    // Сортируем по глубине
    faceData.sort((a: any, b: any) => a.zIndex - b.zIndex);

    // Рисуем грани
    faceData.forEach((face: any) => {
      this.ctx.fillStyle = face.color;
      // this.ctx.strokeStyle = this.showWireframe ? '#ff0000' : '#000';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 1;

      this.ctx.beginPath();
      this.ctx.moveTo(face.vertices[0].x, face.vertices[0].y);
      for (let i = 1; i < face.vertices.length; i++) {
        this.ctx.lineTo(face.vertices[i].x, face.vertices[i].y);
      }
      this.ctx.closePath();
      this.ctx.fill();
      if (!this.showWireframe) this.ctx.stroke();
    });

    if (this.showWireframe) {
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      for (let i = 0; i < projected.length; i++) {
        this.ctx.moveTo(projected[i].x, projected[i].y);
        this.ctx.arc(projected[i].x, projected[i].y, 3, 0, Math.PI * 2);
        this.ctx.stroke();
      }
      this.ctx.stroke();
    }
  }

  clearCTX() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  // Главная функция отрисовки
  draw() {
    this.clearCTX();
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Рисуем все стены
    this.walls.forEach((wall: any) => {
      this.drawVolume(wall.vertices, wall.faces, wall.color);
    });

    // todo empty
    this.doors?.forEach((wall: any) => {
      this.drawVolume(wall.vertices, wall.faces, wall.color);
    });

    // Рисуем сетку
    // this.drawGrid();

    // Рисуем пользовательские направляющие
    this.draw3DAxes();
  }

  // Создаем объемные двери шкафа
  private createDoors(w: number, h: number, d: number, thickness: number) {
    const doorW = w / 4;

    let doors = []

    for (let i = 1; i <= 4; i++) {
      const door = {
        name: 'дверь',
        vertices: this.createWall(doorW, h - this.testH, d, {x: -w / 2 - (doorW / 2) + i * doorW , y: -(thickness / 2  + this.testH) / 2, z: 0}),
        color: '#c3ac9f',
        faces: [
          [0, 1, 2, 3],
          // [4, 5, 6, 7],
          // [0,1, 5, 4], [2,3,7,6],
          // [0, 3, 7, 4],
          // [1, 2, 6,5]
        ]
      }
      doors.push(door);
    }
    return doors;
  }

  // Создаем объемные стены шкафа
  private createWalls(w: number, h: number, d: number, thickness: number) {


    return [

      {
        name: 'левая боковая',
        vertices: this.createWall(thickness, h, d, {x: w / 2, y: 0, z: 0}),
        color: this.color,
        faces: [
          [0, 1, 2, 3], [4, 5, 6, 7],
          [0, 3, 7, 4]
        ]
      },
      {
        name: 'правая боковая',
        vertices: this.createWall(thickness, h, d, {x: -w / 2, y: 0, z: 0}),
        color: this.color,
        faces: [
          [0, 1, 2, 3],
          [2, 6, 5, 1]
        ]
      },
      {
        name: 'верхняя',
        vertices: this.createWall(w - thickness, thickness, d, {x: 0, y: -(h / 2 - thickness / 2), z: 0}),
        color: this.color,
        faces: [
          [0, 1, 2, 3],
          [1, 0, 4, 5]
        ]
      },
      {
        name: 'цоколь',
        vertices: this.createWall(w - thickness, this.testH, d, {x: 0, y: h / 2 - this.testH / 2, z: 0}),
        color: '#8B4513',
        faces: [
          [0, 1, 2, 3],
          [3, 2, 6, 7]
        ]
      },
      // {
      //   name: 'test',
      //   vertices: this.createWall(w - thickness, this.testH, d, {x: 0,y: h / 2 + this.testH , z: 0}),
      //   color: '#8B4513',
      //   faces: [
      //     [0, 1, 2, 3], [4, 5, 6, 7],
      //     [0,1, 5, 4], [2,3,7,6],
      //     [0, 3, 7, 4],
      //     [1, 2, 6,5]
      //     // [3, 2, 6, 7]
      //   ]
      // },
      {
        name: 'нижняя',
        vertices: this.createWall(w - thickness, thickness, d, {x: 0, y: h / 2 - thickness / 2 - this.testH, z: 0}),
        color: this.color,
        faces: [
          [0, 1, 2, 3],
          [3, 2, 6, 7]
        ]
      },
    ]
  }

  // Функция для рисования сетки направляющих
  drawGrid() {
    if (!this.showGrid) return;

    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;

    const gridSize = 50;

    // Вертикальные линии
    for (let x = gridSize; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // Горизонтальные линии
    for (let y = gridSize; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // Более жирные линии каждые 100px
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.lineWidth = 1.5;

    for (let x = 100; x < this.canvas.width; x += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 100; y < this.canvas.height; y += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  // Функция для рисования 3D направляющих (осей)
  draw3DAxes() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    // Ось X (ширина) - красная
    if (this.showAxisX) {
      this.ctx.strokeStyle = this.axisXColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);

      this.ctx.beginPath();
      this.ctx.moveTo(centerX - 300, centerY);
      this.ctx.lineTo(centerX + 300, centerY);
      this.ctx.stroke();

      // Стрелка оси X
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX + 300, centerY);
      this.ctx.lineTo(centerX + 290, centerY - 5);
      this.ctx.lineTo(centerX + 290, centerY + 5);
      this.ctx.closePath();
      this.ctx.fillStyle = this.axisXColor;
      this.ctx.fill();

      // Подпись оси X
      this.ctx.font = '14px Arial';
      this.ctx.fillText('Ось X (Ширина)', centerX + 250, centerY - 10);
    }

    // Ось Y (высота) - зеленая
    if (this.showAxisY) {
      this.ctx.strokeStyle = this.axisYColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - 200);
      this.ctx.lineTo(centerX, centerY + 200);
      this.ctx.stroke();

      // Стрелка оси Y
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY - 200);
      this.ctx.lineTo(centerX - 5, centerY - 190);
      this.ctx.lineTo(centerX + 5, centerY - 190);
      this.ctx.closePath();
      this.ctx.fillStyle = this.axisYColor;
      this.ctx.fill();

      // Подпись оси Y
      this.ctx.font = '14px Arial';
      this.ctx.fillText('Ось Y (Высота)', centerX + 10, centerY - 180);
    }

    // Ось Z (глубина) - синяя
    if (this.showAxisZ) {
      this.ctx.strokeStyle = this.axisZColor;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + this.depth * 2, centerY - this.depth);
      this.ctx.stroke();

      // Стрелка оси Z
      this.ctx.setLineDash([]);
      this.ctx.beginPath();
      this.ctx.moveTo(centerX + this.depth * 2, centerY - this.depth);
      this.ctx.lineTo(centerX + this.depth * 2 - 10, centerY - this.depth + 5);
      this.ctx.lineTo(centerX + this.depth * 2 - 10, centerY - this.depth - 5);
      this.ctx.closePath();
      this.ctx.fillStyle = this.axisZColor;
      this.ctx.fill();

      // Подпись оси Z
      this.ctx.font = '14px Arial';
      this.ctx.fillText('Ось Z (Глубина)', centerX + this.depth * 2 - 40, centerY - this.depth - 10);
    }

    // Сбрасываем пунктирный стиль линий
    this.ctx.setLineDash([]);
  }
}
