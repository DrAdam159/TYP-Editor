export const RGB_COLOR_REGEX = /\((\d+),\s*(\d+),\s*(\d+)(,\s*(\d*.\d*))?\)/;

export class Color {
    public r!: number;
    public g!: number;
    public b!: number;
    public a!: number;

    /*constructor()
    constructor(colorStr?: string)
    constructor(r?: string|number, g?: number, b?: number)*/
    constructor(r?: string|number, g?: number, b?: number, a?: number) {
        if (typeof r === 'string') {
            r = r.trim();
            if (r.indexOf('#') === 0) {
                r = r.substr(r.indexOf('#') + 1);
                this.r = parseInt(r.substr(0, 2), 16);
                this.g = parseInt(r.substr(2, 2), 16);
                this.b = parseInt(r.substr(4, 2), 16);
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
                this.a = a || 255;
            }
        }
    }

    toHex() {
        return '#' + this.r.toString(16) + this.g.toString(16) + this.b.toString(16);
    }

    toRgb() {
        return `rgb(${this.r}, ${this.g}, ${this.b})`;
    }

    toRgba() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
}