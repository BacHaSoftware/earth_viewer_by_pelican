import { config } from '../../../config';
import { ISection } from '../../GlobeViewer/interface/ISection';

export default class DataHud {
  containter: HTMLElement | null;
  dataSources: any;
  yearStep: number;
  hudLeft?: HTMLElement;

  constructor(app: any) {
    this.containter = document.querySelector('#main_hud');
    this.dataSources = undefined;
    this.yearStep = 1;
    this.init();
    this.loadSection(app.timeline.section[app.timeline.currentSection], this);
    app.timeline.on('sectionChanged', (section: ISection) => {
      this.loadSection(section, this);
    });
    app.clock.on('timeChanged', async (time: any) => {
      await this.onTimeChanged(time.time, this);
    });
  }

  init() {
    this.containter?.classList.add('datahub');
    this.hudLeft = document.createElement('div');
    this.hudLeft.classList.add('hub-left');

    //Setup time field
    let timeField = this.createDataField('years', 'TIME = ', '');
    let yearWrap = document.createElement('div');
    yearWrap.classList.add('hud-left-yearwrap');
    yearWrap.appendChild(timeField);
    let headSup = document.createElement('div');
    headSup.classList.add('hud-left-data');
    headSup.classList.add('headsup-left');

    let divEl = document.createElement('div');
    let asmosphereEl = document.createElement('span');
    asmosphereEl.className = 'overlay-link';
    asmosphereEl.innerText = 'ATMOSPHERE';
    asmosphereEl.setAttribute(
      'data-href',
      `${config.apiHost}/Resources/web.bundle/hud/atmosphere.html`
    );

    divEl.appendChild(asmosphereEl);
    headSup.appendChild(divEl);

    this.hudLeft.appendChild(yearWrap);
    this.hudLeft.appendChild(headSup);
    this.containter?.appendChild(this.hudLeft);
  }

  createDataField(id: string, name: string, unit: string, href?: string) {
    let dataField = document.createElement('div');
    dataField.setAttribute('id', `hud_data_${id}`);
    let dataName = document.createElement('div');
    dataName.classList.add('hud-data-name');
    if (href) {
      let dataHref = document.createElement('span');
      dataHref.className = 'hud-data-name';
      dataHref.setAttribute('data-href', href);
      dataHref.innerText = name;
      dataField.appendChild(dataHref);
    } else {
      dataField.innerText = name;
    }

    let dataValue = document.createElement('div');
    dataValue.className = 'hud-data-value';
    dataField.appendChild(dataValue);

    let dataUnit = document.createElement('div');
    dataUnit.className = 'hud-data-unit';
    dataUnit.innerText = unit;

    dataField.appendChild(dataUnit);

    return dataField;
  }

  loadSection(section: ISection, instance: any) {
    const self = instance;
    document
      .querySelectorAll('[id^="hud_data_"],[id*="hud_data_"]')
      .forEach((el) => {
        if (el.id !== 'hud_data_years') {
          el.remove();
        }
      });

    // calculate the step size for year values
    if (section.axis !== undefined) {
      let range = section.axis.end - section.axis.start;
      self.yearStep =
        range <= 100 ? 2 : range <= 1000 ? 5 : range <= 10000 ? 10 : 100;
    }
    // find data sources with "headsup-xxx" tags
    self.findDataSources(section.datasources);

    if (self.dataSources) {
      for (let i = 0; i < self.dataSources.length; i++) {
        let ds = self.dataSources[i];

        if (ds.tags.match('headsup-left')) {
          let leftField = self.createDataField(
            ds.id,
            ds.shortname,
            ds.ylabel,
            ds.href
          );
          document.querySelector('.headsup-left')?.appendChild(leftField);
        } else if (ds.tags.match('headsup-right')) {
          let rightField = self.createDataField(
            ds.id,
            ds.shortname,
            ds.ylabel,
            ds.href
          );
          document.querySelector('.headsup-right')?.appendChild(rightField);
        }
      }
    }

    let startTime = 0.0;
    if (section.axis !== undefined) {
      if (section.axis.start > 0.0 || section.axis.end < 0.0) {
        startTime = section.axis.start;
      }
      this.onTimeChanged(startTime, self); // Need to call manually on section load
    }
  }

  findDataSources(sources: any) {
    let sourceRegex = new RegExp('(^|,)s*headsup-[a-zA-Z]*s*($|,)', 'i');
    this.dataSources = sources.filter(function (s: any) {
      return sourceRegex.test(s.tags);
    });
  }

  async onTimeChanged(time: number, instance: any) {
    const self = instance;
    if (self.dataSources) {
      for (let i = 0; i < self.dataSources.length; i++) {
        let ds = self.dataSources[i];
        let value = await ds.getValue(time);
        let label = '';

        if (ds.tags.match('headsup-year')) {
          if (value === 0) {
            value = time;
          }

          value = Math.abs(Math.round(value / self.yearStep) * self.yearStep);

          if (ds.xlabel === 'MYA') {
            label = 'MYA';
          }
        }

        let text = '';
        if (isNaN(value)) {
          // handle invalid values
          text = value ? value : 'NO DATA';
        } else {
          text = value.toFixed(ds.yprecision) + ' ' + label;
        }

        // update data field
        document
          .querySelectorAll(`#hud_data_${ds.id} .hud-data-value`)
          ?.forEach((el) => {
            el.innerHTML = text;
          });
      }
    }
  }
}
