export enum OffsetValuesHeader {
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

  POITableBlockOffset_Offset = 51,
  POITableBlockSize_Offset = 55,
  POITableBlockLen_Offset = 57,

  PolylineTableBlockOffset_Offset = 0x3D,
  PolylineTableBlockSize_Offset = 0x41,
  PolylineTableBlockLen_Offset = 0x43,

  PolygoneTableBlockOffset_Offset = 0x47,
  PolygoneTableBlockSize_Offset = 0x4B,
  PolygoneTableBlockLen_Offset = 0x4D,

  PolygoneDraworderTableBlockOffset_Offset = 0x51,
  PolygoneDraworderTableBlockSize_Offset = 0x55,
  PolygoneDraworderTableBlockLen_Offset = 0x57,

  ExtraPOITableBlockOffset_Offset = 0x5B,
  ExtraPOITableBlockSize_Offset = 0x5F,
  ExtraPOITableBlockLen_Offset = 0x61,

  NT_unknown_0x65_Offset = 0x65,
  NT_POIDataBlockOffset_Offset = 0x66,
  NT_POIDataBlockLen_Offset = 0x6A,

  NT_unknown_0x6E_Offset = 0x6E,
  NT_PointLabelblockOffset_Offset = 0x72,
  NT_PointLabelblockLen_Offset =  0x76,
  NT_unknown_0x7A_Offset = 0x7A,
  NT_unknown_0x7E_Offset = 0x7E,
  NT_LabelblockTable1Offset_Offset = 0x82,
  NT_LabelblockTable1Len_Offset = 0x86,
  NT_unknown_0x8A_Offset = 0x8A,
  NT_unknown_0x8E_Offset = 0x8E,
  NT_LabelblockTable2Offset_Offset = 0x92,
  NT_LabelblockTable2Len_Offset = 0x96,
  NT_unknown_0x9A_Offset = 0x9A,


  }