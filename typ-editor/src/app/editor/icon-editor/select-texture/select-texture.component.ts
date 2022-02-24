import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Effects } from 'src/app/bitmap-canvas/effects';
import { GraphicElement } from 'src/TYP_File_lib/TypFile_blocks/GeneralDataBlocks/GraphicElement';
import { Bitmap } from 'src/TYP_File_lib/Utils/Bitmap';

@Component({
  selector: 'app-select-texture',
  templateUrl: './select-texture.component.html',
  styleUrls: ['./select-texture.component.css']
})
export class SelectTextureComponent implements OnInit {

  icon: GraphicElement;
  patternColor: string;
  scaleValue: number;
  bitmapScale: number;
  effect: Effects;

  constructor(@Inject(MAT_DIALOG_DATA) private data: {icon: GraphicElement, patternColor: string},  private dialogRef: MatDialogRef<SelectTextureComponent>) {
    this.icon = data.icon;
    this.patternColor = data.patternColor;
    this.scaleValue = 40;
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
    this.effect = Effects.ChessBoard;
   }

  ngOnInit(): void {
  }

  updateGrid(): void {
    this.bitmapScale = (20 / 100 * this.scaleValue) | 0;
  }

  highlightTile(itemEffect: Effects): boolean {
    if(this.effect == itemEffect) {
      return true;
    }
    return false;
  }

  select(itemEffect: Effects): void { 
    this.effect = itemEffect;
  }

  public get effectResult(): typeof Effects {
    return Effects; 
  }

  applyEffect(): void {
    this.dialogRef.close(this.effect);
  }

}
