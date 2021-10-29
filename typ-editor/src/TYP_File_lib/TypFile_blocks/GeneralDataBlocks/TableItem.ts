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

    setType(type: number): void {
        this.type = type;
    }

    setSubType(subType: number): void {
        this.subType = subType;
    }

    setOffset(offset: number): void {
        this.offset = offset;
    }

    setRawType(rawType: number): void {
        this.rawType = rawType;
    }

    write(writer: BinReaderWriter, recordSize: number): void {
        let type = ((this.type << 5) | this.subType) & 0xFFFF;
         writer.writeUint16(type);
         switch (recordSize) {
            case 3: 
                writer.writeUint8(this.offset & 0xFF); 
                break;
            case 4:
                writer.writeUint16(this.offset & 0xFFFF); 
                break;
            case 5:
               writer.writeUint16(this.offset & 0xFFFF);
               writer.writeUint8((this.offset >> 16) & 0xFF);
               break;
        }
    }

    
}
