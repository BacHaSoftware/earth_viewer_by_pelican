import axios from 'axios';
import { config } from '../../../config';

export interface IPaletteOptions {
  name?: string;
  description: string;
  units: string;
  src: string;
  intervals?: Array<any>;
  loaded?: boolean;
  rangeMin?: number;
  rangeMax?: number;
}

export type IIntervalData = {
  level: number;
  hex?: string;
  alpha?: number;
  red?: number;
  green?: number;
  blue?: number;
};

export interface IInterval {
  id?: number;
  smooth?: boolean;
  lower?: IIntervalData;
  upper?: IIntervalData;
}

export default class Paltette {
  name?: string;
  description: string;
  units: string;
  src: string;
  intervals?: Array<any>;
  loaded?: boolean;
  rangeMin?: number;
  rangeMax?: number;
  metric?: boolean;

  constructor(options: IPaletteOptions) {
    this.description = options.description;
    this.units = options.units;
    this.src = options.src;
    this.intervals = [];
    this.loaded = false;
    this.rangeMin = 0;
    this.rangeMax = 0;
  }

  async load() {
    const self = this;
    const res = await axios.get(`${config.apiHost}/${this.src}`);
    const parser = new DOMParser();
    const doc = parser.parseFromString(res.data, 'application/xml');

    let rangeMin = 0;
    let rangeMax = 0;

    doc
      .querySelector('ColorPalette')
      ?.querySelectorAll('ColorPalette')
      .forEach((el) => {
        let name = el.getAttribute('name');
        let metric = el.getAttribute('metric');
        if (name && metric) {
          self.name = name;
          self.metric = Boolean(metric);
        }
        let units = el.getAttribute('units');
        if (!self.units && units) {
          self.units = units;
        }

        [doc.querySelectorAll('table')[0]].forEach((el) => {
          el.querySelectorAll('interval').forEach((i) => {
            let id = Number(i.getAttribute('id'));
            let smooth = Boolean(i.getAttribute('smooth'));

            let interval: IInterval = {
              id,
              smooth,
            };

            //Load lower
            [i.querySelector('lower')].forEach((l) => {
              let level = Number(el.getAttribute('level'));
              let hex = el.getAttribute('hex');
              let alpha = Number(el.getAttribute('alpha'));
              let red = Number(el.getAttribute('red'));
              let green = Number(el.getAttribute('green'));
              let blue = Number(el.getAttribute('blue'));

              let lower: IIntervalData = {
                level: 0,
                hex: '',
                alpha: 0,
                red: 0,
                green: 0,
                blue: 0,
              };

              if (level && hex && alpha && red && green && blue) {
                lower = {
                  level,
                  hex,
                  alpha,
                  red,
                  green,
                  blue,
                };
              }

              interval.lower = lower;

              if (rangeMin === undefined || lower.level < rangeMin) {
                rangeMin = lower.level;
              }
            });

            //Load upper
            [i.querySelector('upper')].forEach((l) => {
              let level = Number(el.getAttribute('level'));
              let hex = el.getAttribute('hex');
              let alpha = Number(el.getAttribute('alpha'));
              let red = Number(el.getAttribute('red'));
              let green = Number(el.getAttribute('green'));
              let blue = Number(el.getAttribute('blue'));

              let upper: IIntervalData = {
                level: 0,
                hex: '',
                alpha: 0,
                red: 0,
                green: 0,
                blue: 0,
              };

              if (level && hex && alpha && red && green && blue) {
                upper = {
                  level,
                  hex,
                  alpha,
                  red,
                  green,
                  blue,
                };
              }

              interval.upper = upper;

              if (rangeMax === undefined || upper.level > rangeMax) {
                rangeMax = upper.level;
              }
            });

            self.intervals?.push(interval);
          });
        });
      });

    // set the range min and max for the palette
    self.rangeMin = rangeMin;
    self.rangeMax = rangeMax;

    if (!!self.intervals) {
      self.intervals.sort(function (a, b) {
        return a.lower.level - b.lower.level;
      });
    }

    self.loaded = true;
  }
}
