export function readString(len: number, view: DataView, offset: number): string {
    let list: Array<number> = new Array();

    for(let i = 0; i < len; i++){
        list.push(view.getUint8(offset+i));
    }
    return String.fromCharCode.apply(String, list);
}
