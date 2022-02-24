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
        this.pixelArr.fill(255);
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

    setPixelWithAplha(x: number, y: number, color: Color): void {
        let idx = this.width * y * this.pixelOffset + x * this.pixelOffset;

        const newAlpha: number = 255 - ((255 - this.pixelArr[idx + 3]) * (255 - color.a) / 255)
        const newRed: number = (this.pixelArr[idx + 0] * (255 - color.a) + color.r * color.a) / 255
        const newGreen: number = (this.pixelArr[idx + 1] * (255 - color.a) + color.g * color.a) / 255
        const newBlue: number  = (this.pixelArr[idx + 2] * (255 - color.a) + color.b * color.a) / 255
        this.pixelArr[idx + 0] = newRed;   
        this.pixelArr[idx + 1] = newGreen;   
        this.pixelArr[idx + 2] = newBlue;  
        this.pixelArr[idx + 3] = newAlpha; 
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

    getPaletteColors(palette: ColorPallet, colsToConvert: Array<Color>): Array<Color> {
        const colList: Array<{oldColor: Color; newColor: Color}> = new Array();
        const newCols: Array<Color> = new Array();
        colsToConvert.forEach(oldColor => {
            if(!(colList.some(e => e.oldColor.compareColors(oldColor)))) {
               const newColor: Color = new Color('#' + palette.colors[this.findNearestColor(oldColor,palette)]);
               colList.push({oldColor: oldColor, newColor: newColor});
           }
         });
         colList.forEach(newCol => {
            newCols.push(newCol.newColor)
         });

         return newCols;
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

    replaceColor(newColor: Color, oldColor: Color): void {
        // newColor.a = 255;
        // oldColor.a = 255;
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) { 
                if(this.getPixelColor(x, y).compareColors(oldColor)) {
                    console.log("replace");
                    this.setPixel(x, y, newColor);
                }
            }
        }
    }

    getAllColors(): Array<Color> {
        let colList: Array<Color> = new Array();
        for(let x = 0; x < this.width; x++) { 
            for(let y = 0; y < this.height; y++) { 
                let currColor: Color = this.getPixelColor(x, y);
                if(!(colList.some(e => e.compareColors(currColor)))) {
                    colList.push(currColor);
                }
            }
        }    

        return colList;
    }

    updateColors(oldColors: Array<Color>): void {
        for(let x = 0; x < this.width; x++) { 
            for(let y = 0; y < this.height; y++) { 
                let currColor: Color = this.getPixelColor(x, y);
                if(!(oldColors.some(e => e.compareColors(currColor)))) {
                    oldColors.push(currColor);
                }
            }
        }    
    }

    clearBitmap(): void {
        this.pixelArr = new Uint8ClampedArray(this.width * this.height * this.pixelOffset);
        this.pixelArr.fill(255);
    }

    checkForNonGarminColors_palette16(cols: Array<Color>): boolean {
        for(let col of cols) {
            if (!pallet16.colors.find(paletteCol => col.compareColorsNonAlpha(new Color('#' + paletteCol)))) {
              return true;
            }
        }
        return false;
    }

    checkForNonGarminColors_palette64(cols: Array<Color>): boolean {
        for(let col of cols) {
            if (!pallet64.colors.find(paletteCol => col.compareColorsNonAlpha(new Color('#' + paletteCol)))) {
              return true;
            }
        }
        return false;

    }

    checkForNonGarminColors_palette256(cols: Array<Color>): boolean {
        for(let col of cols) {
            if (!pallet256.colors.find(paletteCol => col.compareColorsNonAlpha(new Color('#' + paletteCol)))) {
              return true;
            }
        }
        return false;

    }

    scale(size: {newWidth: number, newHeight: number}): Bitmap{
        const newBitmap = new Bitmap(size.newWidth, size.newHeight);
        const x_scale: number = this.width / newBitmap.width
        const y_scale: number = this.height / newBitmap.height

        for(let x = 0; x < newBitmap.width; x++) { 
            for(let y = 0; y < newBitmap.height; y++) { 
                const xp = Math.floor(x * x_scale);
                const yp = Math.floor(y * y_scale);
                newBitmap.setPixel(x, y, this.getPixelColor(xp, yp));
            }
        }
        
        return newBitmap;
    }

    resize(size: {newWidth: number, newHeight: number}): Bitmap{
        const newBitmap = new Bitmap(size.newWidth, size.newHeight);

        for(let x = 0; x < newBitmap.width; x++) { 
            for(let y = 0; y < newBitmap.height; y++) { 
                if(x < this.width && y < this.height) {
                    newBitmap.setPixel(x, y, this.getPixelColor(x, y));
                }
            }
        }
        
        return newBitmap;
    }

    movePixels(offset: {x: number, y: number}): void {
        const newBitmap = new Bitmap(this.width, this.height);
        for(let x = 0; x < this.width; x++) { 
            for(let y = 0; y < this.height; y++) { 
                if((x + offset.x < this.width && x + offset.x >= 0) && 
                (y + offset.y < this.height && y + offset.y >= 0)) {
                    newBitmap.setPixel(x + offset.x, y + offset.y, this.getPixelColor(x,y));
                }
            }
        }
        this.pixelArr = newBitmap.pixelArr; 
    }

    drawChessBoard(patternColor: Color): void {
        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) { 
                if ( (x + y) % 2 == 0) {
                    this.setPixel(x, y, patternColor);
                }
            }
        }
    }
}