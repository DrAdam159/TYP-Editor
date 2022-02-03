import { Color } from "../../Utils/Color";
import { BinReaderWriter } from "../../Utils/BinReaderWriter";

export class BinaryColor {

    static readColorTable(reader: BinReaderWriter, tableCols: number = 1, bWithAlpha: boolean = false): Array<Color>{
        let colorList = new Array();

        if(!bWithAlpha) {
            for(let i = 0; i < tableCols; i++) {
                let blue = reader.readUint8();
                let green = reader.readUint8();
                let red = reader.readUint8();
                colorList.push(new Color(red, green, blue));
            }
        }else {
            //urceni delky tabulky barev
            let tableLen = tableCols *3 + (tableCols/2) | 0;
            if (tableCols % 2 == 1) tableLen++;

            let colorTable = reader.readBytes(tableLen);
            let halfByteTable = new Array();

            for(let i = 0; i < tableLen; i++) {
                halfByteTable[2 * i] = (colorTable[i] & 0xf);
                halfByteTable[2 * i + 1] = (colorTable[i] >> 4);
            }

            for(let i = 0; i < tableCols; i++) {
                let blue = (halfByteTable[7 * i] | (halfByteTable[7 * i + 1] << 4));
                let green = (halfByteTable[7 * i + 2] | (halfByteTable[7 * i + 3] << 4));
                let red = (halfByteTable[7 * i + 4] | (halfByteTable[7 * i + 5] << 4));
                let alpha = halfByteTable[7 * i + 6];
                alpha = (255 * alpha) / 15;  
                colorList.push(new Color(red, green, blue, ~alpha & 0xff));
            }
        }
        return colorList; 
    }

    static readColor(reader: BinReaderWriter, bWithAlpha: boolean = false) {
        return this.readColorTable(reader, 1, false)[0];
    }

    static writeColorTable(writer: BinReaderWriter, coltable: Array<Color>, bWithAlpha: boolean = false): void {
        if (!bWithAlpha) {
           for (let i = 0; i < coltable.length; i++) {
              writer.writeUint8(coltable[i].b);
              writer.writeUint8(coltable[i].g);
              writer.writeUint8(coltable[i].r);
           }
        } else {
           // Urceni delky tabulky barev
           let len = coltable.length * 3 + (coltable.length / 2) | 0;
           if (coltable.length % 2 == 1) len++;
           // Generovani tabulky barev
           let colortable = new Array<number>(len);

           let halfbytetable = new Array<number>(2 * len);
         
           for (let i = 0, j = 0; i < coltable.length; i++) {
              halfbytetable[j++] = (coltable[i].b & 0xF) & 0xFF;
              halfbytetable[j++] = (coltable[i].b >> 4) & 0xFF;
              halfbytetable[j++] = (coltable[i].g & 0xF) & 0xFF;
              halfbytetable[j++] = (coltable[i].g >> 4) & 0xFF;
              halfbytetable[j++] = (coltable[i].r & 0xF) & 0xFF;
              halfbytetable[j++] = (coltable[i].r >> 4) & 0xFF;
              halfbytetable[j++] = (0xF - ((coltable[i].a / 0xFF) | 0) * 0xF);
           }
           for (let i = 0; i < colortable.length; i++) {
              colortable[i] = (halfbytetable[2 * i] | (halfbytetable[2 * i + 1] << 4)) & 0xFF;
           }
           writer.writeBytes(colortable);
        }
     }

    static writeColor(writer: BinReaderWriter, col: Color): void {
        let tempCol: Array<Color> = new Array();
        tempCol.push(col);
        this.writeColorTable(writer, tempCol);
     }
}