import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { PixMap } from "./GeneralDataBlocks/PixMap";
import { BinReader } from "../Utils/BinReaderWriter";
import { Bit } from "../Utils/Bit";
import { MultiText } from "./GeneralDataBlocks/Multitext";

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
    }

    read(reader: BinReader): void {
        this.options = reader.readUint8();
        this.width = reader.readUint8();
        this.height = reader.readUint8();
        this.colsDay = reader.readUint8();
        this.colorModeDay = reader.readUint8();
        this.bitmapDay = new PixMap(this.width, this.height, this.colsDay, this.colorModeDay, reader);
        this.nightXPMHasData = Bit.isSet(this.options, 0);
        this.withNightXpm = Bit.isSet(this.options, 1);
        this.withString = Bit.isSet(this.options, 2);

        if(this.withNightXpm) {
            this.colsNight = reader.readUint8();
            this.colorModeNight = reader.readUint8();
            if(!this.nightXPMHasData) {
                /*Color[] col = BinaryColor.ReadColorTable(br, colsnight);
                XBitmapNight = new PixMap(XBitmapDay);
                XBitmapNight.SetNewColors(col);*/
                console.log("here");
            }
            else {
                console.log("here");
                //XBitmapNight = new PixMap(Width, Height, colsnight, ColormodeNight, br);
            }
        }
        if(this.withString) {
            this.text = new MultiText(reader);
        }
        /*if (WithExtendedOptions) {
            ExtOptions = br.ReadByte();
            switch (FontColType) {
               case FontColours.Day:
                  colFontColour[0] = BinaryColor.ReadColor(br);
                  break;
               case FontColours.Night:
                  colFontColour[1] = BinaryColor.ReadColor(br);
                  break;
               case FontColours.DayAndNight:
                  colFontColour = BinaryColor.ReadColorTable(br, 2);
                  break;
            }
         }*/
    }
}