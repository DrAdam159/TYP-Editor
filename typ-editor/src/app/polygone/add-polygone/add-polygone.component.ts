import { Component, OnInit } from '@angular/core';
import { Type } from 'src/TYP_File_lib/IconTypes/Type';
import { Observable } from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { polygoneTypes } from 'src/TYP_File_lib/IconTypes/PolygoneTypes';
import { Polygon } from 'src/TYP_File_lib/TypFile_blocks/Polygon';
import { MatDialogRef } from '@angular/material/dialog';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';

enum LanguageCode {
  unspecified = 0x00,
  french = 0x01,
  german = 0x02,
  dutch = 0x03,
  english = 0x04,
  italian = 0x05,
  finnish = 0x06,
  swedish = 0x07,
  spanish = 0x08,
  basque = 0x09,
  catalan = 0x0a,
  galician = 0x0b,
  welsh = 0x0c,
  gaelic = 0x0d,
  danish = 0x0e,
  norwegian = 0x0f,
  portuguese = 0x10,
  slovak = 0x11,
  czech = 0x12,
  croatian = 0x13,
  hungarian = 0x14,
  polish = 0x15,
  turkish = 0x16,
  greek = 0x17,
  slovenian = 0x18,
  russian = 0x19,
  estonian = 0x1a,
  latvian = 0x1b,
  romanian = 0x1c,
  albanian = 0x1d,
  bosnian = 0x1e,
  lithuanian = 0x1f,
  serbian = 0x20,
  macedonian = 0x21,
  bulgarian = 0x22
}

@Component({
  selector: 'app-add-polygone',
  templateUrl: './add-polygone.component.html',
  styleUrls: ['./add-polygone.component.css']
})
export class AddPolygoneComponent implements OnInit {

  typeList: Array<Type>
  filteredTypes: Observable<Type[]>

  languageList: Array<String>;

  descriptionForm: FormGroup;

  bitmapFromImage: boolean;

  fileName: string;

  bitmap!: Bitmap;


  constructor(private fileService: FileService, private formBuilder: FormBuilder, private router: Router, private dialogRef: MatDialogRef<AddPolygoneComponent>) { 
    this.typeList = new Array();
    this.filteredTypes = new Observable();
    this.languageList = new Array();
    this.bitmapFromImage = false;
    this.fileName = "Select Image"
    this.languageList = Object.keys(LanguageCode).filter(key => isNaN(Number(key)));

    this.descriptionForm = this.formBuilder.group({
      type: ['', [Validators.required]],
      draworder: [null, [Validators.required]],
      language: [null, [Validators.required]],
      description: ['', [Validators.required]],
      createBitmap: [],
    });
  }

  ngOnInit(): void {
    this.typeList = polygoneTypes;
    let tmp = this.descriptionForm.get('type');
        if( tmp !=null ) {
          this.filteredTypes = tmp.valueChanges.pipe(
            startWith(''),
            map(state => (state ? this._filterTypes(state) : this.typeList.slice())),
          );
        }
  }

  private _filterTypes(value: string): Type[] {
    const filterValue = value.toLowerCase();

    return this.typeList.filter(state => state.description.toLowerCase().includes(filterValue));
  }

  onFormSubmit() {
    if (this.descriptionForm.valid) { 
      const type = this.descriptionForm.get('type')?.value;
      const draworder = this.descriptionForm.get('draworder')?.value;
      const description = this.descriptionForm.get('description')?.value;
      const languageCode: number = ~~LanguageCode[this.descriptionForm.get('language')?.value];
      
      let newPolygone: Polygon
      if(this.bitmapFromImage && this.bitmap.getAllColors().length <= 2) {
        newPolygone = this.fileService.createPolygone(type, draworder, languageCode, description, this.typeList, this.bitmap);
      }
      else {
        newPolygone = this.fileService.createPolygone(type, draworder, languageCode, description, this.typeList);
      }

      if(newPolygone 
        && Object.keys(newPolygone).length === 0
        && Object.getPrototypeOf(newPolygone) === Object.prototype) {
        alert('Invalid data!');
      }
      else {
        this.dialogRef.close();
        this.router.navigate(['polygone/editor',"polygone", newPolygone.type, newPolygone.subtype, 0 ]);
      } 
    }
    else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
    }
  } 

  resetForm(form: FormGroup) {
		form.reset();
	}

  changeBitmapState(): void {
    this.bitmapFromImage = !this.bitmapFromImage;
  }

  handleFileInput(event: any): void {
    const file: File = event.target.files[0];
    const img = new Image();
    const imgCanvas: HTMLCanvasElement = document.createElement('canvas');
    const imgCanvasCtx: CanvasRenderingContext2D | null = imgCanvas.getContext("2d");
    
    if (file) {
      img.onload = () => {
        imgCanvasCtx?.drawImage(img, 0, 0);
        const imgData = imgCanvasCtx?.getImageData(0, 0, img.width, img.height).data;
    
        if(imgData) {
          this.bitmap = new Bitmap(img.width, img.height);
          this.bitmap.pixelArr = imgData;
          if(this.bitmap.getAllColors().length > 2) {
            alert('Too many colors! Select image with up to two colors.');
            return;
          }
          this.fileName = file.name;
        }
      }

      var reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result as string;
        
      };

      reader.readAsDataURL(file)

      reader.onerror = () => {
        console.log(reader.error);
      };
    }
  }

}
