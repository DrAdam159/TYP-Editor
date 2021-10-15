import { BinReader } from "src/TYP_File_lib/Utils/BinReaderWriter";
import { PixData } from "./PixData";
import { Color } from "src/TYP_File_lib/Utils/Color";
import { BinaryColor } from "./BinaryColor";
import { Bitmap } from "src/TYP_File_lib/Utils/Bitmap";

enum BitmapColorMode {
    POI_SIMPLE = 0,
   
    //další kód barvy (není součástí tabulky barev) znamená průhledné pixely
    POI_TR = 0x10,
    
    //každá barva může mít svou vlastní průhlednost
    POI_ALPHA = 0x20,

    //1 bit na pixel, 2 barvy
    POLY2 = 0xfffd,
    
    //1 bit na pixel, 1 barva (kód 1) + průhlednost
    POLY1TR = 0xfffe,

    unknown = 0xffff
 }

 //zpracovani ruznych bitmap
export class PixMap {
    data: PixData;
    width: number;
    height: number;
    colorCount: number;
    colorMode: BitmapColorMode;
    colorTable: Array<Color>;
    bitsPerPixel: number;

    constructor(iWidth: number, iHeight: number, iColors: number, bitmapColorMode: BitmapColorMode, reader?: BinReader) {
        this.data = new PixData(iWidth, iHeight, this.bitsPerPixel4BitmapColorMode(bitmapColorMode,  iColors));
        this.width = this.data.width;
        this.height = this.data.height;
        this.colorCount = iColors;
        this.colorMode = bitmapColorMode;
        this.bitsPerPixel = this.data.bitsPerPixel;
        this.colorTable = new Array();
        if (bitmapColorMode == BitmapColorMode.POLY1TR)     //v tomto zvláštním případě nastavit všechny pixely / bity na 1
            this.data.setAllBits();

        if(reader) {
            if (iColors == 0) {        
                switch (this.colorMode) {
                   case BitmapColorMode.POI_SIMPLE:
                      this.data = new PixData(iWidth, iHeight, this.bitsPerPixel, reader);
                      break;

                   case BitmapColorMode.POI_TR:
                      this.data = new PixData(iWidth, iHeight, this.bitsPerPixel, reader);
                      break;

                   case BitmapColorMode.POI_ALPHA:
                      this.data = new PixData(iWidth, iHeight, this.bitsPerPixel, reader);
                      break;

                   case BitmapColorMode.POLY1TR:
                   case BitmapColorMode.POLY2:
                      throw new Error("For the ColorMode" + this.colorMode + "a color table must also be read in.");
                   default:
                      throw new Error("Unknown ColorMode: " + this.colorMode + "for bitmap");
                }
             } else {
                switch (this.colorMode) {
                   case BitmapColorMode.POI_SIMPLE:
                   case BitmapColorMode.POI_TR:
                      this.colorTable = BinaryColor.readColorTable(reader, iColors, false);
                      break;
                   case BitmapColorMode.POI_ALPHA:
                      this.colorTable = BinaryColor.readColorTable(reader, iColors, true);
                      break;
                   case BitmapColorMode.POLY1TR:
                      if (iColors != 1)
                         throw new Error("Only one color can be read in this color mode");

                      this.colorTable = BinaryColor.readColorTable(reader, 1, false);
                      break;
                   case BitmapColorMode.POLY2:
                      if (iColors != 2)
                         throw new Error("Only two colors can be read in this color mode");
                      this.colorTable = BinaryColor.readColorTable(reader, 2, false);
                      break;
                   default:
                      throw new Error("Unknown ColorMode for bitmap");
                }
                this.data = new PixData(iWidth, iHeight, this.bitsPerPixel, reader);
             }
        }
    }

    constructor2(color: Array<Color>, reader?: BinReader) {
        //this(iWidth, iHeight, color.length, bitmapColorMode);
        this.colorTable = [...color];
        if(reader) {
            this.data.read(reader);
        }
    }

    constructor3(xpm: PixMap) {
       this.data = new PixData(xpm.width, xpm.height, xpm.bitsPerPixel);
       this.data.copyIMGData(xpm.data);
       this.colorMode = xpm.colorMode;
       this.colorTable = new Array();
       this.colorTable = [...xpm.colorTable];
    }

    bitsPerPixel4BitmapColorMode(bitmapColorMode: BitmapColorMode, cols: number): number {
        let iBpp = 0;
        if (cols > 255)
           throw new Error("Too many colors.");
        switch (bitmapColorMode) {
           case BitmapColorMode.POI_SIMPLE:
              switch (cols) {
                 case 0: iBpp = 24; break;       
                 case 1: iBpp = 1; break;
                 case 2:
                 case 3: iBpp = 2; break;
                 default:
                    if (cols <= 15) iBpp = 4;
                    else iBpp = 8;
                    break;
              }
              break;

           case BitmapColorMode.POI_TR:         
              switch (cols) {
                 case 0: iBpp = 1; break;       
                 case 1:
                 case 2: iBpp = 2; break;
                 default:
                    if (cols <= 14) iBpp = 4;
                    else iBpp = 8;
                    break;
              }
              break;

           case BitmapColorMode.POI_ALPHA:
              switch (cols) {
                 case 0: iBpp = 32; break;        
                 case 1: iBpp = 1; break;
                 case 2:
                 case 3: iBpp = 2; break;
                 default:
                    if (cols <= 15) iBpp = 4;
                    else iBpp = 8;
                    break;
              }
              break;

           case BitmapColorMode.POLY1TR:
              if (cols > 2)
                 throw new Error("Too many colors for the bitmap color mode");
              iBpp = 1;
              break;

           case BitmapColorMode.POLY2:
              if (cols > 2)
                 throw new Error("Too many colors for the bitmap color mode");
              iBpp = 1;
              break;

           default:
              throw new Error("Unknown ColorMode for bitmap");
        }
        return iBpp;
    }

    setNewColors(colorList: Array<Color>): void {
         this.colorTable = new Array();
         this.colorTable = [...colorList];
    }

    setNewColor(idx: number, newColor: Color): void {
         if(idx > this.colorTable.length) {
            throw new Error("Index out of range");
         }
         this.colorTable[idx] = newColor;
    }

    getColor(idx: number): Color {
      if (idx >= this.colorTable.length)
         throw new Error("Wrong index value");
      return this.colorTable[idx];
    }

    changeColorMode(mode: BitmapColorMode): void {
       switch(this.colorMode) {
         case BitmapColorMode.POI_SIMPLE:
         case BitmapColorMode.POI_TR:
         case BitmapColorMode.POI_ALPHA:
            if (this.bitsPerPixel > 1 && (mode == BitmapColorMode.POLY1TR || mode == BitmapColorMode.POLY2))
               throw new Error("The color mode cannot be changed");
            break;
         case BitmapColorMode.POLY1TR:
         case BitmapColorMode.POLY2:
            break;
       }
       this.colorMode = mode;
    }

    asBitmap(): Bitmap {
       return this.data.convertDataToBitmap(this.colorTable);
    }

    invertBits(): void {
       if(this.data != null) {
          this.data.invertBits();
       }
    }
}