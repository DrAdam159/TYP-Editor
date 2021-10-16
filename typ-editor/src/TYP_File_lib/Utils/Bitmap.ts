import { Color } from "./Color";

export class Bitmap {
    width: number;
    height: number;
    pixelArr: Uint8ClampedArray;
    pixelOffset: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        //*4 - rgba
        this.pixelOffset = 4;
        this.pixelArr = new Uint8ClampedArray(this.width * this.height * this.pixelOffset);
    }

    setPixel(x: number, y: number, color: Color): void {
        let idx = this.width * y * this.pixelOffset + x * this.pixelOffset;
        this.pixelArr[idx + 0] = color.r;   
        this.pixelArr[idx + 1] = color.g;   
        this.pixelArr[idx + 2] = color.b;  
        this.pixelArr[idx + 3] = color.a; 
    }

    getImageData(): ImageData {
        return new ImageData(this.pixelArr, this.width, this.height);
    }

    getPixelColor(x: number, y: number): Color {
        let idx = this.width * y * this.pixelOffset + x * this.pixelOffset;
        let tmpColor = new Color(this.pixelArr[idx + 0], 
                                this.pixelArr[idx + 1], 
                                this.pixelArr[idx + 2],
                                this.pixelArr[idx + 3]); 
        return tmpColor;
    }
}