import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { PixMap } from "./GeneralDataBlocks/PixMap";
import { BinReaderWriter } from "../Utils/BinReaderWriter";
import { Bit } from "../Utils/Bit";
import { MultiText } from "./GeneralDataBlocks/Multitext";
import { BinaryColor } from "./GeneralDataBlocks/BinaryColor";
import { Bitmap } from "../Utils/Bitmap";
import { Text } from "./GeneralDataBlocks/Text";
import { Color } from "../Utils/Color";
import { ColorPallet } from "../ColorPallets/ColorPallet";

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

export class POI extends GraphicElement{
    width: number;
    height: number;
    type: number;
    subtype: number;
    colsDay: number;
    colsNight: number;
    colorModeDay: BitmapColorMode;
    colorModeNight: BitmapColorMode;
    withNightXpm: boolean; 
    nightXPMHasData: boolean;
    withString: boolean;
    withExtendedOptions: boolean;

    constructor(type: number, subtype: number) {
        super();
        this.type = type;
        this.subtype = subtype;
        this.colsDay = 0;
        this.colsNight = 0;
        this.colorModeDay = 0;
        this.colorModeNight = 0;
        this.bitmapDay = new PixMap(16, 16, 2, BitmapColorMode.POI_ALPHA);
        this.width = this.bitmapDay != null ? this.bitmapDay.width : 0;
        this.height = this.bitmapDay != null ? this.bitmapDay.height : 0;
        this.withNightXpm = false;
        this.nightXPMHasData = true;
        this.withString = false;
        this.withExtendedOptions = false;
    }

    read(reader: BinReaderWriter): void {
        this.options = reader.readUint8();
        this.width = reader.readUint8();
        this.height = reader.readUint8();
        this.colsDay = reader.readUint8();
        this.colorModeDay = reader.readUint8();
        this.nightXPMHasData = Bit.isSet(this.options, 0);
        this.withNightXpm = Bit.isSet(this.options, 1);
        this.withString = Bit.isSet(this.options, 2);
        this.withExtendedOptions = Bit.isSet(this.options, 3);
        this.bitmapDay = new PixMap(this.width, this.height, this.colsDay, this.colorModeDay, reader);
        
        if (this.withNightXpm) {
            this.colsNight = reader.readUint8();
            this.colorModeNight = reader.readUint8();
            if (!this.nightXPMHasData) {
               let col = BinaryColor.readColorTable(reader, this.colsNight);
               this.bitmapNight = new PixMap(this.width, this.height, this.colsDay, this.colorModeDay);
               this.bitmapNight.constructor3(this.bitmapDay);
               this.bitmapNight.setNewColors(col);
            } else
               this.bitmapNight = new PixMap(this.width, this.height, this.colsNight, this.colorModeNight, reader);
         }
        if(this.withString) {
            this.text = new MultiText(reader);
        }
        else {
            this.text = new MultiText();
         }
        if (this.withExtendedOptions) {
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

    copy(iPOI: POI) {
      this.options = iPOI.options;
      this.height = iPOI.height;
      this.withExtendedOptions = iPOI.withExtendedOptions;
      this.withString = iPOI.withString;
      this.colDayColor = iPOI.colDayColor;
      this.text = iPOI.text;
      this.extOptions = iPOI.extOptions;
      this.fontType = iPOI.fontType;
      this.colsDay = iPOI.colsDay;
      this.colsNight = iPOI.colsNight;
      this.colorModeDay = iPOI.colorModeDay;
      this.colorModeNight = iPOI.colorModeNight;
      this.withString = iPOI.withString;
      this.withNightXpm = iPOI.withNightXpm;
      this.nightXPMHasData = iPOI.nightXPMHasData;
      this.width = iPOI.width;
      this.height = iPOI.height;
      if(iPOI.bitmapDay) {
         this.bitmapDay = new PixMap(iPOI.bitmapDay.width, iPOI.bitmapDay.height, iPOI.bitmapDay.colorCount, iPOI.bitmapDay.colorMode);
         this.bitmapDay.constructor3(iPOI.bitmapDay);
      }
    }

    asBitmap(dayOrNight: boolean): Bitmap {
      if(dayOrNight && this.bitmapDay != null) {
         let tmp = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
         tmp.constructor3(this.bitmapDay);

         if(tmp.colorTable.length > 0) {
            tmp.invertBits();
         }
         return tmp.asBitmap();
      }
      if (!dayOrNight && this.bitmapNight != null) {
         let tmp = new PixMap(this.bitmapNight.width, this.bitmapNight.height, this.bitmapNight.colorCount, this.bitmapNight.colorMode);
         tmp.constructor3(this.bitmapNight);
         if (tmp.colorTable.length > 0)
            tmp.invertBits();
         return tmp.asBitmap();
      }
      if(!dayOrNight && this.bitmapDay != null) {
         let tmp = new PixMap(this.bitmapDay.width, this.bitmapDay.height, this.bitmapDay.colorCount, this.bitmapDay.colorMode);
         tmp.constructor3(this.bitmapDay);

         if(tmp.colorTable.length > 0) {
            tmp.invertBits();
         }
         const newBitmap: Bitmap = tmp.asBitmap();
         newBitmap.inverseColors();
         return newBitmap;
      }
      return new Bitmap(this.width, this.height);
   }

   createNightBitmap(numOfColors: number): void {
      if(this.bitmapDay) {
         this.bitmapNight = new PixMap(this.bitmapDay.width, this.bitmapDay.height, numOfColors, this.bitmapDay.colorMode);
         this.withNightXpm = true;
         this.options |= (1 << 0); 
         this.options |= (1 << 1);  
      }
   }

   write(writer: BinReaderWriter, codepage: number): void {
      writer.writeUint8(this.options);
      this.bitmapDay?.writeAsPoi(writer);
      if (this.withNightXpm)
         this.bitmapNight?.writeAsPoiNight(writer);
      if (this.withString)
         this.text.write(writer, codepage);
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

   createNew(newText: Text, newWidth: number, newHeight: number): void {
      this.options = 5;
      this.width = newWidth;
      this.height = newHeight;
      this.text = new MultiText();
      this.text.set(newText);
      this.withString = true;
      this.colsDay = 1;
      this.colorModeDay = BitmapColorMode.POI_TR;

      this.bitmapDay = new PixMap(this.width, this.height, this.colsDay, this.colorModeDay);
      this.bitmapDay.colorTable.push(new Color(255,255,255,255));
      this.bitmapDay.fillWithDummyData();
   }

   setExtendetOptions(hasExtendedOptions: boolean): void {
      if(hasExtendedOptions) {
         this.withExtendedOptions = true;
         this.options = Bit.set(this.options, 1, 3); 
      }
      else {
         this.withExtendedOptions = false;
         this.options = Bit.set(this.options, 0, 3); 
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
   }
}