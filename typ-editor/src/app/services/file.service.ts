import { Injectable } from '@angular/core';
import { TypFile } from 'src/TYP_File_lib/TypFile';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  fileName!: string;
  typFile!: TypFile;

  constructor() { }

  setFile(typFile: TypFile, fileName: string, buffer: ArrayBuffer): void {
    this.typFile = typFile;
    this.fileName = fileName;
    localStorage.setItem('file', this.arrayBufferToBase64(buffer));
    localStorage.setItem('filename', fileName);

    // localStorage.setItem('rawFile', JSON.stringify(this.typFile));
  }

  getFile(): TypFile {
    let tempBuff = this.base64ToArrayBuffer(localStorage.getItem('file') || "");
    this.typFile = new TypFile(new DataView(tempBuff));

    // this.typFile = JSON.parse(localStorage.getItem('rawFile') || "");
    return this.typFile;
  }

  getFileName(): string {
    this.fileName = localStorage.getItem('filename') || "";
    return this.fileName;
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
}
