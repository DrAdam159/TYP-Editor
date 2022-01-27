import { DataBlock } from './GeneralDataBlocks/DataBlock';
import { DataBlockWithSize } from './GeneralDataBlocks/DataBlockWithSize';
import { BinReaderWriter } from '../Utils/BinReaderWriter';
import { OffsetValuesHeader } from './GeneralDataBlocks/offsetValues';

export class Header {
    reader: BinReaderWriter;

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

    NT_unknown_0x9C!: Array<number>;
    NT_unknown_0xA4!: Array<number>;

    constructor(view: DataView) {
        this.reader = new BinReaderWriter(view);
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
                    this.NT_unknown_0x9C = this.reader.readBytes(8);

                    //Active routing
                    if (this.headerLen > 0xA4) {
                        this.NT_unknown_0xA4 = this.reader.readBytes(10);
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

    write(writer: BinReaderWriter): void {
        writer.seek(OffsetValuesHeader.headerLen_Offset);
        writer.writeUint8(this.headerLen);
        writer.writeUint8(this.unknown_0x01);
        writer.writeString(this.garminTYPSignature);
        writer.writeUint8(this.unknown_0x0C);
        writer.writeUint8(this.unknown_0x0D);
        writer.writeUint16(this.creationDate.getFullYear());
        writer.writeUint8(this.creationDate.getMonth());
        writer.writeUint8(this.creationDate.getDay());
        writer.writeUint8(this.creationDate.getHours());
        writer.writeUint8(this.creationDate.getMinutes());
        writer.writeUint8(this.creationDate.getSeconds());

        this.Codepage = 65001;
        writer.writeUint16(this.Codepage);

        this.POIDataBlock.writeDataBlock(writer);
        this.PolylineDataBlock.writeDataBlock(writer);
        this.PolygoneDataBlock.writeDataBlock(writer);

        writer.writeUint16(this.familyID);
        writer.writeUint16(this.productCode);

        this.POITableBlock.writeDataBlockWithSize(writer);
        this.PolylineTableBlock.writeDataBlockWithSize(writer);
        this.PolygoneTableBlock.writeDataBlockWithSize(writer);
        this.PolygoneDraworderTableBlock.writeDataBlockWithSize(writer);

        if (this.headerLen > 0x5b) {
            this.ExtraPOITableBlock.writeDataBlockWithSize(writer);
            writer.writeUint8(this.NT_unknown_0x65);
            this.NT_POIDataBlock.writeDataBlock(writer);

            if (this.headerLen > 0x6E) {
               writer.writeUint32(this.NT_unknown_0x6E);
               this.NT_PointLabelblock.writeDataBlock(writer);
               writer.writeUint32(this.NT_unknown_0x7A);
               writer.writeUint32(this.NT_unknown_0x7E);
               this.NT_LabelblockTable1.writeDataBlock(writer);
               writer.writeUint32(this.NT_unknown_0x8A);
               writer.writeUint32(this.NT_unknown_0x8E);
               this.NT_LabelblockTable2.writeDataBlock(writer);
               writer.writeUint32(this.NT_unknown_0x9A);
               if (this.headerLen > 0x9C) {
                 writer.writeBytes(this.NT_unknown_0x9C);
                 
                 if (this.headerLen > 0xA4) {
                    writer.writeBytes(this.NT_unknown_0xA4);
                 }
               }

            }
        }
    }
}