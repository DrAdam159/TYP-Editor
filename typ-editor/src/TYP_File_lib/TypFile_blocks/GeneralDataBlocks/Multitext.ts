import { BinReaderWriter } from "src/TYP_File_lib/Utils/BinReaderWriter";
import { Text } from "./Text";

export enum LanguageCode {
    unspecified = 0x00,
    french = 0x01,
    german = 0x02,
    dutch = 0x03,
    english = 0x04,
    italian = 0x05,
    finnish = 0x06,
    swedish = 0x07,
    spanish = 0x08,
    basque = 0x09,
    catalan = 0x0a,
    galician = 0x0b,
    welsh = 0x0c,
    gaelic = 0x0d,
    danish = 0x0e,
    norwegian = 0x0f,
    portuguese = 0x10,
    slovak = 0x11,
    czech = 0x12,
    croatian = 0x13,
    hungarian = 0x14,
    polish = 0x15,
    turkish = 0x16,
    greek = 0x17,
    slovenian = 0x18,
    russian = 0x19,
    estonian = 0x1a,
    latvian = 0x1b,
    romanian = 0x1c,
    albanian = 0x1d,
    bosnian = 0x1e,
    lithuanian = 0x1f,
    serbian = 0x20,
    macedonian = 0x21,
    bulgarian = 0x22
 }

export interface KeyValuePair {
    key: LanguageCode;
    value: string;
}


export class MultiText {
    textArr: Array<KeyValuePair>;

    constructor(reader?: BinReaderWriter, codepage: number = 65001) {
        this.textArr = new Array();
        let t = new Text();
        if(reader){
            let len = reader.readUint8();
        
            if ((len & 0x1) == 0x1)       // liché -> pouze 1 byte pro identifikátor délky
                len >>= 1;
             else {                        // sudé -> 2 byty pro identifikaci délky
                len += reader.readUint8() << 8;
                len >>= 2;
             }
             while (len > 0) {
                t = new Text(reader, codepage);
                this.set(t);
                len -= t.text.length + 2;
             }
             this.set(t);
        }
        else {
            this.set(new Text());
        }
        
    }

    set(iText: Text): void {
        if(!(this.textArr.some(e => e.key == iText.language))) {
            this.textArr.push({key: iText.language, value: iText.text});
        }
        else {
            (this.textArr = this.textArr.filter(element => element.key !== iText.language)).push({key: iText.language, value: iText.text});
        }
        this.textArr.sort(function(a, b) {
            return a.key - b.key;
        });
     }

     getRealLength(): number {
        let len = 0;
        for(const t of this.textArr) {
            len += t.value.length + 2;  
        }   
        return len;
     }

     getIdentificationLength(): number {
        let len = this.getRealLength();
        len = 2 * len + 1;      
        if (len > 0xFF)
           len *= 2;           
        return len;
     }

     write(writer: BinReaderWriter, codePage: number): void {
        let len = this.getIdentificationLength();
        if (len <= 0xff) {
            writer.writeUint8(0xFF & len);
        }
        else {
            writer.writeUint16(0xFFFF & len);
        }
        for(const t of this.textArr) {
            let tempText = new Text();
            tempText.language = t.key;
            tempText.text = t.value;
            tempText.write(writer, codePage);
        }
     }
}