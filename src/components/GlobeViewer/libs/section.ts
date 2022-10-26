import {
  IAxis,
  IEvent,
  IHeading,
  IImage,
  IRange,
  ISection,
} from '../interface/ISection';

export default class Section {
  name: string;
  title: string;
  description: string;
  headings: IHeading[];
  axis?: IAxis;
  palettes: any[];
  ranges: IRange[];
  datasources: any[];
  images: IImage[];
  events: IEvent[];

  constructor(data?: any) {
    if (data) {
      const {
        name,
        title,
        description,
        headings,
        axis,
        palettes,
        ranges,
        datasources,
        images,
        events,
      } = data;
      this.name = name;
      this.title = title;
      this.description = description;
      this.headings = headings;
      this.axis = axis;
      this.palettes = palettes;
      this.ranges = ranges;
      this.datasources = datasources;
      this.images = images;
      this.events = events;
    } else {
      this.name = '';
      this.title = '';
      this.description = '';
      this.headings = [];
      this.palettes = [];
      this.ranges = [];
      this.datasources = [];
      this.images = [];
      this.events = [];
    }
  }

  setData(data: ISection) {
    const {
      name,
      title,
      description,
      headings,
      axis,
      palettes,
      ranges,
      datasources,
      images,
      events,
    } = data;
    this.name = name;
    this.title = title;
    this.description = description;
    this.headings = headings;
    this.axis = axis;
    this.palettes = palettes;
    this.ranges = ranges;
    this.datasources = datasources;
    this.images = images;
    this.events = events;
  }
}
