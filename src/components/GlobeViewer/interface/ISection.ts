export interface IEvent {
  offset: number | null;
  start: number;
  end: number;
  name: string;
  icon: string;
  lat: number;
  lon: number;
  tags: string;
  href: string;
}

export interface IHeading {
  left?: number;
  right?: number;
  name?: string | null;
}

export interface IAxis {
  start: number;
  end: number;
  labelstart: number;
  labelend: number;
  labelevery: number;
  scale: number;
  legend: string | null;
  switchprev: number | null;
  switchnext: number;
}

export interface IRange {
  name: string;
  left: number;
  right: number;
  start: number;
  end: number;
  bgcolor: string;
  labelrotation: number;
  href: string;
}

export interface IImage {
  offset: number | null;
  src: string | null;
  layer?: any;
}

export interface ISection {
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
}
