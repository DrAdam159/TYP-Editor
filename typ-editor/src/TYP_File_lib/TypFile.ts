import { Header } from './TypFile_blocks/header';
import { TableItem } from './TypFile_blocks/GeneralDataBlocks/TableItem';
import { BinReader } from './Utils/BinReaderWriter';
import { Polyline } from './TypFile_blocks/Polyline';
import { POI } from './TypFile_blocks/POI';
import { PolygonDraworderTableItem } from './TypFile_blocks/GeneralDataBlocks/PolygonDraworderTableItem';
import { Polygon } from './TypFile_blocks/Polygon';

export class TypFile {

    header!: Header;

    PolylineTableItems!: Array<TableItem>;
    PolylineList!: Array<Polyline>;

    POITableItems!: Array<TableItem>;
    POIList!: Array<POI>;

    PolygonTableItems!: Array<TableItem>;
    PolygonDraworderTableItems!: Array<PolygonDraworderTableItem>;
    PolygonList!: Array<Polygon>;

    constructor(view: DataView) {
        this.header = new Header(view);
        this.decodePolylineData(view);
       //this.decodePOIData(view);
        //this.decodePolygoneData(view);
    }

    decodePolylineData(view: DataView): void {

        if(this.header.PolylineTableBlock.count() > 0) {
            this.PolylineTableItems = new Array();
            this.PolylineList = new Array();
            let reader = new BinReader(view);
            reader.seek(this.header.PolylineTableBlock.offset);

            for(let i = 0; i < this.header.PolylineTableBlock.count(); i++) {
                this.PolylineTableItems.push(new TableItem(reader, this.header.PolylineTableBlock.recordSize));
            }

            for(let i = 0; i < this.PolylineTableItems.length; i++) {
                reader.seek(this.PolylineTableItems[i].offset + this.header.PolylineDataBlock.offset);
                let p = new Polyline(this.PolylineTableItems[i].type, this.PolylineTableItems[i].subType);
                p.read(reader);
                this.PolylineList.push(p);
            }
        }
    }

    decodePOIData(view: DataView) {
        if(this.header.POITableBlock.count() > 0) {
            this.POITableItems = new Array();
            this.POIList = new Array();
            let reader = new BinReader(view);
            reader.seek(this.header.POITableBlock.offset);

            for(let i = 0; i < this.header.POITableBlock.count(); i++) {
                this.POITableItems.push(new TableItem(reader, this.header.POITableBlock.recordSize));
            }

            for(let i = 0; i < this.POITableItems.length; i++) {
                reader.seek(this.POITableItems[i].offset + this.header.POIDataBlock.offset);
                let p = new POI(this.POITableItems[i].type, this.POITableItems[i].subType);
                p.read(reader);
                this.POIList.push(p);
            }

        }
    }

    decodePolygoneData(view: DataView): void {
        if(this.header.PolygoneTableBlock.count() > 0) {
            let reader = new BinReader(view);
            this.PolygonTableItems = new Array();
            this.PolygonList = new Array();
            reader.seek(this.header.PolygoneTableBlock.offset);

            //nacteni offsetu skutecnych dat
            for(let i = 0; i < this.header.PolygoneTableBlock.count(); i++) {
                this.PolygonTableItems.push(new TableItem(reader, this.header.PolygoneTableBlock.recordSize));
            }

            //nacteni draworder informaci - dodelat
            this.PolygonDraworderTableItems = new Array();
            reader.seek(this.header.PolygoneDraworderTableBlock.offset);
            let blockLen = this.header.PolygoneDraworderTableBlock.length;
            let iLevel = 1;

            if(blockLen > 0) {
                while(blockLen >= this.header.PolygoneDraworderTableBlock.recordSize) {
                    let dro = new PolygonDraworderTableItem(reader, this.header.PolygoneDraworderTableBlock.recordSize, iLevel);
                    blockLen -= this.header.PolygoneDraworderTableBlock.recordSize;
                    this.PolygonDraworderTableItems.push(dro);

                    if (dro.type == 0) // další úroveň
                        iLevel++;
                }
            }

            for(let i = 0; i < this.PolygonTableItems.length; i++) {
                reader.seek(this.PolygonTableItems[i].offset + this.header.PolygoneDataBlock.offset);
                let p = new Polygon(this.PolygonTableItems[i].type, this.PolygonTableItems[i].subType);
                p.read(reader);
                /*for (int j = 0; j < PolygonDraworderTableItems.Count; j++) {
                    if (p.Type == PolygonDraworderTableItems[j].Type) // Haupttyp gefunden
                       for (int k = 0; k < PolygonDraworderTableItems[j].Subtypes.Count; k++)
                          if (p.Subtype == PolygonDraworderTableItems[j].Subtypes[k]) { // auch Subtyp gefunden
                             p.Draworder = PolygonDraworderTableItems[j].Level;
                             j = PolygonDraworderTableItems.Count;       // 2. Schleifenabbruch
                             break;
                          }
                 }*/
                this.PolygonList.push(p);
            }
        }
    }
      
}
