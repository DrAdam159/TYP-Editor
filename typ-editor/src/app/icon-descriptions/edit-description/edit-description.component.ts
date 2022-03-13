import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileService } from 'src/app/services/file.service';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { LanguageCode } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Multitext';
import { Text } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/Text';

@Component({
  selector: 'app-edit-description',
  templateUrl: './edit-description.component.html',
  styleUrls: ['./edit-description.component.css']
})
export class EditDescriptionComponent implements OnInit {
  item: GraphicElement;
  language: string;
  languageKey: number;

  descriptionForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {item: GraphicElement, language: string}, 
  private formBuilder: FormBuilder, private fileService: FileService, private dialogRef: MatDialogRef<EditDescriptionComponent>) { 
    this.item = data.item;
    this.language = data.language;
    this.languageKey = 0;

    this.descriptionForm = this.formBuilder.group({
      description: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const description = this.item.text.textArr.find(x => LanguageCode[x.key] === this.language);
    if(description) {
      this.descriptionForm.setValue({description: description.value});
    }
    else {
      this.descriptionForm.setValue({description: 'none'});
    }
    
  }
  
  resetForm(form: FormGroup): void {
		form.reset();
	}

  onFormSubmit(): void {
    if (this.descriptionForm.valid) {
      this.dialogRef.close();
      const description: string = this.descriptionForm.get('description')?.value;

      const tempText: Text = new Text();
      let enumKey = Object.keys(LanguageCode)[Object.values(LanguageCode).indexOf(this.language)];


      tempText.setValues(parseInt(enumKey), description);
      this.item.text.set(tempText);
      this.fileService.updateFile();
      console.log(this.item.text);
    } else {
      this.resetForm(this.descriptionForm);
      alert('Invalid data!');
			return;
		}
  }

}
