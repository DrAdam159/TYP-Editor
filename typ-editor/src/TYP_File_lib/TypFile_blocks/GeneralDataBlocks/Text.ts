import { BinReader } from "src/TYP_File_lib/Utils/BinReaderWriter";

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

export class Text {
    language: LanguageCode;
    text: string;

    constructor(reader?: BinReader) {
        this.language = 0;
        this.text = " ";
        if(reader) {
            this.language = reader.readUint8();
            this.text = reader.readStringWithUndefinedLen(0);
        }
        else {
            this.language = 0;
            this.text = "undefined";
        }
    }
}