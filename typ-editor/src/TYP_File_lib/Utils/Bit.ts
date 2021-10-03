export class Bit {

    static isSet(value: number, bit: number): boolean {
        if(bit >= 32) {
            throw new Error("Only bit from 0 to 31 is allowed");
        }
        return (value & (0x01 << bit)) != 0;
    }
}