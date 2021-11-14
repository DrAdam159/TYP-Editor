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
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { PolylineComponent } from './polyline/polyline.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PolylineDetailComponent } from './polyline-detail/polyline-detail.component';
import { PoiComponent } from './poi/poi.component';
import { PoiDetailComponent } from './poi-detail/poi-detail.component';
import { PolygoneComponent } from './polygone/polygone.component';
import { PolygoneDetailComponent } from './polygone-detail/polygone-detail.component';
import { EditorComponent } from './editor/editor.component';
import { MainNavComponent } from './main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { BitmapCanvasComponent } from './bitmap-canvas/bitmap-canvas.component';
import { FileHeaderComponent } from './file-header/file-header.component';
import { FileDownloadComponent } from './file-download/file-download.component';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MaterialExtensionsModule, MaterialExtensionsExperimentalModule } from '@ng-matero/extensions';
import { MatFormFieldModule } from '@angular/material/form-field';
import { IconEditorComponent } from './editor/icon-editor/icon-editor.component';
import { IconEditorOtherComponent } from './editor/icon-editor-other/icon-editor-other.component';


@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    PolylineComponent,
    MainPageComponent,
    PolylineDetailComponent,
    PoiComponent,
    PoiDetailComponent,
    PolygoneComponent,
    PolygoneDetailComponent,
    EditorComponent,
    MainNavComponent,
    BitmapCanvasComponent,
    FileHeaderComponent,
    FileDownloadComponent,
    IconEditorComponent,
    IconEditorOtherComponent
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
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    LayoutModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MaterialExtensionsModule,
    MaterialExtensionsExperimentalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
