import axios from 'axios';
import { config } from '../../../config';

type DataSourceOptions = {
  id: string;
  shortname: string;
  longname: string;
  src: string;
  xlabel: string;
  ylabel: string;
  xdirection: string;
  ydirection: string;
  xprecision: number;
  yprecision: number;
  description: string;
  tags: string;
  href: string;
};

export default class DataSource {
  id: string;
  shortname: string;
  longname: string;
  src: string;
  xlabel: string;
  ylabel: string;
  xdirection: string;
  ydirection: string;
  xprecision: number;
  yprecision: number;
  description: string;
  tags: string;
  href: string;
  loaded: boolean;
  data?: any[][];
  min?: number;
  max?: number;

  constructor(options: DataSourceOptions) {
    this.id = options.id;
    this.shortname = options.shortname;
    this.longname = options.longname;
    this.src = options.src;
    this.xlabel = options.xlabel;
    this.ylabel = options.ylabel;
    this.xdirection = options.xdirection;
    this.ydirection = options.ydirection;
    this.xprecision = options.xprecision;
    this.yprecision = options.yprecision;
    this.description = options.description;
    this.tags = options.tags;
    this.href = options.href;
    this.loadData();
    this.loaded = false;
  }

  async getValue(time: number) {
    if (!this.data) {
      await this.loadData();
    }
    if (this.data) {
      let min = this.data?.[0][0];
      let max = this.data?.[this.data.length - 1][0];

      if (time < min) {
        //return this.data[0][1];
        return NaN;
      }

      if (time > max) {
        //return this.data[this.data.length - 1][1];
        return NaN;
      }

      for (let i = 0; i < this.data.length - 1; i++) {
        let x0 = this.data[i][0];
        let y0 = this.data[i][1];
        let x1 = this.data[i + 1][0];
        let y1 = this.data[i + 1][1];

        if (x0 <= time && x1 >= time) {
          // Linear interpolate between the values.
          let t = (time - x0) / (x1 - x0);
          return y0 + t * (y1 - y0);
        }
      }

      return NaN;
    }
  }

  async loadData() {
    const self = this;
    const res = await axios.get(`${config.apiHost}/${self.src}`);

    const data = res.data;

    let series = [];
    let lines = data.split('\n');

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let parts = line.split(',');
      if (parts.length >= 2) {
        let d = [Number(parts[0]), Number(parts[1])];
        series.push(d);
      }
    }

    // Now sort the data to make sure it's in ascending order
    series.sort(function (a, b) {
      return a[0] - b[0];
    });

    // Compute the minimum and maximum values for the datasource
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    for (let j = 0; j < series.length; j++) {
      let v = series[j][1];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    self.min = min;
    self.max = max;
    self.data = series;
    self.loaded = true;
  }
}
