import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { PixMap } from "./GeneralDataBlocks/PixMap";
import { BinReader } from "../Utils/BinReaderWriter";
import { Bit } from "../Utils/Bit";
import { MultiText } from "./GeneralDataBlocks/Multitext";
import { BinaryColor } from "./GeneralDataBlocks/BinaryColor";
import { Bitmap } from "../Utils/Bitmap";

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

    read(reader: BinReader): void {
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
      return new Bitmap(this.width, this.height);
    }
}