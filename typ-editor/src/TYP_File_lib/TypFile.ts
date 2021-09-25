import { Header } from './header';
import { readString, readUint16, readUint32 } from './utils/binUtils';

enum OffsetValuesHeader {
    headerLen_Offset = 0,
    unknown_0x01_Offset = 1,
    garminTYPSignature_Offset = 2,
    unknown_0x0C_Offset = 12,
    unknown_0x0D_Offset = 13,

    creationDateYear_Offset = 14,
    creationDateMonth_Offset = 16,
    creationDateDay_Offset = 17,
    creationDateHours_Offset = 18,
    creationDateMinutes_Offset = 19,
    creationDateSeconds_Offset = 20,

    codepage_Offset = 21,
    POIDataBlockOffset_Offset = 23,
    POIDataBlockLen_Offset = 27,
    PolylineDataBlockOffset_Offset = 31,
    PolylineDataBlockLen_Offset = 35,
    PolygoneDataBlockOffset_Offset = 39,
    PolygoneDataBlockLen_Offset = 43,
    familyID_Offset = 47,
    productCode_Offset = 49,
}

export class TypFile {

    header!: Header;

    constructor() {
    }

    readHeader(view: DataView): void {
        this.header = {
            headerLen: view.getUint8(OffsetValuesHeader.headerLen_Offset),
            unknown_0x01: view.getUint8(OffsetValuesHeader.unknown_0x01_Offset),
            garminTYPSignature: readString(10, view, OffsetValuesHeader.garminTYPSignature_Offset),
            unknown_0x0C: view.getUint8(OffsetValuesHeader.unknown_0x0C_Offset),
            unknown_0x0D: view.getUint8(OffsetValuesHeader.unknown_0x0D_Offset),
            creationDate: new Date(readUint16(OffsetValuesHeader.creationDateYear_Offset, view), 
                        view.getInt8(OffsetValuesHeader.creationDateMonth_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateDay_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateHours_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateMinutes_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateSeconds_Offset)),
            Codepage: readUint16(OffsetValuesHeader.codepage_Offset, view),
            POIDataBlock: {offset: readUint32(OffsetValuesHeader.POIDataBlockOffset_Offset, view),
                         length: readUint32(OffsetValuesHeader.POIDataBlockLen_Offset, view)},
            PolylineDataBlock: {offset: readUint32(OffsetValuesHeader.PolylineDataBlockOffset_Offset, view),
                         length: readUint32(OffsetValuesHeader.PolylineDataBlockLen_Offset, view)},
            PolygoneDataBlock: {offset: readUint32(OffsetValuesHeader.PolygoneDataBlockOffset_Offset, view),
                         length: readUint32(OffsetValuesHeader.PolygoneDataBlockLen_Offset, view)},
            familyID: readUint16(OffsetValuesHeader.familyID_Offset, view),
            productCode: readUint16(OffsetValuesHeader.productCode_Offset, view),
          };
    }
      
}
