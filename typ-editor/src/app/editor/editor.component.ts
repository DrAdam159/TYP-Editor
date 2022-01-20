import { Component, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { DialogService } from '../services/dialog.service';
import { FileService } from '../services/file.service';

interface unsavedChanges {
  iconDay: boolean;
  iconNight: boolean;
  description: boolean;
  type: boolean;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  sub!: Subscription;
  drawableItem!: GraphicElement;

  itemType: string;
  typeID: string;
  subTypeID: string;

  childNotifier : Subject<boolean> = new Subject<boolean>();

  unsavedChanges: unsavedChanges;

  constructor(private fileService: FileService, private dialogService: DialogService, private Activatedroute: ActivatedRoute, private router: Router) {
    this.itemType = "";
    this.typeID = "";
    this.subTypeID = "";
    this.unsavedChanges = {iconDay: false, iconNight: false, description: false, type: false};
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

  saveChangesToFile(): void {
    this.childNotifier.next();
    this.router.navigate(['']);
  }

  setDayIconState(state: boolean): void {
    this.unsavedChanges.iconDay = state;
  }

  setNightIconState(state: boolean): void {
    this.unsavedChanges.iconNight = state;
  }

  setDescriptionState(state: boolean): void {
    this.unsavedChanges.description = state;
  }

  setTypeState(state: boolean): void {
    this.unsavedChanges.type = state;
  }

  canDeactivate(): Observable<boolean> | boolean {
    // Allow synchronous navigation (`true`) if no crisis or the crisis is unchanged
    if (!this.unsavedChanges.iconDay && !this.unsavedChanges.iconNight 
        && !this.unsavedChanges.type && !this.unsavedChanges.description) {
      return true;
    }
    // Otherwise ask the user with the dialog service and return its
    // observable which resolves to true or false when the user decides
    return this.dialogService.confirm('Discard changes?');
  }
}
