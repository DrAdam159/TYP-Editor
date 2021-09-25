import { DataBlock } from "./dataBlock";
import { readUint16} from '../Utils/binUtils';

export class DataBlockWithSize extends DataBlock{
    recordSize!: number;

    constructor(view: DataView, blockOffset: number, lenOffset: number, sizeOffset: number) {
        super(view, blockOffset, lenOffset);
        this.readDataBlockWithSize(sizeOffset, view);
    }

    readDataBlockWithSize(sizeOffset: number, view: DataView): void {
        this.recordSize = readUint16(sizeOffset, view);
    }
}