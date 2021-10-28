import { BinReaderWriter } from '../../Utils/BinReaderWriter';

export class TableItem {
    type: number;
    subType: number;
    offset: number;
    rawType: number;

    constructor(reader?: BinReaderWriter, itemLen?: number) {
        if(reader && itemLen) {
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
                default:
                    this.offset = 0;
            }
        }
        else {
            this.rawType = 0;
            this.type = 0;
            this.subType = 0;
            this.offset = 0
        }
        
    }
}
