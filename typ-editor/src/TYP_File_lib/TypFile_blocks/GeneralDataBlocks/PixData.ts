import { BinReader } from "src/TYP_File_lib/Utils/BinReaderWriter";

export class PixData {
    width: number;
    height: number;
    bitsPerPixel: number;
    rawIMGData: Array<number>;

    constructor(width: number, height: number, bitsPerPixel: number, reader?: BinReader) {
        this.width = width;
        this.height = height;
        this.bitsPerPixel = bitsPerPixel;
        this.rawIMGData = new Array();

        if(reader) {
            this.read(reader);
        }
    }

    copyIMGData(pix: PixData) {
        this.rawIMGData = [...pix.rawIMGData];
    }

    read(reader: BinReader): void {
        this.rawIMGData = reader.readBytes(this.bytesForBitmapLine(this.width, this.bitsPerPixel) * this.height);
    }

    //určuje počet bajtů požadovaných pro bitmapový řádek
    bytesForBitmapLine(width: number, bitsPerPixel: number): number {
        let bytesForLine  = width * bitsPerPixel;
        return ((bytesForLine / 8) | 0) + (bytesForLine % 8 > 0 ? 1 : 0);
    }

    //nastaveni vsech bitu na 1
    setAllBits(): void {
        for (let i = 0; i < this.rawIMGData.length; i++)
        this.rawIMGData[i] = 0xff;
     }
}