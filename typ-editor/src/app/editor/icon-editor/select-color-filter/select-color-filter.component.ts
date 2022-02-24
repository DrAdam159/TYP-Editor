import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Effects } from 'src/app/bitmap-canvas/effects';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';

@Component({
  selector: 'app-select-color-filter',
  templateUrl: './select-color-filter.component.html',
  styleUrls: ['./select-color-filter.component.css']
})
export class SelectColorFilterComponent implements OnInit {

  icon: GraphicElement;
  scaleValue: number;
  bitmapScale: number;
  filter: Effects;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: GraphicElement},  private dialogRef: MatDialogRef<SelectColorFilterComponent>) {
    this.icon = data.icon;
    this.scaleValue = 40;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.filter = Effects.GrayScale;
   }

  ngOnInit(): void {
  }

  updateGrid(): void {
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
  }

  highlightTile(colorFilter: Effects): boolean {
    if(this.filter == colorFilter) {
      return true;
    }
    return false;
  }

  select(colorFilter: Effects): void { 
    this.filter = colorFilter;
  }

  public get effectResult(): typeof Effects {
    return Effects; 
  }

  applyEffect(): void {
    this.dialogRef.close(this.filter);
  }

}
