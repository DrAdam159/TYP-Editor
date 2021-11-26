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

  updateFileItem(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap): void {
    switch(itemType) {
      case 'polygone':
        if(newItem.bitmapDay) { 
          newItem.bitmapDay.colorTable = bitmap.getAllColors();
          this.getPolygone(type, subType).bitmapDay = newItem.bitmapDay;
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
        }
        break;
      case 'polyline':
        this.getPolyline(type, subType).bitmapDay = newItem.bitmapDay;
        break;
    }
    newItem.bitmapDay?.data.convertBitmapToData(bitmap, newItem.bitmapDay.colorTable);
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
