import { Header } from './TypFile_blocks/header';

export class TypFile {

    header!: Header;

    constructor(view: DataView) {
        this.header = new Header(view);
    }
      
}
