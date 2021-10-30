import { Header } from './TypFile_blocks/Header';
import { TableItem } from './TypFile_blocks/GeneralDataBlocks/TableItem';
import { BinReaderWriter } from './Utils/BinReaderWriter';
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
        this.decodePOIData(view);
        this.decodePolygoneData(view);
        //this.encodeAndWrite();
    }

    decodePolylineData(view: DataView): void {

        if(this.header.PolylineTableBlock.count() > 0) {
            this.PolylineTableItems = new Array();
            this.PolylineList = new Array();
            let reader = new BinReaderWriter(view);
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
            let reader = new BinReaderWriter(view);
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
            let reader = new BinReaderWriter(view);
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
                for (let j = 0; j < this.PolygonDraworderTableItems.length; j++) {
                    if (p.type == this.PolygonDraworderTableItems[j].type) 
                       for (let k = 0; k < this.PolygonDraworderTableItems[j].subTypes.length; k++)
                          if (p.subtype == this.PolygonDraworderTableItems[j].subTypes[k]) { 
                             p.drawOrder = this.PolygonDraworderTableItems[j].level;
                             j = this.PolygonDraworderTableItems.length;    
                             break;
                          }
                 }
                this.PolygonList.push(p);
            }
        }
    }

    encodeAndWrite(): Blob {
        let writer = new BinReaderWriter(new DataView(new ArrayBuffer(100000)));

        writer.seek(this.header.headerLen);
        this.encodePolygoneData(writer);
        console.log(writer.getPosition());
        this.encodePolylineData(writer);
        console.log(writer.getPosition());
        this.encodePOIData(writer);
        console.log(writer.getPosition());
        this.header.write(writer);
        console.log(writer.getPosition());
        console.log(writer.getBuffer());

        return new Blob([writer.getBuffer().buffer]);
        
    }
    
    encodePolygoneData(writer: BinReaderWriter): void {
        let table: Array<TableItem> = new Array();

        this.header.PolygoneTableBlock.recordSize = 5;
        this.header.PolygoneDataBlock.offset = writer.getPosition();

        for (const p of this.PolygonList) {
            let tableItem = new TableItem();
            tableItem.type = p.type;
            tableItem.subType = p.subtype;
            tableItem.offset = writer.getPosition() - this.header.PolygoneDataBlock.offset;
            table.push(tableItem);
            p.write(writer, this.header.Codepage); 
        }
        this.header.PolygoneDataBlock.length = writer.getPosition() - this.header.PolygoneDataBlock.offset;

        this.header.PolygoneTableBlock.offset = writer.getPosition();  
        for (let i = 0; i < table.length; i++) {
            table[i].write(writer, this.header.PolygoneTableBlock.recordSize);
        }
        this.header.PolygoneTableBlock.length = writer.getPosition() - this.header.PolygoneTableBlock.offset;

    }

    encodePolylineData(writer: BinReaderWriter): void {
        let table: Array<TableItem> = new Array();

        this.header.PolylineTableBlock.recordSize = 5;
        this.header.PolylineDataBlock.offset = writer.getPosition();

        for (const p of this.PolylineList) {
           let tableitem = new TableItem();
           tableitem.type = p.type;
           tableitem.subType = p.subtype;
           tableitem.offset = writer.getPosition() - this.header.PolylineDataBlock.offset;
           table.push(tableitem);
           p.write(writer, this.header.Codepage);
        }
        this.header.PolylineDataBlock.length = writer.getPosition() - this.header.PolylineDataBlock.offset;

        this.header.PolylineTableBlock.offset = writer.getPosition();    
        for (let i = 0; i < table.length; i++) {
            table[i].write(writer, this.header.PolylineTableBlock.recordSize);
        }
        this.header.PolylineTableBlock.length = writer.getPosition() - this.header.PolylineTableBlock.offset;
    }

    encodePOIData(writer: BinReaderWriter): void {
        let table: Array<TableItem> = new Array();

        this.header.POITableBlock.recordSize = 5;
        this.header.POIDataBlock.offset = writer.getPosition();
     
        for (const p of this.POIList) {
            let tableitem = new TableItem();
           tableitem.type = p.type;
           tableitem.subType = p.subtype;
           tableitem.offset = writer.getPosition() - this.header.POIDataBlock.offset;
           table.push(tableitem);
           p.write(writer, this.header.Codepage);
        }
        this.header.POIDataBlock.length = writer.getPosition() - this.header.POIDataBlock.offset;

        this.header.POITableBlock.offset = writer.getPosition();  
        for (let i = 0; i < table.length; i++) {
            table[i].write(writer, this.header.POITableBlock.recordSize);
        }
        this.header.POITableBlock.length = writer.getPosition() - this.header.POITableBlock.offset;
    }

    encodeDraworder(writer: BinReaderWriter) {
    //     interface KeyValuePair1 {
    //         key: number;
    //         value: number;
    //     }

    //     interface KeyValuePair2 {
    //         key: number;
    //         value: Array<KeyValuePair1>;
    //     }
        
    //     interface KeyValuePair {
    //         key: number;
    //         value: Array<KeyValuePair2>;
    //     }

    //     // list typu + list subtypu pro kazdy typ
    //     let tempDrawOrderList  = new Array<KeyValuePair>();
    //    // SortedList<uint, SortedList<uint, SortedList<uint, uint>>> draworderlist = new SortedList<uint, SortedList<uint, SortedList<uint, uint>>>();
    //     for (const p of this.PolygonList) {
    //         let typeList: Array<KeyValuePair1>
    //        //SortedList<uint, SortedList<uint, uint>> typelist;

    //        if (!tempDrawOrderList.TryGetValue(p.drawOrder, out typelist)) {
    //           typelist = new SortedList<uint, SortedList<uint, uint>>();
    //           draworderlist.Add(p.Draworder, typelist);
    //        }
    //        SortedList<uint, uint> subtypelist;
    //        if (!typelist.TryGetValue(p.Type, out subtypelist)) {
    //           subtypelist = new SortedList<uint, uint>();
    //           typelist.Add(p.Type, subtypelist);
    //        }
    //        subtypelist.Add(p.Subtype, 0);

    //     }

    //     PolygoneDraworderTableBlock.Recordsize = 5;
    //     PolygoneDraworderTableBlock.Offset = (uint)bw.Position;
    //     uint olddraworder = 0;

    //     foreach (uint draworder in draworderlist.Keys) {
    //        while (olddraworder > 0 &&
    //               draworder != olddraworder) {                  // Kennung für Erhöhung der Draworder schreiben
    //           new PolygonDraworderTableItem(0, 0).Write(bw, PolygoneDraworderTableBlock.Recordsize);
    //           olddraworder++;
    //        }
    //        olddraworder = draworder;

    //        SortedList<uint, SortedList<uint, uint>> typelist = draworderlist[draworder];
    //        foreach (uint type in typelist.Keys) {                // für jeden Typ dieser Draworder einen Tabelleneintrag erzeugen
    //           PolygonDraworderTableItem ti = new PolygonDraworderTableItem(type, draworder);
    //           // ev. vorhandene Subtypes ergänzen
    //           SortedList<uint, uint> subtypelist = typelist[type];

    //           foreach (uint subtype in subtypelist.Keys)
    //              ti.Subtypes.Add(subtype);
    //           ti.Write(bw, PolygoneDraworderTableBlock.Recordsize);
    //        }
    //     }
    //     PolygoneDraworderTableBlock.Length = (uint)bw.Position - PolygoneDraworderTableBlock.Offset;
     }
}
