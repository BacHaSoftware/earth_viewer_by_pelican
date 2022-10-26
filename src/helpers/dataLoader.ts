import { IEvent, IImage } from '../components/GlobeViewer/interface/ISection';
import Section from '../components/GlobeViewer/libs/section';
import DataSource from '../components/MainSlider/libs/DataSource';
import Menu from '../components/MainSlider/libs/Menu';
import Palette from '../components/MainSlider/libs/Palette';

export const loadMenu = (node: HTMLElement): Menu => {
  let menu = new Menu();
  let name = node.getAttribute('name') || 'No data';
  let title = node.getAttribute('title') || 'No data';
  let icon = node.getAttribute('icon') || 'No data';
  let tags = node.getAttribute('tags') || 'No data';
  if (name !== null && title !== null && icon !== null && tags !== null) {
    menu.name = name;
    menu.title = title;
    menu.icon = icon;
    menu.tags = tags;
  }

  node.querySelectorAll('menuitem').forEach((el) => {
    let menuItem = {
      name: el.getAttribute('name'),
      title: el.getAttribute('title'),
      tags: el.getAttribute('tags'),
      textcolor: el.getAttribute('textcolor'),
      url: el.getAttribute('url'),
      width: el.getAttribute('width'),
    };
    menu.menuitems.push(menuItem);
  });

  return menu;
};

export const loadSection = (node: HTMLElement) => {
  let section = new Section();
  let name = node.getAttribute('name') || 'No data';
  let title = node.getAttribute('title') || 'No data';
  let description = node.getAttribute('description') || 'No data';
  if (name && title && description) {
    section.name = name;
    section.title = title;
    section.description = description;
  }

  //Load heading
  node.querySelectorAll('heading').forEach((el) => {
    let heading = {
      left: Number(el.getAttribute('left')) || 0,
      right: Number(el.getAttribute('right')) || 0,
      name: el.getAttribute('name') || 'No data',
    };
    section.headings.push(heading);
  });

  // Load the axis
  node.querySelectorAll('axis').forEach(function (el) {
    let axis = {
      start: Number(el.getAttribute('start')) || 0,
      end: Number(el.getAttribute('end')) || 0,
      labelstart: Number(el.getAttribute('labelstart')),
      labelend: Number(el.getAttribute('labelend')),
      labelevery: Number(el.getAttribute('labelevery')),
      scale: Number(el.getAttribute('scale')),
      legend: el.getAttribute('legend') || 'No data',
      switchprev: Number(el.getAttribute('switchprev')),
      switchnext: Number(el.getAttribute('switchnext')),
    };

    if (!!axis.legend) {
      section.axis = axis;
    }
  });

  // Load the palette(s)
  node.querySelectorAll('palette').forEach(function (el) {
    let description = el.getAttribute('description') || 'No data';
    let units = el.getAttribute('description') || 'No data';
    let src = el.getAttribute('src') || 'No data';
    let palette = null;
    if (description && units && src) {
      palette = new Palette({
        description,
        units,
        src,
      });
    }

    if (!!palette && !!section.palettes) {
      palette.load();
      section.palettes.push(palette);
    }
  });

  // Load all the ranges
  node.querySelectorAll('range').forEach(function (el) {
    let name = el.getAttribute('name') || 'No data';
    let left = Number(el.getAttribute('left')) || 0;
    let right = Number(el.getAttribute('right')) || 0;
    let start = Number(el.getAttribute('start')) || 0;
    let end = Number(el.getAttribute('end')) || 0;
    let bgcolor = el.getAttribute('bgcolor') || '#000';
    let labelrotation = Number(el.getAttribute('labelrotation')) || 0;
    let href = el.getAttribute('href') || '#';
    let range = {
      name,
      left,
      right,
      start,
      end,
      bgcolor,
      labelrotation,
      href,
    };
    section.ranges.push(range);
  });

  // Load all the data sources
  node.querySelectorAll('datasource').forEach(function (el) {
    let ds = null;

    let id = el.getAttribute('id') || 'No data';
    let shortname = el.getAttribute('shortname') || 'No data';
    let longname = el.getAttribute('longname') || 'No data';
    let src = el.getAttribute('src') || 'No data';
    let xlabel = el.getAttribute('xlabel') || 'No data';
    let ylabel = el.getAttribute('ylabel') || 'No data';
    let xdirection = el.getAttribute('xdirection') || 'No data';
    let ydirection = el.getAttribute('ydirection') || 'No data';
    let xprecision = Number(el.getAttribute('xprecision'));
    let yprecision = Number(el.getAttribute('yprecision'));
    let tags = el.getAttribute('tags') || 'No data';
    let description = el.getAttribute('description') || 'No data';
    let href = el.getAttribute('href') || 'No data';

    ds = new DataSource({
      id,
      shortname,
      longname,
      src,
      xlabel,
      ylabel,
      xdirection,
      ydirection,
      xprecision,
      yprecision,
      tags,
      description,
      href,
    });

    section.datasources.push(ds);
  });

  // Load all the images
  node.querySelectorAll('image').forEach(function (el) {
    let image: IImage = {
      offset: 0,
      src: '',
    };

    let offset = Number(el.getAttribute('offset'));
    let src = el.getAttribute('src');
    image = {
      offset,
      src,
    };
    section.images.push(image);
  });

  // Load all the events
  node.querySelectorAll('event').forEach(function (el) {
    let event: IEvent = {
      offset: 0,
      start: 0,
      end: 0,
      name: '',
      icon: '',
      lat: 0,
      lon: 0,
      tags: '',
      href: '',
    };

    let offset = Number(el.getAttribute('offset'));
    let start = Number(el.getAttribute('start'));
    let end = Number(el.getAttribute('end'));
    let name = el.getAttribute('name') || 'No data';
    let icon = el.getAttribute('icon') || 'No data';
    let lat = Number(el.getAttribute('lat'));
    let lon = Number(el.getAttribute('lon'));
    let tags = el.getAttribute('tags') || 'No data';
    let href = el.getAttribute('href') || 'No data';

    event.offset = offset;
    event.start = start;
    event.end = end;
    event.name = name;
    event.icon = icon;
    event.lat = lat;
    event.lon = lon;
    event.tags = tags;
    event.href = href;

    section.events.push(event);
  });

  if (section.images) {
    section.images.sort(function (a, b) {
      if (a.offset != undefined && b.offset != undefined) {
        return a.offset - b.offset;
      } else return 0;
    });
  }

  return section;
};
