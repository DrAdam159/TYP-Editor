export interface Header {
    headerLen: number;
    unknown_0x01: number;
    garminTYPSignature: string;
    unknown_0x0C: number;
    unknown_0x0D: number;
    creationDate: Date;
}