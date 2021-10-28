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

    writeDataBlock(writer: BinReaderWriter) {
        writer.writeUint32(this.offset);
        writer.writeUint32(this.length);
    }
}
