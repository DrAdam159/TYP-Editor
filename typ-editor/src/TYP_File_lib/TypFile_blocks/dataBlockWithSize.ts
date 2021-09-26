import { BinReader } from "../Utils/binUtils_reader";

export class DataBlockWithSize{
    offset!: number;
    length!: number;
    recordSize!: number;

    constructor(reader: BinReader) {
        this.readDataBlockWithSize(reader);
    }

    readDataBlockWithSize(reader: BinReader): void {
        this.offset = reader.readUint32();
        this.recordSize = reader.readUint16();
        this.length = reader.readUint32();
    }
}