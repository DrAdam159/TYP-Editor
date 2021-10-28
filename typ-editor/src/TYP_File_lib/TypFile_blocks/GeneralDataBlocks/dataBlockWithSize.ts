import { BinReaderWriter } from "../../Utils/BinReaderWriter";

export class DataBlockWithSize{
    offset!: number;
    length!: number;
    recordSize!: number;

    constructor(reader: BinReaderWriter) {
        this.readDataBlockWithSize(reader);
    }

    readDataBlockWithSize(reader: BinReaderWriter): void {
        this.offset = reader.readUint32();
        this.recordSize = reader.readUint16();
        this.length = reader.readUint32();
    }

    writeDataBlockWithSize(writer: BinReaderWriter): void {
        writer.writeUint32(this.offset);
        writer.writeUint16(this.recordSize);
        writer.writeUint32(this.length);
    }

    count(): number {
        return this.recordSize > 0 ? this.length / this.recordSize : 0;
    }
}