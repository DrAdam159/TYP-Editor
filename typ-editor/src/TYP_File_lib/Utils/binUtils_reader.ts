export class BinReader {

    private buffLen: number;
    private position: number;
    private buffer: DataView;

    constructor(view: DataView) {
        this.buffLen = view.byteLength;
        this.position = 0;
        this.buffer = view;
    }

    readUint8(): number{
        if (this.buffLen < 1) {
            return 0;
        }

        let byte = this.buffer.getUint8(this.position);
        this.position++;

        return byte;
    }

    readUint16(): number{
        if (this.buffLen < 2) {
            return 0;
        }

        let list: Array<number> = new Array();
    
        for(let i = 0; i < 2; i++){
            list.push(this.buffer.getUint8(this.position + i));
        }
        this.position += 2;
    
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
            console.log(this.position);
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
}