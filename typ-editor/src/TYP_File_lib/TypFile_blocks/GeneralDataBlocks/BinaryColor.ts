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
                colorList.push(new Color(red, green, blue, alpha));
            }
        }
        return colorList; 
    }

    static readColor(reader: BinReaderWriter, bWithAlpha: boolean = false) {
        return this.readColorTable(reader, 1, false)[0];
    }
}