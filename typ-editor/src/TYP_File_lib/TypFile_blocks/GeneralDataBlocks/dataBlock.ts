import { BinReaderWriter } from '../../Utils/BinReaderWriter';

export class DataBlock {
    offset!: number;
    length!: number;

    constructor(reader?: BinReaderWriter) {
        if(reader) {
            this.readDataBlock(reader);
        }
        else {
            this.offset = 0;
            this.length = 0;
        }
        
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
