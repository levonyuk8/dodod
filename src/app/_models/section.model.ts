import {Block} from './block.model';

export class Section {
    section: number;
    block: Block;
    name?: string;
    element?: any;
    position?: any;

    constructor() {
      this.section = 0;
      this.block = new Block();
    }
}
