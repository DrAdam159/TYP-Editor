import { BinReader } from '../../Utils/BinReaderWriter';

export class DataBlock {
    offset!: number;
    length!: number;

    constructor(reader: BinReader) {
        this.readDataBlock(reader);
    }

    readDataBlock(reader: BinReader): void {
        this.offset = reader.readUint32();
        this.length = reader.readUint32();
    }
}