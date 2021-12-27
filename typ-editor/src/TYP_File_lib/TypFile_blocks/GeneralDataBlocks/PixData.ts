import { BinReaderWriter } from "src/TYP_File_lib/Utils/BinReaderWriter";
import { Bitmap } from "src/TYP_File_lib/Utils/Bitmap";
import { Color } from "src/TYP_File_lib/Utils/Color";

export class PixData {
    width: number;
    height: number;
    bitsPerPixel: number;
    rawIMGData: Array<number>;

    constructor(width: number, height: number, bitsPerPixel: number, reader?: BinReaderWriter) {
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

    read(reader: BinReaderWriter): void {
        this.rawIMGData = reader.readBytes(this.bytesForBitmapLine(this.width, this.bitsPerPixel) * this.height);
    }

    fillWithDummyData(): void {
       const len = this.bytesForBitmapLine(this.width, this.bitsPerPixel) * this.height;
       for(let i = 0; i < len; i++) {
          this.rawIMGData.push(0);
       }
    }

    //určuje počet bajtů požadovaných pro bitmapový řádek
    bytesForBitmapLine(width: number, bitsPerPixel: number): number {
        let bytesForLine  = width * bitsPerPixel;
        return ((bytesForLine / 8) | 0) + (bytesForLine % 8 > 0 ? 1 : 0);
    }

    //nastaveni vsech bitu na 1
    setAllBits(): void {
       if(this.rawIMGData.length == 0){
         for (let i = 0; i < this.width * this.height; i++)
         this.rawIMGData.push(0xff);
       }
        for (let i = 0; i < this.rawIMGData.length; i++)
        this.rawIMGData[i] = 0xff;
     }

     invertBits(): void {
        if(this.bitsPerPixel == 1){
            for (let i = 0; i < this.rawIMGData.length; i++)
            this.rawIMGData[i] = ~this.rawIMGData[i];
        }
     }

    convertDataToBitmap(colorTable: Array<Color>): Bitmap {
        let bmp = new Bitmap(this.width, this.height);
        let colDummy = new Color(255,255,255,0);

       // if(colorTable != null)

        if (colorTable != null && colorTable[0] != null  && colorTable.length > 0) {

            let pixel4byte = 8 / this.bitsPerPixel;
            let bytes4line = this.bytesForBitmapLine(this.width, this.bitsPerPixel);

            switch (this.bitsPerPixel) {
                case 1:
                   for (let y = 0; y < this.height; y++) {
                      let linestart = bytes4line * y;
                      for (let x = 0; x < this.width; x++) {
                         let dat = this.rawIMGData[linestart + ((x / 8) | 0)];
                         dat >>= x % 8;
                         let  idx = dat & 0x1;
                         if (colorTable.length == 1){
                           bmp.setPixel(x, y, idx == 1 ? colorTable[0] : colDummy);
                         } 
                         else
                            bmp.setPixel(x, y, idx < colorTable.length ? (idx == 1 ? colorTable[0] : colorTable[1]) : colDummy);
                      }
                   }
                   break;
                
                case 2:
                  for (let y = 0; y < this.height; y++) {
                     let linestart = bytes4line * y;
                     for (let x = 0; x < this.width; x++) {
                        let dat = this.rawIMGData[linestart + ((x / 4) | 0)];
                        let idx = 0;
                        switch (x % 4) {
                           case 0: idx = dat & 0x3; break;           // Bit 0, 1
                           case 1: idx = (dat & 0xc) >> 2; break;    // Bit 2, 3
                           case 2: idx = (dat & 0x30) >> 4; break;   // Bit 4, 5
                           case 3: idx = (dat & 0xc0) >> 6; break;   // Bit 6, 7
                        }
                        bmp.setPixel(x, y, idx < colorTable.length ? colorTable[idx] : colDummy);
                     }
                  }
                  break;

                case 4:
                  for (let y = 0; y < this.height; y++) {
                     let linestart = bytes4line * y;
                     for (let x = 0; x < this.width; x++) {
                        let dat = this.rawIMGData[linestart + ((x / 2) | 0)];
                        let idx = x % 2 == 0 ? (dat & 0xf) : (dat >> 4);
                        bmp.setPixel(x, y, idx < colorTable.length ? colorTable[idx] : colDummy);
                     }
                  }
                  break;

                case 8:
                  for (let y = 0; y < this.height; y++) {
                     let linestart = bytes4line * y;
                     for (let x = 0; x < this.width; x++) {
                        let idx = this.rawIMGData[linestart + x];
                        bmp.setPixel(x, y, idx < colorTable.length ? colorTable[idx] : colDummy);
                     }
                  }
                  break;

               default:
                  throw new Error("Incorrect number of bits / pixels. Only 1, 2, 4 and 8 are allowed.");
            }
        } else {
            switch (this.bitsPerPixel) {
                case 1:
                  for (let y = 0; y < this.height; y++)
                     for (let x = 0; x < this.width; x++)
                        bmp.setPixel(x, y, colDummy);
                  break;
                
                  case 24:
                    for (let y = 0; y < this.height; y++) {
                       for (let x = 0; x < this.width; x++) {
                          let idx = this.width * y + 3 * x;
                          let blue = this.rawIMGData[idx++];
                          let green = this.rawIMGData[idx++];
                          let red = this.rawIMGData[idx++];
                          bmp.setPixel(x, y, new Color(red, green, blue, 255));
                       }
                    }
                    break;

                  case 32:   
                     for (let y = 0; y < this.height; y++) {
                        for (let x = 0; x < this.width; x++) {
                           let idx = this.width * y + 3 * x;
                           let blue = this.rawIMGData[idx++];
                           let green = this.rawIMGData[idx++];
                           let red = this.rawIMGData[idx++];
                           let alpha = this.rawIMGData[idx++];
                           bmp.setPixel(x, y, new Color(red, green, blue, alpha));
                        }
                     }
                     break;

                  default:
                     throw new Error("Incorrect number of bits / pixels. Only 1, 24 and 32 are allowed.");
            }
        }
        return bmp;
    }

    write(writer: BinReaderWriter): void {
       writer.writeBytes(this.rawIMGData);
    }

    getColorIndex(colorTable: Array<Color>, matchColor: Color): number {
      return colorTable.findIndex(x => x.compareColors(matchColor));
    }

    convertBitmapToData(bm: Bitmap, colorTable: Array<Color>): void {
      const pixel4byte: number = (8 / this.bitsPerPixel) | 0;
      const bytes4line: number = this.bytesForBitmapLine(bm.width, this.bitsPerPixel);
      let data: Array<number> = new Array();
      let idx = 0;

      if (colorTable != null && colorTable.length > 0) {   
         switch (this.bitsPerPixel) {
            case 1:
               for (let y = 0; y < bm.height; y++) {
                  idx = y * bytes4line;
                  for (let x = 0; x < bm.width; x += 8, idx++) {
                     data[idx] = 0;
                     for (let xp = 0; xp < 8 && x + xp < bm.width; xp++) {
                        data[idx] |= 0xFF & (this.getColorIndex(colorTable, bm.getPixelColor(x + xp, y)) << xp);
                     }
                     data[idx] = 255 - data[idx] ;
                  }
               }
               break;

            case 2:
               for (let y = 0; y < bm.height; y++) {
                  idx = y * bytes4line;
                  for (let x = 0; x < bm.width; x += 4, idx++) {
                     data[idx] = 0;
                     for (let xp = 0; xp < 4 && x + xp < bm.width; xp++)
                        data[idx] |= 0xFF & (this.getColorIndex(colorTable, bm.getPixelColor(x + xp, y)) << (2 * xp));
                  }
               }
               break;

            case 4:
               for (let y = 0; y < bm.height; y++) {
                  idx = y * bytes4line;
                  for (let x = 0; x < bm.width; x += 2, idx++) {
                     data[idx] = 0;
                     for (let xp = 0; xp < 2 && x + xp < bm.width; xp++)
                        data[idx] |=  0xFF & (this.getColorIndex(colorTable, bm.getPixelColor(x + xp, y)) << (4 * xp));
                  }
               }
               break;

            case 8:
               for (let y = 0; y < bm.height; y++) {
                  idx = y * bytes4line;
                  for (let x = 0; x < bm.width; x++, idx++)
                     data[idx] = 0xFF & this.getColorIndex(colorTable, bm.getPixelColor(x, y));
               }
               break;

         }

         this.rawIMGData = data;

      } else {        
         throw new Error("No color table");
      }

    }
}