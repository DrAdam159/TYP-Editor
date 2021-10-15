import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Polyline } from 'src/TYP_File_lib/TypFile_blocks/Polyline';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editItem: any;

  constructor(private route: ActivatedRoute) { 
  //   this.route.queryParams.subscribe(params => {
  //     this.editItem = params;
  //     console.log(params);
  // });
  }

  ngOnInit(): void {
    //this.editItem = this.route.paramMap.pipe(map(() => window.history.state))
  }

}
