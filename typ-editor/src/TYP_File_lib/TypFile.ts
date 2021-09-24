import { Header } from 'src/TYP_File_lib/header';
import { readString } from './utils/binUtils';

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
            creationDate: new Date(view.getInt16(OffsetValuesHeader.creationDateYear_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateMonth_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateDay_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateHours_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateMinutes_Offset), 
                        view.getInt8(OffsetValuesHeader.creationDateSeconds_Offset)),
          };
    }
      
}
