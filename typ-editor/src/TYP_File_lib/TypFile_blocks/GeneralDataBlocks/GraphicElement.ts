import { Color } from "src/TYP_File_lib/Utils/Color";
import { PixMap } from "./PixMap";
import { MultiText } from "./Multitext";
import { Bitmap } from "src/TYP_File_lib/Utils/Bitmap";

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

export class GraphicElement {
    type: number;
    subtype: number;
    colDayColor: Array<Color>;
    colNightColor: Array<Color>;
    colFontColour: Array<Color>;
    options: number;
    extOptions: number;
    text: MultiText ;
    bitmapDay: PixMap | null;
    bitmapNight: PixMap | null;
    fontColType: FontColours;
    fontType: Fontdata;

    constructor() {
        this.type = 0;
        this.subtype = 0;
        this.colDayColor = new Array();
        this.colNightColor = new Array();
        this.colFontColour= new Array();
        this.options = 0;
        this.extOptions = 0;
        this.text = {} as MultiText;
        this.bitmapDay = null;
        this.bitmapNight = null;
        this.fontColType = 0;
        this.fontType = 0;
    }

    setDayColor1(color: Color): void {
        this.colDayColor[0] = color;
        if(this.bitmapDay) {
            this.bitmapDay.setNewColor(0, color);
        }
    }

    setDayColor2(color: Color): void {
        this.colDayColor[0] = color;
        if(this.bitmapDay && this.bitmapDay.colorTable.length > 1) {
            this.bitmapDay.setNewColor(1, color);
        }
    }

    setNightColor1(color: Color): void {
        this.colNightColor[0] = color;
        if(this.bitmapNight) {
            this.bitmapNight.setNewColor(0, color);
        }
    }

    setNightColor2(color: Color): void {
        this.colNightColor[0] = color;
        if(this.bitmapNight && this.bitmapNight.colorTable.length > 1) {
            this.bitmapNight.setNewColor(1, color);
        }
    }

    asBitmap(dayOrNightBMP: boolean): Bitmap {
        return new Bitmap(0,0);
    }
}