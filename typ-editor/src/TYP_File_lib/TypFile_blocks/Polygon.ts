import { BinReaderWriter } from "../Utils/BinReaderWriter";
import { Bit } from "../Utils/Bit";
import { Bitmap } from "../Utils/Bitmap";
import { Color } from "../Utils/Color";
import { BinaryColor } from "./GeneralDataBlocks/BinaryColor";
import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { MultiText } from "./GeneralDataBlocks/Multitext";
import { PixMap } from "./GeneralDataBlocks/PixMap";

enum ColorType {
    /// <summary>
    /// 1 solid colour
    /// </summary>
    Day1 = 0x6,
    /// <summary>
    /// 1 solid daycolour / 1 solid nightcolour
    /// </summary>
    Day1_Night1 = 0x7,
    /// <summary>
    /// 2 colour bitmap
    /// </summary>
    BM_Day2 = 0x8,
    /// <summary>
    /// 2 solid daycolours / 2 solid nightcolours
    /// </summary>
    BM_Day2_Night2 = 0x9,
    /// <summary>
    /// 1 solid daycolour + 1 transparent colour / 2 solid nightcolours
    /// </summary>
    BM_Day1_Night2 = 0xB,
    /// <summary>
    /// 2 colour bitmap / 1 solid nightcolour + 1 transparent colour
    /// </summary>
    BM_Day2_Night1 = 0xD,
    /// <summary>
    /// 1 colour 1 transparent colour bitmap
    /// </summary>
    BM_Day1 = 0xE,
    /// <summary>
    /// 1 solid daycolour + 1 transparent colour / 1 solid nightcolour + 1 transparent colour
    /// </summary>
    BM_Day1_Night1 = 0xF
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

 enum FontColours {
   No = 0x0,
   Day = 0x8,
   Night = 0x10,
   DayAndNight = 0x18
}

export class Polygon extends GraphicElement{
    drawOrder: number;
    withString: boolean;
    withExtendedOptions: boolean;
    colorType: ColorType;
    width: number;
    height: number;
    //withDayBitmap: boolean;
    withNightBitmap: boolean;

    constructor(type: number, subtype: number) {
        super();
        this.type = type;
        this.subtype = subtype;
        this.drawOrder = 1;
        this.colorType = ColorType.Day1;
        this.withString = false;
        this.withExtendedOptions = false;
        this.width = 32;
        this.height = 32;
        //this.withDayBitmap = false;
        this.withNightBitmap = false;
    }

    read(reader: BinReaderWriter): void {
        this.options = reader.readUint8();
        this.withString = Bit.isSet(this.options, 4);
        this.withExtendedOptions = Bit.isSet(this.options, 5);
        this.colorType = this.options & 0x0F;

        // Následuje 1 až max. 4 barvy a případně 1 bitmapa
        switch (this.colorType) {  
            case ColorType.Day1:
               this.colDayColor.push(BinaryColor.readColor(reader));
               break;

            case ColorType.Day1_Night1:
                this.colDayColor.push(BinaryColor.readColor(reader));
                this.colNightColor.push(BinaryColor.readColor(reader));
               break;

            case ColorType.BM_Day2:           // 2 colors + 1x pixel data
               this.colDayColor = BinaryColor.readColorTable(reader, 2);
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length, BitmapColorMode.POLY2);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               break;

            case ColorType.BM_Day2_Night2:    // 4 colors + 1x pixel data
               this.colDayColor = BinaryColor.readColorTable(reader, 2);
               this.colNightColor = BinaryColor.readColorTable(reader, 2);
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length, BitmapColorMode.POLY2);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               this.bitmapNight = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
               this.bitmapNight.constructor3(this.bitmapDay);
               this.bitmapNight.setNewColors(this.colNightColor);
               break;

            case ColorType.BM_Day1_Night2:    // 3 colors + 1x pixel data
               this.colDayColor.push(BinaryColor.readColor(reader));
               this.colDayColor.push(new Color(255,255,255,0));
               this.colNightColor = BinaryColor.readColorTable(reader, 2);
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length, BitmapColorMode.POLY2);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               this.bitmapNight = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
               this.bitmapNight.constructor3(this.bitmapDay);
               this.bitmapNight.changeColorMode(BitmapColorMode.POLY2);
               this.bitmapNight.setNewColors(this.colNightColor);
               break;

            case ColorType.BM_Day2_Night1:    // 3 colors + 1x pixel data
               this.colDayColor = BinaryColor.readColorTable(reader, 2);
               this.colNightColor.push(BinaryColor.readColor(reader));
               this.colNightColor.push(new Color(255,255,255,0));
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length, BitmapColorMode.POLY2);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               this.bitmapNight = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
               this.bitmapNight.constructor3(this.bitmapDay)
               this.bitmapNight.changeColorMode(BitmapColorMode.POLY1TR);
               this.bitmapNight.setNewColors(this.colNightColor);
               break;

            case ColorType.BM_Day1:           // 1 color + 1x pixel data
               let color = BinaryColor.readColor(reader);
               this.colDayColor.push(color);
               this.colNightColor.push(color);
               this.colDayColor.push(new Color(255,255,255,0));
               this.colNightColor.push(new Color(255,255,255,0));
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length , BitmapColorMode.POLY1TR);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               break;

            case ColorType.BM_Day1_Night1:    // 2 colors + 1x pixel data
               this.colDayColor.push(BinaryColor.readColor(reader));
               this.colDayColor.push(new Color(255,255,255,0));
               this.colNightColor.push(BinaryColor.readColor(reader));
               this.colNightColor.push(new Color(255,255,255,0));
               this.bitmapDay = new PixMap(32, 32, this.colDayColor.length, BitmapColorMode.POLY1TR);
               this.bitmapDay.constructor2(this.colDayColor, reader);
               this.bitmapNight = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
               this.bitmapNight.constructor3(this.bitmapDay)
               this.bitmapNight.setNewColors(this.colNightColor);
               break;
         }

         if (this.bitmapDay) {
            this.setDayColor1(this.bitmapDay.getColor(0));

            if (this.bitmapDay.colorTable.length > 1)
               this.setDayColor2(this.bitmapDay.getColor(1));

            if (this.bitmapNight) {
               this.setNightColor1(this.bitmapNight.getColor(0));
               if (this.bitmapNight.colorTable.length > 1)
               this.setNightColor2(this.bitmapNight.getColor(1));
            }
         }

         if (this.withString) {
            this.text = new MultiText(reader);
         }
         else {
            this.text = new MultiText();
         }

         if (this.withExtendedOptions) {    
            this.extOptions = reader.readUint8();
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

    copy(iPolygone: Polygon) {
      this.options = iPolygone.options;
      this.width = iPolygone.width;
      this.height = iPolygone.height;
      this.withString = iPolygone.withString;
      this.colDayColor = iPolygone.colDayColor;
      this.colNightColor = iPolygone.colNightColor;
      this.text = iPolygone.text;
      //this.bitmapDay = iPolygone.bitmapDay;
      this.extOptions = iPolygone.extOptions;
      this.fontType = iPolygone.fontType;
      this.withString = iPolygone.withString;
      this.colorType = iPolygone.colorType;
      this.drawOrder = iPolygone.drawOrder;
      this.withExtendedOptions = iPolygone.withExtendedOptions;
     if(iPolygone.bitmapDay) {
         this.bitmapDay = new PixMap(iPolygone.bitmapDay.width, iPolygone.bitmapDay.height, iPolygone.bitmapDay.colorCount, iPolygone.bitmapDay.colorMode);
         this.bitmapDay.constructor3(iPolygone.bitmapDay);
      }
    }

    asBitmap(dayOrNight: boolean): Bitmap {
      if (dayOrNight) {
         if (this.bitmapDay != null) {
            return this.bitmapDay.asBitmap();
         }
         else {
            return this.getDummyXPixMap(BitmapColorMode.POLY1TR, true).asBitmap();
         }
      } else {
         if (this.bitmapNight != null) {
            return this.bitmapNight.asBitmap();
         } 
         else {
            return this.getDummyXPixMap(BitmapColorMode.POLY1TR, false).asBitmap();
         }
      }
    }

    createBitmap(dayOrNight: boolean): void {
      if (dayOrNight) {
         this.bitmapDay = this.getDummyXPixMap(BitmapColorMode.POLY2, true);  
         this.colorType = ColorType.BM_Day2;
         this.options = 24;
      } else {
         this.bitmapNight = this.getDummyXPixMap(BitmapColorMode.POLY2, false);
         this.colorType = ColorType.BM_Day2_Night2;
      }
    }

    getDummyXPixMap(bcm: BitmapColorMode, dayOrNight: boolean, old?: PixMap ): PixMap {
      if (old != null) {
         if (old.colorMode != bcm) {
            switch (old.colorMode) {
               case BitmapColorMode.POLY1TR:
                  old.changeColorMode(BitmapColorMode.POLY2);
                  old.invertBits();
                  old.setNewColors([old.getColor(0), new Color(255,255,255,255)]);      
                  break;

               case BitmapColorMode.POLY2:
                  old.changeColorMode(BitmapColorMode.POLY1TR);
                  old.invertBits();
                  old.setNewColors([old.getColor(0)]);
                  break;
            }
         }
         return old;
      }

      let pic = new PixMap(32, 32, 2, bcm);
      //pic.fillDummyData();
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

   updateColorType() {
      if(this.bitmapDay) {
         switch(this.bitmapDay.colorTable.length) {
            case 1:
               this.colorType = ColorType.BM_Day1;
               this.bitmapDay.colorMode = BitmapColorMode.POLY1TR;
               if(this.bitmapNight) {
                  switch(this.bitmapNight.colorTable.length) {
                     case 1:
                        this.colorType = ColorType.BM_Day1_Night1;
                        break;
                     case 2:
                        this.colorType = ColorType.BM_Day1_Night2;
                        break;
                  }
               }
               break;
            case 2:
               this.colorType = ColorType.BM_Day2;
               this.bitmapDay.colorMode = BitmapColorMode.POLY2;
               if(this.bitmapNight) {
                  switch(this.bitmapNight.colorTable.length) {
                     case 1:
                        this.colorType = ColorType.BM_Day2_Night1;
                        break;
                     case 2:
                        this.colorType = ColorType.BM_Day2_Night2;
                        break;
                  }
               }
               break;
         }
         this.options = 0xFF & ((this.options & 0xF0) | this.colorType);
      }
   }

   write(writer: BinReaderWriter, codePage: number): void {
      writer.writeUint8(this.options);
      switch (this.colorType) {
         case ColorType.Day1:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            break;

         case ColorType.Day1_Night1:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            BinaryColor.writeColor(writer, this.colNightColor[0]);
            break;

         case ColorType.BM_Day2:
               this.bitmapDay?.writeColorTable(writer);
               this.bitmapDay?.writeRawData(writer);
            break;

         case ColorType.BM_Day2_Night2:
               if(this.bitmapDay && this.bitmapNight) {
                  BinaryColor.writeColorTable(writer, /*this.colDayColor*/ this.bitmapDay.colorTable);
                  BinaryColor.writeColorTable(writer, /*this.colNightColor*/ this.bitmapNight.colorTable);
                  this.bitmapDay?.writeRawData(writer);
               }
            break;

         case ColorType.BM_Day1_Night2:
            BinaryColor.writeColor(writer, this.colDayColor[0]);
            BinaryColor.writeColorTable(writer, this.colNightColor);
            this.bitmapDay?.writeRawData(writer);
            break;

         case ColorType.BM_Day2_Night1:
            if(this.bitmapDay) {
               BinaryColor.writeColorTable(writer, this.bitmapDay.colorTable);
               BinaryColor.writeColor(writer, this.colNightColor[0]);
               this.bitmapDay.writeRawData(writer);  
            }
            break;

         case ColorType.BM_Day1:
            if(this.bitmapDay) { 
               BinaryColor.writeColor(writer, this.bitmapDay.colorTable[0]);
               this.bitmapDay.writeRawData(writer);
            }
            break;

         case ColorType.BM_Day1_Night1:
            // if(this.type == 4 && this.subtype == 0) {
            //    console.log(this.colDayColor);
            // }
            if(this.bitmapDay) {
               BinaryColor.writeColor(writer, this.bitmapDay.colorTable[0]);
            }
            BinaryColor.writeColor(writer, this.colNightColor[0]);
            this.bitmapDay?.writeRawData(writer);
            break;
      }
      if (this.withString)
         this.text.write(writer, codePage);
      if (this.withExtendedOptions) {    
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
}