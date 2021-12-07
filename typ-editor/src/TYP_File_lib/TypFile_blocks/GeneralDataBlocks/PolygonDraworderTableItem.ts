import { BinReaderWriter } from '../../Utils/BinReaderWriter';

export class PolygonDraworderTableItem {
   type!: number;
   subTypes!: Array<number>;
   level!: number;

   constructor(reader?: BinReaderWriter, len: number = 0, level: number = 0) {
   this.subTypes = new Array();
      if(reader) {
         if (len > 9)
            throw new Error("A PolygonDraworderTableItem can be a maximum of 9 bytes long.");
         this.level = level;
         this.type = reader.readUint8();
         len--;

         for (let b = 0; b < len; b++) {          // Přečíst všechny (4) bajty pro podtypy 0x00 ... 0x1F
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
   }

   SetSubtype(subtyp: number): void {
      if (!this.subTypes.includes(subtyp)) {
         this.subTypes.push(subtyp);
      }
   }

   write(writer: BinReaderWriter, length: number): void {
      writer.writeUint8(this.type & 0xFF);
      length--;

      let b = new Array<number>(length);
      if (0xFF < this.type)               
         for (let i = 0; i < this.subTypes.length; i++) {
            let bidx = (this.subTypes[i] / 8) | 0;        // Byte-Index (0..)
            b[bidx] |= 0xFF & (0x01 << 0xFFFFFFFF & (this.subTypes[i] % 8));
         }

      writer.writeBytes(b);
   }
}
