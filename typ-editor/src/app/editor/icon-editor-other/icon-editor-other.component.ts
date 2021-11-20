import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { FileService } from 'src/app/services/file.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Text } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Text';

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
  selector: 'app-icon-editor-other',
  templateUrl: './icon-editor-other.component.html',
  styleUrls: ['./icon-editor-other.component.css']
})
export class IconEditorOtherComponent implements OnInit {

  sub!: Subscription;
  drawableItem!: GraphicElement;

  itemType: string;
  typeID: string;
  subTypeID: string;

  descriptionForm: FormGroup;
  
  languageList: Array<String>;

  constructor(private fileService: FileService, private Activatedroute: ActivatedRoute, private formBuilder: FormBuilder) { 
    this.languageList = Object.keys(LanguageCode).filter(key => isNaN(Number(key)));

    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";

    this.descriptionForm = this.formBuilder.group({
      language: [null, [Validators.required]],
      description: ['', [Validators.required]]
    });

  }

  ngOnInit(): void {
    this.sub = this.Activatedroute.paramMap.subscribe(params => { 
      this.itemType = params.get('id') || "";
      this.typeID = params.get('id1') || "";
      this.subTypeID = params.get('id2') || "";

      if(this.itemType && this.typeID && this.subTypeID) {
        switch(this.itemType) {
          case 'polyline':
            this.drawableItem = this.fileService.getPolyline(~~this.typeID, ~~this.subTypeID);
            break;
          case 'polygone':
            this.drawableItem = this.fileService.getPolygone(~~this.typeID, ~~this.subTypeID);
            break;
          case 'poi':
            this.drawableItem = this.fileService.getPOI(~~this.typeID, ~~this.subTypeID);
            break;
          default:
            new Error("No item type supplied!");
        }
      }
   });
  }

  onChange() {
    const languageKey = LanguageCode[this.descriptionForm.get('language')?.value];
    const description = this.drawableItem.text.textArr.find(x => x.key === ~~languageKey);
    this.descriptionForm.get('description')?.setValue(description?.value);
	}

  resetForm(form: FormGroup) {
		form.reset();
	}

  onFormSubmit() {
    if (this.descriptionForm.valid) {
      const languageKey: number = ~~LanguageCode[this.descriptionForm.get('language')?.value];
      const description: string = this.descriptionForm.get('description')?.value;

      let tempText: Text = new Text();
      tempText.setValues(languageKey, description);
      this.drawableItem.text.set(tempText);
      this.fileService.updateFile();
		} else {
      console.log('invalid');
      this.resetForm(this.descriptionForm);
			return;
		}
    this.resetForm(this.descriptionForm);
	}

}
