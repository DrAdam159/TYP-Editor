import { DataBlock } from './dataBlock';
import { DataBlockWithSize } from './dataBlockWithSize';
import { readString, readUint16, readUint32 } from '../Utils/binUtils';
import { OffsetValuesHeader } from './offsetValues';

export class Header {
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
        this.read(view);
    }

    read(view: DataView): void {
        this.headerLen = view.getUint8(OffsetValuesHeader.headerLen_Offset);
        this.unknown_0x01 = view.getUint8(OffsetValuesHeader.unknown_0x01_Offset);
        this.garminTYPSignature = readString(10, view, OffsetValuesHeader.garminTYPSignature_Offset);
        this.unknown_0x0C = view.getUint8(OffsetValuesHeader.unknown_0x0C_Offset);
        this.unknown_0x0D = view.getUint8(OffsetValuesHeader.unknown_0x0D_Offset);

        this.creationDate = new Date(readUint16(OffsetValuesHeader.creationDateYear_Offset, view),
                    view.getInt8(OffsetValuesHeader.creationDateMonth_Offset), 
                    view.getInt8(OffsetValuesHeader.creationDateDay_Offset), 
                    view.getInt8(OffsetValuesHeader.creationDateHours_Offset), 
                    view.getInt8(OffsetValuesHeader.creationDateMinutes_Offset), 
                    view.getInt8(OffsetValuesHeader.creationDateSeconds_Offset));
        this.Codepage = readUint16(OffsetValuesHeader.codepage_Offset, view);

        this.POIDataBlock = new DataBlock(view, OffsetValuesHeader.POIDataBlockOffset_Offset, OffsetValuesHeader.POIDataBlockLen_Offset);
        this.PolylineDataBlock = new DataBlock(view, OffsetValuesHeader.PolylineDataBlockOffset_Offset, OffsetValuesHeader.PolylineDataBlockLen_Offset);
        this.PolygoneDataBlock = new DataBlock(view, OffsetValuesHeader.PolygoneDataBlockOffset_Offset, OffsetValuesHeader.PolygoneDataBlockLen_Offset);

        this.familyID = readUint16(OffsetValuesHeader.familyID_Offset, view);
        this.productCode = readUint16(OffsetValuesHeader.productCode_Offset, view);  
        
        this.POITableBlock = new DataBlockWithSize(view, 
                            OffsetValuesHeader.POITableBlockOffset_Offset, 
                            OffsetValuesHeader.POITableBlockLen_Offset,
                            OffsetValuesHeader.POITableBlockSize_Offset);
        
        this.PolylineTableBlock = new DataBlockWithSize(view, 
                            OffsetValuesHeader.PolylineTableBlockOffset_Offset, 
                            OffsetValuesHeader.PolylineTableBlockLen_Offset,
                            OffsetValuesHeader.PolylineTableBlockSize_Offset);

        this.PolygoneTableBlock = new DataBlockWithSize(view, 
                            OffsetValuesHeader.PolygoneTableBlockOffset_Offset, 
                            OffsetValuesHeader.PolygoneTableBlockLen_Offset,
                            OffsetValuesHeader.PolygoneTableBlockSize_Offset);
        
        this.PolygoneDraworderTableBlock = new DataBlockWithSize(view, 
                            OffsetValuesHeader.PolygoneDraworderTableBlockOffset_Offset, 
                            OffsetValuesHeader.PolygoneDraworderTableBlockLen_Offset,
                            OffsetValuesHeader.PolygoneDraworderTableBlockSize_Offset);

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
        this.ExtraPOITableBlock = new DataBlockWithSize(view, 
        OffsetValuesHeader.ExtraPOITableBlockOffset_Offset, 
        OffsetValuesHeader.ExtraPOITableBlockLen_Offset,
        OffsetValuesHeader.ExtraPOITableBlockSize_Offset);

        this.NT_unknown_0x65 = view.getInt8(OffsetValuesHeader.NT_unknown_0x65_Offset);
        this.NT_POIDataBlock = new DataBlock(view, 
                        OffsetValuesHeader.NT_POIDataBlockOffset_Offset, 
                        OffsetValuesHeader.NT_POIDataBlockLen_Offset);
    }

    readHeader_9C(view: DataView): void {
        this.NT_unknown_0x6E = readUint32(OffsetValuesHeader.NT_unknown_0x6E_Offset, view);
        this.NT_PointLabelblock = new DataBlock(view, 
                            OffsetValuesHeader.NT_PointLabelblockOffset_Offset, 
                            OffsetValuesHeader.NT_PointLabelblockLen_Offset); 
        this.NT_unknown_0x7A = readUint32(OffsetValuesHeader.NT_unknown_0x7A_Offset, view);
        this.NT_unknown_0x7E = readUint32(OffsetValuesHeader. NT_unknown_0x7E_Offset, view);
        this.NT_LabelblockTable1 = new DataBlock(view,
                             OffsetValuesHeader.NT_LabelblockTable1Offset_Offset, 
                             OffsetValuesHeader.NT_LabelblockTable1Len_Offset);
        this.NT_unknown_0x8A = readUint32(OffsetValuesHeader.NT_unknown_0x8A_Offset, view); 
        this.NT_unknown_0x8E = readUint32(OffsetValuesHeader.NT_unknown_0x8E_Offset, view); 
        this.NT_LabelblockTable2 = new DataBlock(view, 
                            OffsetValuesHeader.NT_LabelblockTable2Offset_Offset, 
                            OffsetValuesHeader.NT_LabelblockTable2Len_Offset); 
        this.NT_unknown_0x9A = readUint16(OffsetValuesHeader.NT_unknown_0x9A_Offset, view);
    }
}