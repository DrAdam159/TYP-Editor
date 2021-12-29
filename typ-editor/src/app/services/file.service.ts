import { Injectable } from '@angular/core';
import { TypFile } from 'src/TYP_File_lib/TypFile';
import { POI } from 'src/TYP_File_lib/TypFile_blocks/POI';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';
import { BehaviorSubject } from 'rxjs';
import { Header } from 'src/TYP_File_lib/TypFile_blocks/Header';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';
import { Color } from 'src/TYP_File_lib/Utils/Color';
import { Type } from 'src/TYP_File_lib/IconTypes/Type';
import { Text } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Text';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  fileName: string;
  typFile!: TypFile;

  public notify = new BehaviorSubject<any>('');
  notifyObservable$ = this.notify.asObservable();
  

  constructor() { 
    this.fileName = "";
  }

  public notifyOther(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }

  setFile(typFile: TypFile, fileName: string, buffer: ArrayBuffer): void {
    this.typFile = typFile;
    this.fileName = fileName;
    localStorage.setItem('file', this.arrayBufferToBase64(buffer));
    localStorage.setItem('filename', fileName);
  }

  updateFile(): void {
    localStorage.setItem('file', this.arrayBufferToBase64(this.typFile.getEncodedBuffer()));
    localStorage.setItem('filename', this.fileName);
    console.log("saving");
  }

  createPolygone(type: string, draworder: number, languageCode: number, description: string, typeList: Array<Type>): Polygon {
    const typeValue = type.split('|');
    const newText: Text = new Text();  
    newText.setValues(languageCode, description);

    //console.log(typeValue[1] + ' | ' + draworder + ' | '+ languageCode + ' | ' + description);

    const newPolygone: Polygon = new Polygon(0,0);
    newPolygone.createNew(draworder, newText);

    if(typeList.find(element => element.description === typeValue[0])) {
      newPolygone.type = ~~typeValue[1];
      if(this.typFile.PolygonList.find(element => element.type === newPolygone.type)) {
        let maxSubType = this.typFile.PolygonList
        .filter(({type}) => type  === newPolygone.type)
        .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
        newPolygone.subtype = maxSubType +1;
      }
      this.typFile.PolygonList.push(newPolygone);
      this.updateFile();
      return newPolygone;
    }
    return {} as Polygon;
  }

  createPOI(type: string, languageCode: number, description: string, width: number, height: number, typeList: Array<Type>): POI {
    const typeValue = type.split('|');
    const newText: Text = new Text();  
    newText.setValues(languageCode, description);

    const newPOI: POI = new POI(0,0);
    newPOI.createNew(newText, width, height);

    if(typeList.find(element => element.description === typeValue[0])) {
      newPOI.type = ~~typeValue[1];
      if(this.typFile.POIList.find(element => element.type === newPOI.type)) {
        let maxSubType = this.typFile.POIList
        .filter(({type}) => type  === newPOI.type)
        .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
        newPOI.subtype = maxSubType +1;
      }
      this.typFile.POIList.push(newPOI);
      this.updateFile();
      return newPOI;;
    }

    return {} as POI;
  }

  createPolyline(type: string, languageCode: number, description: string, height: number, typeList: Array<Type>): Polyline {
    const typeValue = type.split('|');
    const newText: Text = new Text();  
    newText.setValues(languageCode, description);

    const newPolyline: Polyline = new Polyline(0,0);
    newPolyline.createNew(newText, height);

    if(typeList.find(element => element.description === typeValue[0])) {
      newPolyline.type = ~~typeValue[1];
      if(this.typFile.PolylineList.find(element => element.type === newPolyline.type)) {
        let maxSubType = this.typFile.PolylineList
        .filter(({type}) => type  === newPolyline.type)
        .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
        newPolyline.subtype = maxSubType +1;
      }
      this.typFile.PolylineList.push(newPolyline);
      this.updateFile();
      return newPolyline;
    }

    return {} as Polyline;
  }

  updateItemDescription(inputValue: string, item: GraphicElement, typeList: Array<Type>, itemType: string): boolean {
    const parsedInput = inputValue.split('|');
    switch(itemType) {
      case 'polyline':
        if(typeList.find(element => element.description === parsedInput[0])) {
          item.type = ~~parsedInput[1];
          if(this.typFile.PolylineList.find(element => element.type === item.type)) {
            let maxSubType = this.typFile.PolylineList
            .filter(({type}) => type  === item.type)
            .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
            item.subtype = maxSubType +1;
          }
          this.updateFile();
          return true;
        }
        break;
      case 'polygone':
        if(typeList.find(element => element.description === parsedInput[0])) {
          item.type = ~~parsedInput[1];
          if(this.typFile.PolygonList.find(element => element.type === item.type)) {
            let maxSubType = this.typFile.PolygonList
            .filter(({type}) => type  === item.type)
            .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
            item.subtype = maxSubType +1;
          }
          this.updateFile();
          return true;
        }
        break;
      case 'poi':
        if(typeList.find(element => element.description === parsedInput[0])) {
          item.type = ~~parsedInput[1];
          if(this.typFile.POIList.find(element => element.type === item.type)) {
            let maxSubType = this.typFile.POIList
            .filter(({type}) => type  === item.type)
            .reduce((a,b)=>a.subtype>b.subtype?a:b).subtype;
            item.subtype = maxSubType +1;
          }
          this.updateFile();
          return true;
        }
        break; 
    }
    return false;
  }

  updateFileItem(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, dayOrNight: boolean): void {
    if(dayOrNight){
      this.updateFileItemDay(itemType, type, subType, newItem, bitmap);
    }
    else {
      this.updateFileItemNight(itemType, type, subType, newItem, bitmap);
    }
  }

  updateFileItemDay(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap): void {
    switch(itemType) {
      case 'polygone':
        if(newItem.bitmapDay) { 
          newItem.bitmapDay.colorTable = bitmap.getAllColors();
          this.getPolygone(type, subType).bitmapDay = newItem.bitmapDay;
          this.getPolygone(type, subType).colDayColor = bitmap.getAllColors();
          this.getPolygone(type, subType).updateColorType();
          console.log(this.getPolygone(type, subType));
        }
        else {
          if(bitmap.getAllColors().length == 1) {
            this.getPolygone(type, subType).colDayColor = bitmap.getAllColors();
          }
          else {
            let tmpPolygone: Polygon = this.getPolygone(type, subType);
            tmpPolygone.colDayColor = bitmap.getAllColors();
            tmpPolygone.createBitmap(true);
          }
        }
        break;
      case 'poi':
        if(newItem.bitmapDay) {
          // console.log(bitmap.getAllColors());
          // newItem.bitmapDay.colorTable = bitmap.getAllColors();
          bitmap.updateColors(newItem.bitmapDay.colorTable);
          newItem.bitmapDay.colorCount = newItem.bitmapDay.colorTable.length;
          this.getPOI(type, subType).bitmapDay = newItem.bitmapDay;
          this.getPOI(type, subType).bitmapDay?.updateBitsPerPixel();
        }
        break;
      case 'polyline':
        if(newItem.bitmapDay) { 
          newItem.bitmapDay.colorTable = bitmap.getAllColors();
          newItem.bitmapDay.colorCount = newItem.bitmapDay.colorTable.length;
          this.getPolyline(type, subType).bitmapDay = newItem.bitmapDay;
          this.getPolyline(type, subType).setPolylineType();
          this.getPolyline(type, subType).colDayColor = newItem.bitmapDay.colorTable;
        }
        else {
          let tmpPolyline: Polyline = this.getPolyline(type, subType);
          tmpPolyline.colDayColor = bitmap.getAllColors();
          tmpPolyline.createBitmap(true);
          tmpPolyline.setPolylineType();
        }
        break;
    }
    newItem.bitmapDay?.data.convertBitmapToData(bitmap, newItem.bitmapDay.colorTable);
    console.log(this.getPOI(type, subType));
    this.updateFile();
  }

  updateFileItemNight(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap): void {
    console.log('saving night icon');
    switch(itemType) {
      case 'polygone':
        if(newItem.bitmapNight) { 
          newItem.bitmapNight.colorTable = bitmap.getAllColors();
          this.getPolygone(type, subType).bitmapNight = newItem.bitmapNight;
          this.getPolygone(type, subType).colNightColor = bitmap.getAllColors();
        }
        else {
          if(bitmap.getAllColors().length == 1 && !this.getPolygone(type, subType).bitmapDay) {
            this.getPolygone(type, subType).colNightColor = bitmap.getAllColors();
          }
          else {
            let tmpPolygone: Polygon = this.getPolygone(type, subType);
            tmpPolygone.colNightColor = bitmap.getAllColors();
            tmpPolygone.createBitmap(false);
          }
        }
        this.getPolygone(type, subType).updateColorType();
        break;
      case 'poi':
        if(newItem.bitmapNight) {
          bitmap.updateColors(newItem.bitmapNight.colorTable);
          newItem.bitmapNight.colorCount = newItem.bitmapNight.colorTable.length;
          this.getPOI(type, subType).bitmapNight = newItem.bitmapNight;
          this.getPOI(type, subType).bitmapNight?.updateBitsPerPixel();
        }
        else {
          const tmpPOI = this.getPOI(type, subType);
          tmpPOI.createNightBitmap(bitmap.getAllColors().length);
          if(tmpPOI.bitmapNight) {
            tmpPOI.bitmapNight.colorTable = bitmap.getAllColors();
            tmpPOI.bitmapNight.colorCount =  tmpPOI.bitmapNight.colorTable.length;
          }
        }
        break;
      case 'polyline':
        if(newItem.bitmapNight) { 
          newItem.bitmapNight.colorTable = bitmap.getAllColors();
          newItem.bitmapNight.colorCount = newItem.bitmapNight.colorTable.length;
          const tmpPolyline: Polyline =  this.getPolyline(type, subType);
          tmpPolyline.bitmapNight = newItem.bitmapNight;
          tmpPolyline.setPolylineType();
          tmpPolyline.colNightColor = newItem.bitmapNight.colorTable;
        }
        else {
          const tmpPolyline: Polyline = this.getPolyline(type, subType);
          tmpPolyline.colNightColor = bitmap.getAllColors();
          tmpPolyline.createBitmap(false);
          tmpPolyline.setPolylineType();
        }
        break;
    }
    newItem.bitmapNight?.data.convertBitmapToData(bitmap, newItem.bitmapNight.colorTable);
    console.log(this.getPolyline(type, subType));
    this.updateFile();
  }

  mergeItems(itemType: string, items: Array<GraphicElement>, fileToMerge: TypFile): void {
    switch(itemType) {
      case 'polyline':
        items.forEach((item) => {
          this.typFile.PolylineList.push(
            fileToMerge.PolylineList.find(x => x.type === item.type && x.subtype == item.subtype) || new Polyline(0,0)
          );
        });
        break;
      case 'poi':
        items.forEach((item) => {
          this.typFile.POIList.push(
            fileToMerge.POIList.find(x => x.type === item.type && x.subtype == item.subtype) || new POI(0,0)
          );
        });
        break;
      case 'polygone':
        items.forEach((item) => {
          this.typFile.PolygonList.push(
            fileToMerge.PolygonList.find(x => x.type === item.type && x.subtype == item.subtype) || new Polygon(0,0)
          );
        });
        break;
    }
    this.updateFile();
  }

  deleteItems(itemType: string, items: Array<GraphicElement>): void {
    switch(itemType) {
      case 'polyline':
        items.forEach((item) => {
          this.typFile.PolylineList = this.typFile.PolylineList.filter(x => x.type + '' + x.subtype  != item.type + '' + x.subtype);
        });
        break;
      case 'poi':
        items.forEach((item) => {
          this.typFile.POIList = this.typFile.POIList.filter(x => x.type + '' + x.subtype  != item.type + '' + x.subtype);
        });
        break;
      case 'polygone':
        items.forEach((item) => {
          this.typFile.PolygonList = this.typFile.PolygonList.filter(x => x.type + '' + x.subtype  != item.type + '' + x.subtype);
        });
        break;
    }
    this.updateFile();
  }

  getFile(): TypFile {
    if(this.typFile) {
      return this.typFile;
    }
    let tempBuff = this.base64ToArrayBuffer(localStorage.getItem('file') || "");
    this.typFile = new TypFile(new DataView(tempBuff));

    return this.typFile;
  }

  getFileName(): string {
    if(this.fileName) {
      return this.fileName;
    }
    this.fileName = localStorage.getItem('filename') || "";
    return this.fileName;
  }

  getPolylineList(): Array<Polyline> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolylineList;
  }

  getPOIList(): Array<POI> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.POIList;
  }

  getPolygoneList(): Array<Polygon> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolygonList;
  }

  getHeader(): Header {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.header;
  }

  getPolyline(type: number, subType: number): Polyline {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolylineList.find(x => x.type === type && x.subtype == subType) || new Polyline(0,0);
  }

  getPolygone(type: number, subType: number): Polygon {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolygonList.find(x => x.type === type && x.subtype == subType) || new Polygon(0,0);
  }

  getPOI(type: number, subType: number): POI {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.POIList.find(x => x.type === type && x.subtype == subType) || new POI(0,0);
  }

  arrayBufferToBase64( buffer: ArrayBuffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

  base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  getBLOB(): Blob {
    if(!this.typFile) {  
      if(!(this.getFile())) {
        return new Blob;
      }
    }
    return this.typFile.encodeAndWrite();
  }
}
