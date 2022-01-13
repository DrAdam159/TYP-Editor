import { Component, Inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'src/app/services/file.service';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
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
  selector: 'app-icon-editor-description-form',
  templateUrl: './icon-editor-description-form.component.html',
  styleUrls: ['./icon-editor-description-form.component.css']
})
export class IconEditorDescriptionFormComponent implements OnInit {

  drawableItem: GraphicElement;

  itemCode: number;

  limit: boolean;

  descriptionForm: FormGroup;

  languageList: Array<String>;

  title: string;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {item: GraphicElement, itemCode: number, limit: boolean}, private formBuilder: FormBuilder, private fileService: FileService) {
    this.drawableItem = data.item;
    this.itemCode = data.itemCode;
    this.limit = data.limit;
    this.languageList = new Array();

    if(this.limit) {
      this.languageList.push(LanguageCode[this.itemCode]);
      this.title = 'Edit:';
    }
    else {
      this.languageList = Object.keys(LanguageCode).filter(key => isNaN(Number(key)));
      this.drawableItem.text.textArr.forEach((loc, index) => {
        this.languageList = this.languageList.filter(value => value != LanguageCode[loc.key])
      });
      this.title = 'Add:';
    }
    

    this.descriptionForm = this.formBuilder.group({
      language: [null, [Validators.required]],
      description: ['', [Validators.required]]
    });
   }

  ngOnInit(): void {
    if(this.limit) { 
      const description = this.drawableItem.text.textArr.find(x => x.key === ~~this.itemCode);
      this.descriptionForm.setValue({description: description?.value, language: LanguageCode[this.itemCode] });
    }
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
      this.refreshAnotherComponent();
		} else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
		}
    this.resetForm(this.descriptionForm);
	}

  refreshAnotherComponent() {
    this.fileService.notifyOther({
       refresh: true
    });
 }

}
