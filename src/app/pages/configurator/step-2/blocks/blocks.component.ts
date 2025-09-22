import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ButtonComponent} from '../../../../_shared/components/button/button.component';
import {IGroupData, RadioGroupComponent} from '../../../../_shared/components/radio-group/radio-group.component';
import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-blocks',
  imports: [
    ButtonComponent,
    RadioGroupComponent,
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './blocks.component.html',
  styleUrl: './blocks.component.scss'
})
export class BlocksComponent implements OnInit {
  ngOnInit(): void {
    this.createBlock()
  }

  @Input() doorCount!: number;

  @Output() schemeChange = new EventEmitter<any>();

  blockList: any[] = [];

  currentBlock: number | null = 0;

  //   Внешние выдвижные ящики (кол-во)
  drawers: IGroupData =
    {
      groupName: "drawers",
      options: [
        {imgUrl: 'url(/img/svg/b1_2.svg)', label: 'Два ящика', value: 2},
        {imgUrl: 'url(/img/svg/not.svg)', label: 'Три ящика', value: 3},
      ]
    }

  createBlock() {
    const startPos = this.isEnoughSpaceForNewBlock();
    if (startPos < 0) {
      alert('alarm');
      return;
    }


    const block = this.createNewBlock(startPos);
    this.blockList.push(block);
    this.currentBlock = block.blockNA;
    this.schemeChanges();
  }

  openBlock(na: number) {
    console.log('openBlock', na)
    console.log('openBlock',  this.currentBlock)
    if (na === this.currentBlock) {
      this.currentBlock = null
    } else {
      this.currentBlock = na;
    }
  }

  private isEnoughSpaceForNewBlock() {
    if (!this.blockList.length) {
      return 0;
    }
    let arr: any = [0, +this.doorCount];
    this.blockList.forEach(item => {
      const {endPos, startPos} = item;
      arr.push(startPos, endPos);
    });

    arr.sort();

    for (let i = 1; i < arr.length; i++) {
      const diff = arr[i] - arr[i - 1];
      if (diff >= 2) {
        return arr[i - 1] === 0 ? arr[i - 1] : arr[i - 1] + 1;
      }
    }
    return -1;
  }

  deleteBlock(index: number) {
    this.blockList = this.blockList.filter(item => item.blockNA !== index);
    this.currentBlock = 0;
    this.schemeChanges()
  }

  isDisabledAddBlock(): boolean {
    return Math.floor(this.doorCount / 2) <= this.blockList.length;
  }

  private createNewBlock(startPos: number) {


    const block =
      {
        blockNA: this.blockList.length,
        startPos: startPos,
        endPos: startPos + 1,
        SR_yaschiki_vneshnie: true,
        SR_yaschiki_vneshnie_kol: 2,
      };


    return block;
  }

  public moveBlock(na: number, operator: '+' | '-' = '+') {
    const block = this.blockList.find(item => (item.blockNA === na));
    const {startPos, endPos} = block;

    const newStart = this.performOperation(operator, startPos, 1);
    const newEnd = this.performOperation(operator, endPos, 1);

    const blockInNewPos = this.blockList.find(item => {
      if (item.blockNA !== na &&
        (item.startPos === newStart || item.startPos === newEnd || item.endPos === newStart || item.endPos === newEnd)) {
        return item;
      }
    });

    if (blockInNewPos) {
      this.changePosBlocks(block, blockInNewPos);
    }

    if (!blockInNewPos && (newStart <= 0 || newEnd <= this.doorCount - 1)) {
      block.startPos = newStart;
      block.endPos = newEnd;
    }
    this.schemeChanges();
  }

  private changePosBlocks(block: any, blockInNewPos: any) {
    const {startPos, endPos} = block;

    block.startPos = blockInNewPos.startPos;
    block.endPos = blockInNewPos.endPos;

    blockInNewPos.startPos = startPos;
    blockInNewPos.endPos = endPos;
  }

  private performOperation(operation: '+' | '-' = "+", a: number, b: number) {
    if (operation === "+") {
      return a + b;
    } else {
      return a - b;
    }
  }

  schemeChanges() {
    this.schemeChange.emit(this.blockList);
  }

}
