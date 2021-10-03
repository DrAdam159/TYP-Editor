import { BinReader } from '../../Utils/BinReaderWriter';

export class TableItem {
    type!: number;
    subType!: number;
    offset!: number;
    rawType!: number;

    constructor(reader: BinReader, itemLen: number) {
        this.rawType = reader.readUint16();
        this.type = this.rawType >> 5;
        this.subType = this.rawType & 0x1f;
        switch(itemLen) {
            case 3:
                this.offset = reader.readUint8();
                break;
            case 4:
                this.offset = reader.readUint16();
                break;
            case 5:
                this.offset = reader.read3U();
                break;
        }
    }
}
