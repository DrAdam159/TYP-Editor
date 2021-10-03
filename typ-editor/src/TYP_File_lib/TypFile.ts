import { Header } from './TypFile_blocks/header';
import { TableItem } from './TypFile_blocks/GeneralDataBlocks/TableItem';
import { BinReader } from './Utils/BinReaderWriter';
import { Polyline } from './TypFile_blocks/Polyline';

export class TypFile {

    header!: Header;
    PolylineTableItems!: Array<TableItem>;
    PolylineList!: Array<Polyline>;
    //PolygonTableItems!: Array<TableItem>;
    //PolygonDraworderTableItems!: Array<TableItem>;

    constructor(view: DataView) {
        this.header = new Header(view);
        this.decodePolylineData(view);
        //this.decodePolygoneData(view);
    }

    //dodelat
    /*decodePolygoneData(view: DataView): void {
        if(this.header.PolygoneTableBlock.count() > 0) {
            let reader = new BinReader(view);
            this.PolygonTableItems = new Array();
            reader.seek(this.header.PolygoneTableBlock.offset);

            //nacteni offsetu skutecnych dat
            for(let i = 0; i < this.header.PolygoneTableBlock.count(); i++) {
                this.PolygonTableItems.push(new TableItem(reader, this.header.PolygoneTableBlock.recordSize))
                //console.log("item");
            }

            //nacteni draworder informaci - dodelat
            this.PolygonDraworderTableItems = new Array();
            reader.seek(this.header.PolygoneDraworderTableBlock.offset);
            let blockLen = this.header.PolygoneDraworderTableBlock.length;
            let iLevel = 1;

            if(blockLen > 0) {
                while(blockLen >= this.header.PolygoneDraworderTableBlock.recordSize) {
                    blockLen -= this.header.PolygoneDraworderTableBlock.recordSize;
                    console.log("draworder item");
                }
            }
        }
    }*/

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
                let p = new Polyline( this.PolylineTableItems[i].type, this.PolylineTableItems[i].subType);
                p.read(reader);
                this.PolylineList.push(p);
            }
        }
    }
      
}
