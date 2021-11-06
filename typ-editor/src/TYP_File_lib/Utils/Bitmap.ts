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

    copyData(newPixelArr: Uint8ClampedArray): void {
        this.pixelArr =  new Uint8ClampedArray(newPixelArr);
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

    compareColors(firstColor: Color, secondColor: Color): boolean {
        if(firstColor.r == secondColor.r &&
            firstColor.g == secondColor.g &&
            firstColor.b == secondColor.b &&
            firstColor.a == secondColor.a 
        ) {
            return true;
        }
        return false;

    }

    fillUtil(x: number, y: number, newColor: Color, prevColor: Color): void {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        if(!(this.compareColors(this.getPixelColor(x, y), prevColor))) return;
        if(this.compareColors(this.getPixelColor(x, y), newColor)) return;

        this.setPixel(x, y, newColor);

        this.fillUtil(x + 1, y, newColor, prevColor);
        this.fillUtil(x - 1, y, newColor, prevColor);
        this.fillUtil(x, y + 1, newColor, prevColor);
        this.fillUtil(x, y - 1,  newColor, prevColor);
    }

    fill(x: number, y: number, newColor: Color): void {
        let prevColor = this.getPixelColor(x, y)
        if(this.compareColors(prevColor, newColor)) {
            return;
        }
        this.fillUtil(x, y, newColor, prevColor);
    }
}