export const RGB_COLOR_REGEX = /\((\d+),\s*(\d+),\s*(\d+)(,\s*(\d*.\d*))?\)/;

export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    constructor(r?: string|number, g?: number, b?: number, a?: number) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        if (typeof r === 'string') {
            r = r.trim();
            if (r.indexOf('#') === 0) {
                r = r.substr(r.indexOf('#') + 1);
                this.r = parseInt(r.substr(0, 2), 16);
                this.g = parseInt(r.substr(2, 2), 16);
                this.b = parseInt(r.substr(4, 2), 16);
                // console.log(r.length);
                if(r.length == 8) {
                    this.a = parseInt(r.substr(6, 2), 16);
                }
                else {
                    this.a = 255;
                }
            } else if (r.indexOf('rgb') === 0) {
                const res = RGB_COLOR_REGEX.exec(r);
                if(res !== null) {
                    this.r = parseInt(res[1], 10);
                    this.g = parseInt(res[2], 10);
                    this.b = parseInt(res[3], 10);
                    this.a = res[5] ? parseFloat(res[5]) : 255;
                }
                
            }
        } else {
            if(r !== undefined && g !== undefined && b !== undefined) {
                this.r = r;
                this.g = g;
                this.b = b;
                if(a !== undefined){
                    this.a = a;
                }
                else {
                    this.a = 255;
                }
            }
        }
    }

    toHex() {
        let hexCode: string =  "";
        if(this.r == 0) {
            hexCode =  '#' + this.r.toString(16) + '0'; 
        }
        else {
            hexCode = '#' + this.r.toString(16); 
        }
        if(this.g == 0) {
            hexCode +=  this.g.toString(16)+ '0';
        }
        else {
            hexCode +=  this.g.toString(16);
        }
        if(this.b == 0) {
            hexCode += this.b.toString(16) + '0';
        }
        else {
            hexCode += this.b.toString(16);
        }
        if(this.a) {
            if(this.a == 0) {
                hexCode += this.a.toString(16) + '0';
            }
            else {
                hexCode += this.a.toString(16);
            }
        }
        return hexCode;
    }

    toRgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    toRgba() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    compareColors(secondColor: Color): boolean {
        if(this.r == secondColor.r &&
            this.g == secondColor.g &&
            this.b == secondColor.b &&
            this.a == secondColor.a 
        ) {
            return true;
        }
        return false;

    }

    compareColorsNonAlpha(secondColor: Color): boolean {
        if(this.r == secondColor.r &&
            this.g == secondColor.g &&
            this.b == secondColor.b 
        ) {
            return true;
        }
        return false;

    }
}