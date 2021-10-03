import { BinReader } from "../Utils/BinReaderWriter";
import { GraphicElement } from "./GeneralDataBlocks/GraphicElement";
import { BinaryColor } from "./GeneralDataBlocks/BinaryColor";
import { Bit } from "../Utils/Bit";
import { MultiText } from "./GeneralDataBlocks/Multitext";
import { PixMap } from "./GeneralDataBlocks/PixMap";
import { Color } from "../Utils/Color";

enum PolylineType {
    Day2 = 0,
    Day2_Night2 = 1,
    Day1_Night2 = 3,
    NoBorder_Day2_Night1 = 5,
    NoBorder_Day1 = 6,
    NoBorder_Day1_Night1 = 7
 };

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
    //sirka - konstantni
    width: number;
    //vyska (tloustka) 
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

    read(reader: BinReader): void {
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
           //console.log("new Pixmap");
           let color: Array<Color> = new Array();
           color.push(new Color(255,255,255));
           this.bitmapDay = new PixMap(32, this.bitmapHeight, color.length, 0xfffe);
           this.bitmapDay.constructor2(color, reader);
        }
        if(this.withString) {
           this.text = new MultiText(reader);
        }
        /*if(this.withExtOptions) {
           this.extOptions = reader.readUint8();

        }*/


    }
}