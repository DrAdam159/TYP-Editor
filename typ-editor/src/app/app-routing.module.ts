import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor/editor.component';
import { MainPageComponent } from './main-page/main-page.component';
import { PoiComponent } from './poi/poi.component';
import { PolylineComponent } from './polyline/polyline.component';
import { PolygoneComponent } from './polygone/polygone.component';
import { FileHeaderComponent } from './file-header/file-header.component';

const routes: Routes = [
  {path: '', component: MainPageComponent},
  {path: 'editor', component: EditorComponent},
  {path: 'poi', component: PoiComponent},
  {path: 'polyline', component: PolylineComponent},
  {path: 'polygone', component: PolygoneComponent},
  {path: 'header', component: FileHeaderComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
