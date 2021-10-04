import { Color } from "src/TYP_File_lib/Utils/Color";
import { PixMap } from "./PixMap";
import { MultiText } from "./Multitext";

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
    text: MultiText | null;
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
        this.text = null;
        this.bitmapDay = null;
        this.bitmapNight = null;
        this.fontColType = 0;
        this.fontType = 0;
    }
}