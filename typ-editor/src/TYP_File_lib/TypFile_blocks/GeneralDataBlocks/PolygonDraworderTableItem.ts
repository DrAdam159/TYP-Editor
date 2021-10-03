import { BinReader } from '../../Utils/BinReaderWriter';

export class PolygonDraworderTableItem {
    type!: number;
    subType!: number;
    level!: number;

    constructor(reader: BinReader, len: number, level: number) {
        
    }
}
