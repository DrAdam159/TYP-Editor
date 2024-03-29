export class Bit {

    static isSet(value: number, bit: number): boolean {
        if(bit >= 32) {
            throw new Error("Only bit from 0 to 31 is allowed");
        }
        return (value & (0x01 << bit)) != 0;
    }

    static set(toSet: number, value: number, bitPosition: number): number {
        return toSet |= value << bitPosition;
    }

    static reset(toSet: number, value: number, bitPosition: number): number {
        return toSet &= ~(1 << bitPosition);
    }
}