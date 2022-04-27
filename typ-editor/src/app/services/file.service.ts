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
import { ColorPallet } from 'src/TYP_File_lib/ColorPallets/ColorPallet';
import { pallet256, pallet64, pallet16 } from 'src/TYP_File_lib/ColorPallets/GarminColorPallets';
import { Palettes } from 'src/TYP_File_lib/ColorPallets/Palettes';
import { LanguageCode } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Multitext';

enum Fontdata {
  Default = 0x0,
  Nolabel = 0x1,
  Small = 0x2,
  Normal = 0x3,
  Large = 0x4
}

@Injectable({
  providedIn: 'root'
})
export class FileService {

  fileName: string;
  typFile!: TypFile;
  fileSize: number;

  public notify = new BehaviorSubject<any>('');
  notifyObservable$ = this.notify.asObservable();


  constructor() {
    this.fileName = "";
    this.fileSize = 0;
  }

  public notifyOther(data: any) {
    if (data) {
      this.notify.next(data);
    }
  }

 /**
  * Metoda pro vytvoreni prazdneho souboru
  * @param fileName - jmeno noveho souboru
  * @param pid - product code 
  * @param fid - family id
  */
  createFile(fileName: string, pid: number, fid: number): void {
    this.typFile = new TypFile();
    this.typFile.header.setPID(pid);
    this.typFile.header.setFID(fid);
    this.fileName = fileName;
    this.updateFile();
  }

  /**
   * Metoda pro nahrani noveho souboru do aplikace
   * @param typFile - nove nahrany soubor
   * @param fileName - jmeno nahraneho souboru 
   * @param buffer - pole bytu souboru
   */
  setFile(typFile: TypFile, fileName: string, buffer: ArrayBuffer): void {
    this.typFile = typFile;
    this.fileName = fileName;
    this.fileSize = buffer.byteLength;
    localStorage.setItem('file', this.arrayBufferToBase64(buffer));
    localStorage.setItem('filename', fileName);
    localStorage.setItem('filesize', this.fileSize.toString());
  }

  /**
   * Metoda pro aktualizaci dat souboru v ramci Local Storage
   */
  updateFile(): void {
    localStorage.setItem('file', this.arrayBufferToBase64(this.typFile.getEncodedBuffer()));
    localStorage.setItem('filename', this.fileName);
    //console.log("saving");
  }

  /**
   * Metoda pro vytvoreni noveho prvku Polygone
   * @param type - identifikator prvku
   * @param draworder - uroven vykresleni prvku 
   * @param languageCode - kodove oznaceni jazyku popisku
   * @param description - popisek prvku
   * @param typeList - pole prvku klic hodnota, kde ciselne oznaceni reprezentuje kod popisku a samotny popisek
   * @param bitmap - bitmapa, ktera se ma novemu prvku nastavit
   * @returns - nove vytvoreny prvek
   */
  createPolygone(type: string, draworder: number, languageCode: number, description: string, typeList: Array<Type>, bitmap?: Bitmap): Polygon {
    const typeValue = type.split('|');
    const newText: Text = new Text();
    newText.setValues(languageCode, description);

    const newPolygone: Polygon = new Polygon(0,0);
    newPolygone.createNew(draworder, newText);
    if(bitmap) {
      newPolygone.createBitmap(true);
      if(newPolygone.bitmapDay) {
        newPolygone.bitmapDay.colorTable = bitmap.getAllColors();
        newPolygone.colDayColor = bitmap.getAllColors();
        newPolygone.updateColorType();
        newPolygone.bitmapDay.data.convertBitmapToData(bitmap, newPolygone.bitmapDay.colorTable);
      }   
    }

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

  /**
   * Metoda pro vytvoreni noveho prvku POI
   * @param type - identifikator prvku
   * @param languageCode - kodove oznaceni jazyku popisku
   * @param description - popisek prvku
   * @param width - sirka prvku
   * @param height - vyska prvku
   * @param typeList - pole prvku klic hodnota, kde ciselne oznaceni reprezentuje kod popisku a samotny popisek
   * @param bitmap - bitmapa, ktera se ma novemu prvku nastavit
   * @returns - nove vytvoreny prvek
   */
  createPOI(type: string, languageCode: number, description: string, width: number, height: number, typeList: Array<Type>, bitmap?: Bitmap): POI {
    const typeValue = type.split('|');
    const newText: Text = new Text();
    newText.setValues(languageCode, description);

    const newPOI: POI = new POI(0,0);
    newPOI.createNew(newText, width, height);
    if(bitmap && newPOI.bitmapDay) {
      if(bitmap.getAllColors().length > 255) {
        bitmap.applyColorPallet('Garmin256');
      }
      bitmap.updateColors(newPOI.bitmapDay.colorTable);
      newPOI.bitmapDay.colorCount = newPOI.bitmapDay.colorTable.length;
      //console.log(newPOI.bitmapDay.colorCount);
     // newPOI.bitmapDay = newPOI.bitmapDay;
      newPOI.bitmapDay.updateBitsPerPixel();
      newPOI.bitmapDay.data.convertBitmapToData(bitmap, newPOI.bitmapDay.colorTable);
    }

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
      return newPOI;
    }

    return {} as POI;
  }

  /**
   * Metoda pro vytvoreni noveho prvku Polyline
   * @param type - identifikator prvku
   * @param languageCode - kodove oznaceni jazyku popisku
   * @param description - popisek prvku
   * @param height - vyska prvku
   * @param typeList - pole prvku klic hodnota, kde ciselne oznaceni reprezentuje kod popisku a samotny popisek
   * @param bitmap - bitmapa, ktera se ma novemu prvku nastavit
   * @returns - nove vytvoreny prvek
   */
  createPolyline(type: string, languageCode: number, description: string, height: number, typeList: Array<Type>, bitmap?: Bitmap): Polyline {
    const typeValue = type.split('|');
    const newText: Text = new Text();
    newText.setValues(languageCode, description);

    const newPolyline: Polyline = new Polyline(0,0);
    newPolyline.createNew(newText, height);

    if(bitmap) {
      newPolyline.colDayColor = bitmap.getAllColors();
      newPolyline.createBitmap(true);
      newPolyline.setPolylineType();
      if(newPolyline.bitmapDay) {
        newPolyline.bitmapDay.width = 32;
        newPolyline.bitmapDay.height = bitmap.height;
        newPolyline.changeBitmapHeight(bitmap.height);
        newPolyline.bitmapDay.data.convertBitmapToData(bitmap, newPolyline.bitmapDay.colorTable);
      }   
    }

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

  /**
   * Metoda pro aktualizaci popisku prvku
   * @param inputValue - novy popisek ve formatu popisek|typ
   * @param item - prvek, kteremu bude aktualizovan popisek
   * @param typeList - pole prvku klic hodnota, kde ciselne oznaceni reprezentuje kod popisku a samotny popisek
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @returns 
   */
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

  /**
   * Metoda pro aktualizaci dat prvku po editaci ikony prvku
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @param newItem - editovany prvek
   * @param bitmap - bitmapa ikony prvku
   * @param dayOrNight - jedna se o denni nebo nocni ikonu?
   */
  updateFileItem(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, dayOrNight: boolean): void {
    if(dayOrNight){
      this.updateFileItemDay(itemType, type, subType, newItem, bitmap);
    }
    else {
      this.updateFileItemNight(itemType, type, subType, newItem, bitmap);
    }
  }

  /**
    * Metoda pro aktualizaci dat prvku po editaci denni ikony prvku
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @param newItem - editovany prvek
   * @param bitmap - bitmapa ikony prvku
   * @param convertToBitmap - je potreba prevest ikonu prvku na bitmapu?
   */
  updateFileItemDay(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, convertToBitmap: boolean = false): void {
    switch(itemType) {
      case 'polygone':
        if(newItem.bitmapDay) {
          newItem.bitmapDay.colorTable = bitmap.getAllColors();
          this.getPolygone(type, subType).bitmapDay = newItem.bitmapDay;
          this.getPolygone(type, subType).colDayColor = bitmap.getAllColors();
          this.getPolygone(type, subType).updateColorType();
          //console.log(this.getPolygone(type, subType));
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
        newItem.bitmapDay?.data.convertBitmapToData(bitmap, newItem.bitmapDay.colorTable);
        break;
      case 'poi':
        if(newItem.bitmapDay) {
          if(bitmap.width != newItem.bitmapDay.width || bitmap.height != newItem.bitmapDay.height) {
            //console.log('Resized icon');
            newItem.bitmapDay.width = bitmap.width;
            newItem.bitmapDay.height = bitmap.height;
          }
          bitmap.updateColors(newItem.bitmapDay.colorTable);
          newItem.bitmapDay.colorCount = newItem.bitmapDay.colorTable.length;
          this.getPOI(type, subType).bitmapDay = newItem.bitmapDay;
          this.getPOI(type, subType).bitmapDay?.updateBitsPerPixel();
        }
        newItem.bitmapDay?.data.convertBitmapToData(bitmap, newItem.bitmapDay.colorTable);
        break;
      case 'polyline':
        this.updatePolylineDay(itemType, type, subType, newItem, bitmap, convertToBitmap);
        break;
    }

    this.updateFile();
  }

  updatePolylineDay(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, convertToBitmap: boolean): void {
    if(newItem.bitmapDay) {
      if(bitmap.width != newItem.bitmapDay.width || bitmap.height != newItem.bitmapDay.height) {
        //console.log('Resized icon');
        newItem.bitmapDay.width = bitmap.width;
        newItem.bitmapDay.height = bitmap.height;
        this.getPolyline(type, subType).changeBitmapHeight(bitmap.height);
      }
      newItem.bitmapDay.colorTable = bitmap.getAllColors();
      newItem.bitmapDay.colorCount = newItem.bitmapDay.colorTable.length;
      this.getPolyline(type, subType).bitmapDay = newItem.bitmapDay;
      this.getPolyline(type, subType).setPolylineType();
      this.getPolyline(type, subType).colDayColor = newItem.bitmapDay.colorTable;
    }
    else {
      if(convertToBitmap) {
        let tmpPolyline: Polyline = this.getPolyline(type, subType);
        tmpPolyline.colDayColor = bitmap.getAllColors();
        tmpPolyline.createBitmap(true);
        tmpPolyline.setPolylineType();
        if(tmpPolyline.bitmapDay) {
          tmpPolyline.bitmapDay.width = bitmap.width;
          tmpPolyline.bitmapDay.height = bitmap.height;
          tmpPolyline.changeBitmapHeight(bitmap.height);
        }
      }
      else {
        let tmpPolyline: Polyline = this.getPolyline(type, subType);
        tmpPolyline.setDayColors(bitmap.getAllColors());
        tmpPolyline.setPolylineType();
      }

    }
    newItem.bitmapDay?.data.convertBitmapToData(bitmap, newItem.bitmapDay.colorTable);
  }

  /**
   * Metoda pro aktualizaci dat prvku po editaci nocni ikony prvku
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @param newItem - editovany prvek
   * @param bitmap - bitmapa ikony prvku
   * @param convertToBitmap - je potreba prevest ikonu prvku na bitmapu?
   */
  updateFileItemNight(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, convertToBitmap: boolean = false): void {
    //console.log('saving night icon');
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
        newItem.bitmapNight?.data.convertBitmapToData(bitmap, newItem.bitmapNight.colorTable);
        break;
      case 'poi':
        if(newItem.bitmapNight) {
          if(bitmap.width != newItem.bitmapNight.width || bitmap.height != newItem.bitmapNight.height) {
            //console.log('Resized icon');
            newItem.bitmapNight.width = bitmap.width;
            newItem.bitmapNight.height = bitmap.height;
          }
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
        newItem.bitmapNight?.data.convertBitmapToData(bitmap, newItem.bitmapNight.colorTable);
        break;
      case 'polyline':
        this.updatePolylineNight(itemType, type, subType, newItem, bitmap, convertToBitmap);
        break;
    }
    this.updateFile();
  }

  updatePolylineNight(itemType: string, type: number, subType: number, newItem: GraphicElement, bitmap: Bitmap, convertToBitmap: boolean): void {
    if(newItem.bitmapNight) {
      if(bitmap.width != newItem.bitmapNight.width || bitmap.height != newItem.bitmapNight.height) {
        //console.log('Resized icon');
        newItem.bitmapNight.width = bitmap.width;
        newItem.bitmapNight.height = bitmap.height;
        this.getPolyline(type, subType).changeBitmapHeight(bitmap.height);
      }
      newItem.bitmapNight.colorTable = bitmap.getAllColors();
      newItem.bitmapNight.colorCount = newItem.bitmapNight.colorTable.length;
      const tmpPolyline: Polyline =  this.getPolyline(type, subType);
      tmpPolyline.bitmapNight = newItem.bitmapNight;
      tmpPolyline.setPolylineType();
      tmpPolyline.colNightColor = newItem.bitmapNight.colorTable;
    }
    else {
      if(convertToBitmap || newItem.bitmapDay) {
        const tmpPolyline: Polyline = this.getPolyline(type, subType);
        tmpPolyline.colNightColor = bitmap.getAllColors();
        tmpPolyline.createBitmap(false);
        tmpPolyline.setPolylineType();
        if(tmpPolyline.bitmapNight) {
          tmpPolyline.bitmapNight.width = bitmap.width;
          tmpPolyline.bitmapNight.height = bitmap.height;
          tmpPolyline.changeBitmapHeight(bitmap.height);
        }
      }
      else {
        let tmpPolyline: Polyline = this.getPolyline(type, subType);
        tmpPolyline.setNightColors(bitmap.getAllColors());
        tmpPolyline.setPolylineType();
      }
    }
    newItem.bitmapNight?.data.convertBitmapToData(bitmap, newItem.bitmapNight.colorTable);
  }

  /**
   * Metoda pro spojeni prvku z jineho TYP souboru
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @param items - pole prvku ke spojeni
   * @param fileToMerge - soubor, ze ktereho se prvky pripojuji
   */
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

  /**
   * Metoda pro odstraneni prvku ze souboru
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygone
   * @param items - prvky k odstraneni
   */
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

  /**
   * Metoda pro nastaveni fontu a barvy fontu prvku
   * @param dayColor - barva pro denni reprezentaci fontu
   * @param nightColor - barva pro nocni reprezentaci fontu
   * @param fontType - typ fontu
   * @param item - editovany prvek
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygon
   * @param hasFontColors - je zapotrebi pridat nastaveni fontu nebo jej odebrat?
   */
  setFont(dayColor: Color, nightColor: Color, fontType: Fontdata, item: GraphicElement, itemType: string, hasFontColors: boolean): void {
    item.colFontColour.splice(0, item.colFontColour.length);
    if(hasFontColors) {
      item.fontType = fontType;
      item.colFontColour.push(dayColor);
      item.colFontColour.push(nightColor);
      item.extOptions = 0xFF & ((item.extOptions & 0xf8) + fontType);
      item.extOptions = 0xFF & ((item.extOptions & 0x7) + 0x18);
      item.fontColType = 0x18;
    }
    else {
      item.fontType = 0;
      item.extOptions = 0;
    }

    //console.log(itemType);
    switch(itemType) {
      case 'polyline':
        const tmpPolyline: Polyline = this.getPolyline(item.type, item.subtype);
        tmpPolyline.setExtendetOptions(hasFontColors);
        break;
      case 'poi':
        const tmpPOI: POI = this.getPOI(item.type, item.subtype);
        tmpPOI.setExtendetOptions(hasFontColors);
        break;
      case 'polygone':
        const tmpPolygone = this.getPolygone(item.type, item.subtype);
        tmpPolygone.setExtendetOptions(hasFontColors);
        break;
    }
  }

  /**
   * Metoda pro odebrani fontu prvku
   * @param itemType - o jaky prvek se jedna - POI / Polyline / Polygon
   * @param item - editovany prvek
   */
  removeFont(itemType: string, item: GraphicElement): void {
    switch(itemType) {
      case 'polyline':
        this.getPolyline(item.type, item.subtype).setExtendetOptions(false);
        break;
      case 'poi':
        this.getPOI(item.type, item.subtype).setExtendetOptions(false);
        break;
      case 'polygone':
        this.getPolygone(item.type, item.subtype).setExtendetOptions(false);
        break;
    }
  }

  /**
   * Metoda pro omezeni barev ikony dle preddefinovanych Garmin palet
   * @param paletteType - typ barvne palety
   */
  limitColorPallete(paletteType: Palettes): void {
    this.typFile.applyColorPalette(paletteType);
  }

  /**
   * Metoda pro ziskani aktualne nahraneho TYP souboru do aplikce
   * @returns - aktualne nahrany soubor
   */
  getFile(): TypFile {
    if(this.typFile) {
      return this.typFile;
    }
    let tempBuff = this.base64ToArrayBuffer(localStorage.getItem('file') || "");
    this.typFile = new TypFile(new DataView(tempBuff));

    return this.typFile;
  }

  isUploaded(): boolean {
    if(this.typFile.isEmpty()) {
      return false;
    }
    return true;
  }

  /**
   * Metoda pro ziskani jmena aktualne nahraneho souboru
   * @returns - jmeno souboru
   */
  getFileName(): string {
    if(this.fileName) {
      return this.fileName;
    }
    this.fileName = localStorage.getItem('filename') || "";
    return this.fileName;
  }

  /**
   * Metoda pro ziskani velikosti aktualne nahraneho souboru
   * @returns - velikost souboru v bytech
   */
  getFileSize(): number {
    if(this.fileSize) {
      return this.fileSize;
    }
    const size = localStorage.getItem('filesize') || "";
    this.fileSize = ~~size;
    return this.fileSize;
  }

  /**
   * Metoda pro ziskani vsech prvku Polyline z aktualniho souboru
   * @returns - list vsech Polyline prvku
   */
  getPolylineList(): Array<Polyline> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolylineList;
  }

  /**
   * Metoda pro ziskani vsech prvku POI z aktualniho souboru
   * @returns - list vsech POI prvku
   */
  getPOIList(): Array<POI> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.POIList;
  }

  /**
   * Metoda pro ziskani vsech prvku Polygone z aktualniho souboru
   * @returns - list vsech Polygone prvku
   */
  getPolygoneList(): Array<Polygon> {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolygonList;
  }

  /**
   * Metoda pro ziskani hlavicky aktualne nahraneho souboru
   * @returns - hlavicka souboru
   */
  getHeader(): Header {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.header;
  }

  /**
   * Metoda pro ziskani konkretniho prvku Polyline
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @returns - hledany prvek, pokud byl nalezen
   */
  getPolyline(type: number, subType: number): Polyline {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolylineList.find(x => x.type === type && x.subtype == subType) || new Polyline(0,0);
  }

  /**
   * Metoda pro ziskani konkretniho prvku Polygone
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @returns - hledany prvek, pokud byl nalezen
   */
  getPolygone(type: number, subType: number): Polygon {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.PolygonList.find(x => x.type === type && x.subtype == subType) || new Polygon(0,0);
  }

  /**
   * Metoda pro ziskani konkretniho prvku POI
   * @param type - identifikator prvku
   * @param subType - identifikator prvku
   * @returns - hledany prvek, pokud byl nalezen
   */
  getPOI(type: number, subType: number): POI {
    if(!this.typFile) {
      this.getFile();
    }
    return this.typFile.POIList.find(x => x.type === type && x.subtype == subType) || new POI(0,0);
  }

  /**
   * Metoda pro ziskani vsech jazyku, ktere jsou pouzity pro popisky prvku
   * @returns - pole nalezenych jazyku
   */
  getLanguages(): string[] {
    const languageCodes = this.getLanguageCodes();
    const data = new Array<string>();
    // this.typFile.POIList.forEach(element => {
    //   element.text.textArr.forEach(text => {
    //     if(!(languageCodes.some(e => e === text.key))) {
    //       languageCodes.push(text.key);
    //     }
    //   });
    // });

    // this.typFile.PolygonList.forEach(element => {
    //   element.text.textArr.forEach(text => {
    //     if(!(languageCodes.some(e => e === text.key))) {
    //       languageCodes.push(text.key);
    //     }
    //   });
    // });

    // this.typFile.PolylineList.forEach(element => {
    //   element.text.textArr.forEach(text => {
    //     if(!(languageCodes.some(e => e === text.key))) {
    //       languageCodes.push(text.key);
    //     }
    //   });
    // });

    languageCodes.forEach(element => {
      data.push(LanguageCode[element]);
    });

    return data;
  }

  /**
   * Metoda pro ziskani vsech kodu jazyku, ktere jsou pouzity pro popisky prvku
   * @returns - pole kodu jazyku
   */
  getLanguageCodes(): number[] {
    const languageCodes = new Array<number>();
    this.typFile.POIList.forEach(element => {
      element.text.textArr.forEach(text => {
        if(!(languageCodes.some(e => e === text.key))) {
          languageCodes.push(text.key);
        }
      });
    });

    this.typFile.PolygonList.forEach(element => {
      element.text.textArr.forEach(text => {
        if(!(languageCodes.some(e => e === text.key))) {
          languageCodes.push(text.key);
        }
      });
    });

    this.typFile.PolylineList.forEach(element => {
      element.text.textArr.forEach(text => {
        if(!(languageCodes.some(e => e === text.key))) {
          languageCodes.push(text.key);
        }
      });
    });

    return languageCodes;
  }

  /**
   * Metoda pro prevod bufferu bytu na znaky pomoci Base64
   * @param buffer - pole bytu
   * @returns - zakodovane pole
   */
  arrayBufferToBase64( buffer: ArrayBuffer ) {
    let binary = '';
    const bytes = new Uint8Array( buffer );
    const len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
  }

  /**
   * Metoda pro prevod pole znaku na pole bytu
   * @param base64 - data pro prevod
   * @returns - prevedena data jako pole bytu
   */
  base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Metoda pro zapis dat zeditovaneho souboru
   * @returns - data souboru jako pole bytu
   */
  getBLOB(): Blob {
    if(!this.typFile) {
      if(!(this.getFile())) {
        return new Blob;
      }
    }
    return this.typFile.encodeAndWrite();
  }
}
