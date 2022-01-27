export class BinReaderWriter {

    private buffLen: number;
    private position: number;
    private buffer: DataView;

    constructor(view: DataView) {
        this.buffLen = view.byteLength;
        this.position = 0;
        this.buffer = view;
    }

    readUint8(): number{
        if(this.position < this.buffLen) {
            if (this.buffLen < 1) {
                return 0;
            }
    
            let byte = this.buffer.getUint8(this.position);
            this.position++;
    
            return byte;
        }
        return 0;
        
    }

    readUint16(): number{
        let list: Array<number> = new Array();
        if(this.position < this.buffLen) {
            if (this.buffLen < 2) {
                return 0;
            }
    
            
        
            for(let i = 0; i < 2; i++){
                list.push(this.buffer.getUint8(this.position + i));
            }
            this.position += 2;
        }
        return (list[0]| list[1] << 8);
    }

    readUint32(): number{
        if (this.buffLen < 4) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 4; i++){
            list.push(this.buffer.getUint8(this.position + i));
        }
        this.position += 4;
    
        return (list[0] | list[1] << 8 | list[2] << 16 | list[2] << 24);
    }

    readInt8(): number{
        if (this.buffLen < 1) {
            return 0;
        }

        let byte = this.buffer.getInt8(this.position);
        this.position++;
        
        return byte;
    }

    readInt16(): number{
        if (this.buffLen < 2) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 2; i++){
            list.push(this.buffer.getInt8(this.position + i));
        }
        this.position += 2;
    
        return (list[0]| list[1] << 8);
    }

    readInt32(): number{
        if (this.buffLen < 4) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 4; i++){
            list.push(this.buffer.getInt8(this.position + i));
        }
        this.position += 4;
    
        return (list[0] | list[1] << 8 | list[2] << 16 | list[2] << 24);
    }

    readString(len: number): string {
        if (this.buffLen < len) {
            return '';
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < len; i++){
            list.push(this.buffer.getUint8(this.position + i));
        }
        this.position += len;
        return String.fromCharCode.apply(String, list);
    }

    readUint16FromOffset(offset: number): number{
        if (this.buffLen < 2) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 2; i++){
            list.push(this.buffer.getUint8(offset+i));
        }

        return (list[0]| list[1] << 8);
    }

    readUint32FromOffset(offset: number): number{
        if (this.buffLen < 4) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 4; i++){
            list.push(this.buffer.getUint8(offset+i));
        }

        return (list[0] | list[1] << 8 | list[2] << 16 | list[2] << 24);
    }

    readStringFromOffset(len: number, offset: number): string {
        if (this.buffLen < len) {
            return '';
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < len; i++){
            list.push(this.buffer.getUint8(offset+i));
        }
        return String.fromCharCode.apply(String, list);
    }

    read3U(): number {
        let v = this.readUint16();
        v += this.readUint8() << 16;
        return v;
    }

    readBytes(count: number): Array<number> {
        let list = new Array();
        for(let i = 0; i < count; i++) {
            list.push(this.readUint8());
        }
        return list; 
    }

    seek(offsetOrigin: number) {
        this.position = offsetOrigin;
    }

    readStringWithUndefinedLen(maxLen: number = 0, codepage: number): string {
        let utf8decoder = new TextDecoder('windows-1251');
        if(codepage == 65001) {
            utf8decoder = new TextDecoder();
        }
        let len = maxLen > 0 ? maxLen : Number.MAX_SAFE_INTEGER;
        let list: Array<number> = new Array();
        let b: number;
        do {
            b = this.readUint8();
            if(b != 0) {
                list.push(b);
            }
            len--;
        } while(b != 0 && len > 0);
        // return String.fromCharCode.apply(String, list);
        return utf8decoder.decode(new Uint8Array(list));
    }

    writeUint8(value: number): void{
        this.buffer.setUint8(this.position, value);
        this.position++;
    }

    writeInt8(value: number): void{
        this.buffer.setInt8(this.position, value);
        this.position++;
    }

    writeString(text: string): void {
        let encoder = new TextEncoder();
        let encodedText = encoder.encode(text);
        for(let i = 0; i < encodedText.length; i++) {
            this.writeUint8(encodedText[i]);
        }
        // let byteArr = this.strToUtf8Bytes(text);
        // for(let i = 0; i < byteArr.length; i++) {
        //     this.writeUint8(byteArr[i]);
        // }
    }

    strToUtf16Bytes(str: string): Array<number> {
        const bytes = [];
        for (let ii = 0; ii < str.length; ii++) {
          const code = str.charCodeAt(ii); // x00-xFFFF
          bytes.push(code & 255, code >> 8); // low, high
        }
        return bytes;
    }

    strToUtf8Bytes(str: string) {
        const utf8 = [];
        for (let ii = 0; ii < str.length; ii++) {
          let charCode = str.charCodeAt(ii);
          if (charCode < 0x80) utf8.push(charCode);
          else if (charCode < 0x800) {
            utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
          } else if (charCode < 0xd800 || charCode >= 0xe000) {
            utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
          } else {
            ii++;
            // Surrogate pair:
            // UTF-16 encodes 0x10000-0x10FFFF by subtracting 0x10000 and
            // splitting the 20 bits of 0x0-0xFFFFF into two halves
            charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
            utf8.push(
              0xf0 | (charCode >> 18),
              0x80 | ((charCode >> 12) & 0x3f),
              0x80 | ((charCode >> 6) & 0x3f),
              0x80 | (charCode & 0x3f),
            );
          }
        }
        return utf8;
    }

    writeUint16(value: number): void {
        let upper = (value >> 8)  & 0xFF;
        let lower = value & 0xFF;
        let byteArr = [lower, upper];
        for(let i = 0; i < byteArr.length; i++) {
            this.writeUint8(byteArr[i]);
        }
        //console.log(value);
        //console.log(byteArr);
    }

    writeUint32(value: number): void {
        let byte1 = value & 0xFF;
        let byte2 = (value >> 8)  & 0xFF;
        let byte3 = (value >> 16)  & 0xFF;
        let byte4 = (value >> 24)  & 0xFF;
        let byteArr = [byte1, byte2, byte3, byte4];
        for(let i = 0; i < byteArr.length; i++) {
            this.writeUint8(byteArr[i]);
        }
        // console.log(value);
        // console.log(byteArr);
    }

    writeBytes(bytes: Array<number>): void {
        for(let i = 0; i < bytes.length; i++) {
            this.writeUint8(bytes[i]);
        } 
    }

    getBuffer(): DataView {
        return this.buffer;
    }

    getPosition(): number {
        return this.position;
    }

}