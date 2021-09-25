export function readString(len: number, view: DataView, offset: number): string {
    let list: Array<number> = new Array();

    for(let i = 0; i < len; i++){
        list.push(view.getUint8(offset+i));
    }
    return String.fromCharCode.apply(String, list);
}

export function readUint16(offset: number, view: DataView){
    let list: Array<number> = new Array();

    for(let i = 0; i < 2; i++){
        list.push(view.getUint8(offset+i));
    }

    return (list[0]| list[1] << 8);
}

export function readUint32(offset: number, view: DataView){
    let list: Array<number> = new Array();

    for(let i = 0; i < 4; i++){
        list.push(view.getUint8(offset+i));
    }

    return (list[0] | list[1] << 8 | list[2] << 16 | list[2] << 24);
}