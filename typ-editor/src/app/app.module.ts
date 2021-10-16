import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTreeModule} from '@angular/material/tree';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { PolylineComponent } from './polyline/polyline.component';
import { HeaderComponent } from './header/header.component';
import { PolylineDetailComponent } from './polyline-detail/polyline-detail.component';
import { PoiComponent } from './poi/poi.component';
import { PoiDetailComponent } from './poi-detail/poi-detail.component';
import { PolygoneComponent } from './polygone/polygone.component';
import { PolygoneDetailComponent } from './polygone-detail/polygone-detail.component';
import { EditorComponent } from './editor/editor.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    PolylineComponent,
    HeaderComponent,
    PolylineDetailComponent,
    PoiComponent,
    PoiDetailComponent,
    PolygoneComponent,
    PolygoneDetailComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatTabsModule,
    MatTreeModule,
    MatListModule,
    MatDialogModule,
    MatButtonModule,
    MatGridListModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
