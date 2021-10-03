import { DataBlock } from './GeneralDataBlocks/dataBlock';
import { DataBlockWithSize } from './GeneralDataBlocks/dataBlockWithSize';
import { BinReader } from '../Utils/BinReaderWriter';

export class Header {
    reader: BinReader;

    headerLen!: number;
    unknown_0x01!: number;
    garminTYPSignature!: string;
    unknown_0x0C!: number;
    unknown_0x0D!: number;

    creationDate!: Date;
    Codepage!: number;

    POIDataBlock!: DataBlock;
    PolylineDataBlock!: DataBlock;
    PolygoneDataBlock!: DataBlock;

    familyID!: number;
    productCode!: number;

    POITableBlock!: DataBlockWithSize;
    PolylineTableBlock!: DataBlockWithSize;
    PolygoneTableBlock!:  DataBlockWithSize;
    PolygoneDraworderTableBlock!:  DataBlockWithSize;
    ExtraPOITableBlock!:  DataBlockWithSize;

    NT_unknown_0x65!: number;
    NT_POIDataBlock!: DataBlock;

    NT_unknown_0x6E!: number;
    NT_PointLabelblock!: DataBlock;       
    NT_unknown_0x7A!: number;
    NT_unknown_0x7E!: number; 
    NT_LabelblockTable1!: DataBlock;
    NT_unknown_0x8A!: number; 
    NT_unknown_0x8E!: number;
    NT_LabelblockTable2!: DataBlock;
    NT_unknown_0x9A!: number;

    constructor(view: DataView) {
        this.reader = new BinReader(view);
        this.read(view);
    }

    read(view: DataView): void {
        this.headerLen = this.reader.readUint8();
        this.unknown_0x01 = this.reader.readUint8();
        this.garminTYPSignature = this.reader.readString(10);
        this.unknown_0x0C = this.reader.readUint8();
        this.unknown_0x0D = this.reader.readUint8();

        this.creationDate = new Date(this.reader.readUint16(),
                    this.reader.readUint8(), 
                    this.reader.readUint8(), 
                    this.reader.readUint8(), 
                    this.reader.readUint8(), 
                    this.reader.readUint8());
        this.Codepage = this.reader.readUint16();

        this.POIDataBlock = new DataBlock(this.reader);
        this.PolylineDataBlock = new DataBlock(this.reader);
        this.PolygoneDataBlock = new DataBlock(this.reader);

        this.familyID = this.reader.readUint16();
        this.productCode = this.reader.readUint16();  
        
        this.POITableBlock = new DataBlockWithSize(this.reader);
        
        this.PolylineTableBlock = new DataBlockWithSize(this.reader);

        this.PolygoneTableBlock = new DataBlockWithSize(this.reader);
        
        this.PolygoneDraworderTableBlock = new DataBlockWithSize(this.reader);

        //Mozna nejake data z NT
        if (this.headerLen > 0x5B){
            this.readHeader_6E(view);

            //Extra POI labely
            if (this.headerLen > 0x6E){
                this.readHeader_9C(view);

                //Indexovani POIs
                if (this.headerLen > 0x9C) {

                    //Active routing
                    if (this.headerLen > 0xA4) {

                    }
                }
            }
        }
    }

    readHeader_6E(view: DataView): void {
        this.ExtraPOITableBlock = new DataBlockWithSize(this.reader);

        this.NT_unknown_0x65 = this.reader.readUint8();
        this.NT_POIDataBlock = new DataBlock(this.reader);
    }

    readHeader_9C(view: DataView): void {
        this.NT_unknown_0x6E = this.reader.readUint32();
        this.NT_PointLabelblock = new DataBlock(this.reader); 
        this.NT_unknown_0x7A = this.reader.readUint32();
        this.NT_unknown_0x7E = this.reader.readUint32();
        this.NT_LabelblockTable1 = new DataBlock(this.reader);
        this.NT_unknown_0x8A = this.reader.readUint32(); 
        this.NT_unknown_0x8E = this.reader.readUint32();
        this.NT_LabelblockTable2 = new DataBlock(this.reader); 
        this.NT_unknown_0x9A = this.reader.readUint16();
    }
}