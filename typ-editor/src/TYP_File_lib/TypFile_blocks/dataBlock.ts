import { readUint32 } from '../Utils/binUtils';

export class DataBlock {
    offset!: number;
    length!: number;

    constructor(view: DataView, blockOffset: number, lenOffset: number) {
        this.readDataBlock(view, blockOffset, lenOffset);
    }

    readDataBlock(view: DataView, blockOffset: number, lenOffset: number): void {
        this.offset = readUint32(blockOffset, view);
        this.length = readUint32(lenOffset, view);
    }
}
