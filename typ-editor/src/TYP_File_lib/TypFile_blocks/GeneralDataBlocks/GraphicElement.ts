import { Color } from "src/TYP_File_lib/Utils/Color";
import { PixMap } from "./PixMap";
import { MultiText } from "./Multitext";

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
    }
}