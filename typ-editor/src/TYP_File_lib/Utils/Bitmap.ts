import { Color } from "./Color";
import { ColorPallet } from "../ColorPallets/ColorPallet";
import { pallet256, pallet64, pallet16 } from "../ColorPallets/GarminColorPallets";

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

    getDistance(currentColor: Color, matchColor: Color): number {

        let redDifference: number = currentColor.r - matchColor.r;
        let greenDifference: number = currentColor.g - matchColor.g; 
        let blueDifference: number = currentColor.b - matchColor.b; 

        return redDifference * redDifference +
                greenDifference * greenDifference + 
                blueDifference * blueDifference; 
    }

    findNearestColor(color: Color, pallet: ColorPallet): number {
        let shortestDistance: number = 99999999;
        let index: number = -1;

        for(let i = 0; i < pallet.colors.length; i++) {

            let matchCol = new Color('#' + pallet.colors[i]);
            let distance = this.getDistance(color, matchCol);
            if(distance < shortestDistance) {
                index = i;
                shortestDistance = distance;
            }
        }

        return index;
    }

    applyColorPallet(palletType: string): void {
        let pallet: ColorPallet;
        switch(palletType) {
            case 'Garmin256':
                pallet = pallet256;
                break;
            case 'Garmin64':
                pallet = pallet64;
                break;
            case 'Garmin16':
                pallet = pallet16;
                break;
            default:
                pallet  = pallet256;
        }

        let colList: Array<{oldColor: Color; newColor: Color}> = new Array();

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {

                let oldColor: Color = this.getPixelColor(x, y);

                if(!(colList.some(e => e.oldColor.compareColors(oldColor)))) {
                    let newColor: Color = new Color('#' + pallet.colors[this.findNearestColor(oldColor,pallet)]);
                    colList.push({oldColor: oldColor, newColor: newColor});
                }
                let newColor: Color = colList.find(e => e.oldColor.compareColors(oldColor))?.newColor || new Color(255,255,255);
                this.setPixel(x, y, newColor);
            }
        }
    }

    getInverseColor(currentColor: Color): Color {
        const r: number = 255 - currentColor.r;
        const g: number = 255 - currentColor.g;
        const b: number = 255 - currentColor.b;

        return new Color(r,g,b);
    }

    inverseColors(): void {
        let colList: Array<{oldColor: Color; newColor: Color}> = new Array();
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {

                let oldColor: Color = this.getPixelColor(x, y);

                if(!(colList.some(e => e.oldColor.compareColors(oldColor)))) {
                    let newColor: Color = this.getInverseColor(oldColor);
                    colList.push({oldColor: oldColor, newColor: newColor});
                }
                let newColor: Color = colList.find(e => e.oldColor.compareColors(oldColor))?.newColor || new Color(255,255,255);
                this.setPixel(x, y, newColor);
            }
        }
    }
}