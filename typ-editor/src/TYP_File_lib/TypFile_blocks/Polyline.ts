import { BinReaderWriter } from "../Utils/BinReaderWriter";
import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { BinaryColor } from "./GeneralDataBlocks/BinaryColor";
import { Bit } from "../Utils/Bit";
import { MultiText } from "./GeneralDataBlocks/Multitext";
import { PixMap } from "./GeneralDataBlocks/PixMap";
import { Color } from "../Utils/Color";
import { Bitmap } from "../Utils/Bitmap";
import { buildMapFromSet } from "@angular/flex-layout/extended/typings/style/style-transforms";
import { Text } from "./GeneralDataBlocks/Text";
import { ColorPallet } from "../ColorPallets/ColorPallet";

enum PolylineType {
    Day2 = 0,
    Day2_Night2 = 1,
    Day1_Night2 = 3,
    NoBorder_Day2_Night1 = 5,
    NoBorder_Day1 = 6,
    NoBorder_Day1_Night1 = 7
 };

 enum Fontdata {
   Default = 0x0,
   Nolabel = 0x1,
   Small = 0x2,
   Normal = 0x3,
   Large = 0x4
}

enum FontColours {
   No = 0x0,
   Day = 0x8,
   Night = 0x10,
   DayAndNight = 0x18
}

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

export class Polyline extends GraphicElement{
    type: number;
    subtype: number;
    options2: number;
    withExtOptions: boolean;
    withString: boolean;
    innerWidth: number;
    borderWidth: number;
    polylineType: PolylineType;
    bitmapHeight: number;
    width: number;
    height: number;

    constructor(type: number, subtype: number) {
        super();
        this.type = type;
        this.subtype = subtype;
        this.options2 = 0;
        this.innerWidth = 1;
        this.borderWidth = 0;
        this.polylineType = 0;
        this.bitmapHeight = 0;
        this.width = 32;
        this.height = 0;
        this.withExtOptions = false;
        this.withString = false;
    }

    read(reader: BinReaderWriter): void {
        this.options = reader.readUint8();
        this.options2 = reader.readUint8();
        this.polylineType = this.options & 0x7;
        this.bitmapHeight = this.options >> 3;
        this.height = this.bitmapHeight > 0 ? this.bitmapHeight : this.innerWidth + 2 * this.borderWidth;
        this.withExtOptions = Bit.isSet(this.options2, 2);
        this.withString = Bit.isSet(this.options2, 0);

        switch(this.polylineType) {
            case PolylineType.Day2:
                this.colDayColor = BinaryColor.readColorTable(reader, 2);
                break;

             case PolylineType.Day2_Night2:
                this.colDayColor = BinaryColor.readColorTable(reader, 2);
                this.colNightColor = BinaryColor.readColorTable(reader, 2);
                break;

             case PolylineType.Day1_Night2:
                this.colDayColor.push(BinaryColor.readColor(reader));
                this.colNightColor = BinaryColor.readColorTable(reader, 2);
                break;

             case PolylineType.NoBorder_Day2_Night1:
                this.colDayColor = BinaryColor.readColorTable(reader, 2);
                this.colNightColor.push(BinaryColor.readColor(reader));
                break;

             case PolylineType.NoBorder_Day1:
                this.colDayColor.push(BinaryColor.readColor(reader));
                break;

             case PolylineType.NoBorder_Day1_Night1:
                this.colDayColor.push(BinaryColor.readColor(reader));
                this.colNightColor.push(BinaryColor.readColor(reader));
                break;
        }
        //urceni sirky cary a ohraniceni
        if(this.bitmapHeight == 0) {
           switch(this.polylineType) {
             case PolylineType.Day2:
             case PolylineType.Day2_Night2:
             case PolylineType.Day1_Night2:
               this.innerWidth = reader.readUint8();
               if(this.innerWidth > 0) {
                  this.borderWidth = (reader.readUint8() - this.innerWidth) / 2;
               }
               break;
               
             case PolylineType.NoBorder_Day2_Night1:
             case PolylineType.NoBorder_Day1:
             case PolylineType.NoBorder_Day1_Night1:
               this.innerWidth = reader.readUint8();
               break;
           }
        } else {
           let color: Array<Color> = new Array();
           //color.push(new Color(255,255,255));
           color = this.colDayColor;
           this.bitmapDay = new PixMap(32, this.bitmapHeight, color.length, 0xfffe);
           this.bitmapDay.constructor2(color, reader);
        }
        if(this.withString) {
           this.text = new MultiText(reader);
        }
        else {
           this.text = new MultiText();
        }
        
        if(this.withExtOptions) {
           this.extOptions = reader.readUint8();
           this.fontColType = this.extOptions & 0x18;
           this.fontType = this.extOptions & 0x7;
           switch (this.fontColType) {
            case FontColours.Day:
               this.colFontColour.push(BinaryColor.readColor(reader));
               break;
            case FontColours.Night:
               this.colFontColour.push(BinaryColor.readColor(reader));
               break;
            case FontColours.DayAndNight:
               this.colFontColour = BinaryColor.readColorTable(reader, 2);
               break;
           }
        }
    }
    copy(iPolyline: Polyline) {
      this.options = iPolyline.options;
      this.options2 = iPolyline.options2;
      this.polylineType = iPolyline.polylineType;
      this.bitmapHeight = iPolyline.bitmapHeight;
      this.height = iPolyline.height;
      this.withExtOptions = iPolyline.withExtOptions;
      this.withString = iPolyline.withString;
      this.colDayColor = iPolyline.colDayColor;
      this.text = iPolyline.text;
      //this.bitmapDay = iPolyline.bitmapDay;
      this.extOptions = iPolyline.extOptions;
      this.fontType = iPolyline.fontType;
      this.withString = iPolyline.withString;
      this.borderWidth = iPolyline.borderWidth;
      this.innerWidth = iPolyline.innerWidth;
      if(iPolyline.bitmapDay) {
         this.bitmapDay = new PixMap(iPolyline.bitmapDay.width, iPolyline.bitmapDay.height, iPolyline.bitmapDay.colorCount, iPolyline.bitmapDay.colorMode);
         this.bitmapDay.constructor3(iPolyline.bitmapDay);
      }
    }

    asBitmap(dayOrNightBMP: boolean): Bitmap {
       let bmp = new Bitmap(this.width, this.height);
       
       if(this.bitmapDay != null) {
          let tmp = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
          tmp.constructor3(this.bitmapDay);

          if(dayOrNightBMP) {
            switch (this.polylineType) {
               case PolylineType.Day2:
               case PolylineType.Day2_Night2:
               case PolylineType.NoBorder_Day2_Night1:
                  tmp.setNewColors(this.colDayColor);
                  break;
   
               case PolylineType.Day1_Night2:
               case PolylineType.NoBorder_Day1:
               case PolylineType.NoBorder_Day1_Night1:
                  tmp.setNewColor(0, this.colDayColor[0]);
                  break;
            }
          } else {
            switch (this.polylineType) {
               case PolylineType.Day2:
                  tmp.setNewColors(this.colDayColor);
                  break;
               case PolylineType.NoBorder_Day1:
                  tmp.setNewColor(0, this.colDayColor[0]);
                  break;

               case PolylineType.Day1_Night2:
               case PolylineType.Day2_Night2:
                  tmp.setNewColors(this.colNightColor);
                  break;

               case PolylineType.NoBorder_Day2_Night1:
               case PolylineType.NoBorder_Day1_Night1:
                  tmp.setNewColor(0, this.colNightColor[0]);
                  break;
            }
          }
          if (tmp != null) {
            bmp = tmp.asBitmap();
            if(!dayOrNightBMP && (this.polylineType == PolylineType.Day2 || 
               this.polylineType == PolylineType.NoBorder_Day1) ) {
               bmp.inverseColors();
            }
          }
               
       } else {
         bmp = new Bitmap(32, (this.innerWidth + 2 * this.borderWidth));
         for (let y = 0; y < bmp.height; y++) {
            let bBorder = y < this.borderWidth || y >= (this.innerWidth + this.borderWidth);
            let col = new Color();
            if (dayOrNightBMP) {
               col = bBorder ? this.colDayColor[1] : this.colDayColor[0];
            }     
            else {
               if(this.colNightColor[0]) {
                  col = bBorder ? this.colNightColor[1] : this.colNightColor[0];
               }
               else {
                  //col = new Color(255,255,255,255);
                  col = bBorder ? this.colDayColor[1] : this.colDayColor[0];
               }
            }
            for (let x = 0; x < bmp.width; x++) {
               bmp.setPixel(x, y, col);
            }    
       }
       if(!dayOrNightBMP) {
         bmp.inverseColors();
      }
    }
    return bmp;
   }

   write(writer: BinReaderWriter, codepage: number): void {
      writer.writeUint8(this.options);
      writer.writeUint8(this.options2);
      switch (this.polylineType) {
         case PolylineType.Day2:
            BinaryColor.writeColorTable(writer, this.colDayColor);
            break;

         case PolylineType.Day2_Night2:
            BinaryColor.writeColorTable(writer, this.colDayColor);
            BinaryColor.writeColorTable(writer, this.colNightColor);
            break;

         case PolylineType.Day1_Night2:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            BinaryColor.writeColorTable(writer, this.colNightColor);
            break;

         case PolylineType.NoBorder_Day2_Night1:
            BinaryColor.writeColorTable(writer, this.colDayColor);
            BinaryColor.writeColor(writer, this.colNightColor[0]);
            break;

         case PolylineType.NoBorder_Day1:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            break;

         case PolylineType.NoBorder_Day1_Night1:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            BinaryColor.writeColor(writer, this.colNightColor[0]);
            break;
      }

      if (this.bitmapHeight == 0) { 
         switch (this.polylineType) {
            case PolylineType.Day2:
            case PolylineType.Day2_Night2:
            case PolylineType.Day1_Night2:
               writer.writeUint8(this.innerWidth);
               if (this.innerWidth > 0)
                  writer.writeUint8(2 * this.borderWidth + this.innerWidth);
               break;

            case PolylineType.NoBorder_Day2_Night1:
            case PolylineType.NoBorder_Day1:
            case PolylineType.NoBorder_Day1_Night1:
               writer.writeUint8(this.innerWidth);
               break;
         }
      } else
         this.bitmapDay?.writeRawData(writer);

      if (this.withString)
         this.text.write(writer, codepage);

      if (this.withExtOptions) {   
         writer.writeUint8(this.extOptions);
         switch (this.fontColType) {
            case FontColours.Day:
               BinaryColor.writeColor(writer, this.colFontColour[0]);
               break;
            case FontColours.Night:
               BinaryColor.writeColor(writer, this.colFontColour[1]);
               break;
            case FontColours.DayAndNight:
               BinaryColor.writeColorTable(writer, this.colFontColour);
               break;
         }
      }
   }

   setPolylineType(): void {
      if(this.bitmapDay) {
         switch(this.bitmapDay.colorTable.length) {
            case 1:
               //this.options = 0xFF & ((this.options & 0xF8) | PolylineType.NoBorder_Day1);
               this.polylineType =  PolylineType.NoBorder_Day1;
               if(this.bitmapNight) {
                  this.polylineType =  PolylineType.NoBorder_Day1_Night1;
               }
               break;
            case 2:
               //this.options = 0xFF & ((this.options & 0xF8) | PolylineType.Day2);
               this.polylineType =  PolylineType.Day2;
               if(this.bitmapNight) {
                  this.polylineType =  PolylineType.Day2_Night2
               }
               break;
         }
      }
      this.options = 0xFF & ((this.options & 0xF8) | this.polylineType);
      //bitmap height
      this.options = 0xFF & ((this.bitmapHeight << 3) | (this.options & 0x7));
   }

   createBitmap(dayOrNight: boolean) {
      if(this.bitmapHeight == 0) {
         this.bitmapHeight = this.innerWidth + 2 * this.borderWidth;
      }
      this.options = 0xFF & ((this.options & 0x7) | this.bitmapHeight << 3);
      if (dayOrNight) {
         if(this.colDayColor.length > 1) {
            this.bitmapDay = this.getDummyXPixMap(BitmapColorMode.POLY2, true); 
         }
         else {
            this.bitmapDay = this.getDummyXPixMap(BitmapColorMode.POLY1TR, true); 
         }
      } else {
         if(this.colNightColor.length > 1) {
            this.bitmapNight = this.getDummyXPixMap(BitmapColorMode.POLY2, false);
         }
         else {
            this.bitmapNight = this.getDummyXPixMap(BitmapColorMode.POLY1TR, false); 
         }
      }
   }

   getDummyXPixMap(bcm: BitmapColorMode, dayOrNight: boolean): PixMap {
      if(this.bitmapHeight == 0) {
         this.bitmapHeight = this.innerWidth + 2 * this.borderWidth;
      }
      let pic = new PixMap(32, /*(this.innerWidth + 2 * this.borderWidth)*/ this.bitmapHeight, 2, bcm);
      if (dayOrNight) {
         pic.setNewColor(0, this.colDayColor[0]);
         if (bcm == BitmapColorMode.POLY2) {
            pic.setNewColor(1, this.colDayColor[1]);
         } 
      } else {
         pic.setNewColor(0, this.colNightColor[0]);
         if (bcm == BitmapColorMode.POLY2) {
            pic.setNewColor(1, this.colNightColor[1]);
         } 
      }

      return pic;
   }

   createNew(newText: Text, newHeight: number): void {
      this.options = 0;
      this.options2 = 1;
      this.width = 32;
      this.height = newHeight;
      this.innerWidth = newHeight;
      this.text = new MultiText();
      this.text.set(newText);
      this.withString = true;
      this.polylineType = 6;

      this.options = 0xFF & ((this.options & 0xF8) | this.polylineType);

      this.colDayColor.push(new Color(255, 255, 255, 255));
   }

   setExtendetOptions(hasExtendedOptions: boolean): void {
      if(hasExtendedOptions) {
         this.withExtOptions = true;
         this.options2 = Bit.set(this.options2, 1, 2); 
      }
      else {
         this.withExtOptions = false;
         this.options2 = Bit.set(this.options2, 0, 2); 
      }
   }

   applyColorPalette(palette: ColorPallet): void {
      const bm: Bitmap = new Bitmap(0,0);
      if(this.bitmapDay) {
         this.bitmapDay.colorTable = bm.getPaletteColors(palette, this.bitmapDay.colorTable);
         if(this.bitmapNight) {
            this.bitmapNight.colorTable = bm.getPaletteColors(palette, this.bitmapNight.colorTable);
         }
      }
      else {
         this.colDayColor = bm.getPaletteColors(palette, this.colDayColor);
         if(this.polylineType == PolylineType.Day2_Night2 || 
            this.polylineType == PolylineType.Day1_Night2 || 
            this.polylineType == PolylineType.NoBorder_Day2_Night1 ||
            this.polylineType == PolylineType.NoBorder_Day1_Night1) {
            this.colNightColor = bm.getPaletteColors(palette, this.colNightColor);
         }
      }
   }
}