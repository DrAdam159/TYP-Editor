import { BinReaderWriter } from '../../Utils/BinReaderWriter';

export class DataBlock {
    offset!: number;
    length!: number;

    constructor(reader: BinReaderWriter) {
        this.readDataBlock(reader);
    }

    readDataBlock(reader: BinReaderWriter): void {
        this.offset = reader.readUint32();
        this.length = reader.readUint32();
    }
}
