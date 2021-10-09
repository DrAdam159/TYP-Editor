import { BinReader } from '../../Utils/BinReaderWriter';

export class PolygonDraworderTableItem {
    type!: number;
    subTypes!: Array<number>;
    level!: number;

    constructor(reader: BinReader, len: number, level: number) {
        this.subTypes = new Array();
        if (len > 9)
            throw new Error("A PolygonDraworderTableItem can be a maximum of 9 bytes long.");
        this.level = level;
        this.type = reader.readUint8();
        len--;

        for (let b = 0; b < length; b++) {          // Přečíst všechny (4) bajty pro podtypy 0x00 ... 0x1F
            let bv = reader.readUint8();
            let mask = 0x01;
            for (let bit = 0; bit < 8; bit++) {
               if ((bv & mask) != 0x0)
                  this.SetSubtype(bit + 8 * b);
               mask <<= 1;
            }
         }

         if (this.subTypes.length == 0)
         this.subTypes.push(0);
         else
            this.type += 0x100;
    }

    SetSubtype(subtyp: number): void {
        if (!this.subTypes.includes(subtyp))
        this.subTypes.push(subtyp);
     }
}
