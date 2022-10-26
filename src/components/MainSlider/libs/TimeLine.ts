import EventEmitter from 'events';
import { ISection } from '../../GlobeViewer/interface/ISection';
import ArrowUpIcon from '../../../assets/icons/arrow-up.svg';

export default class TimeLine extends EventEmitter {
  section: ISection[];
  currentSection: number | null;
  menus: any[];
  defaultsection: string | null;
  app: any;
  constructor(app: any, viewer: any) {
    super();
    this.app = viewer;
    this.section = app.sections;
    this.currentSection = null;
    this.menus = app.menus;
    this.defaultsection = app.defaultsection;
    this.init();
    this.generateSelectSection();
    if (!!app.loaded) {
      this.emit('loaded');
    }
  }

  init() {
    if (!this.currentSection) {
      let idx = this.section.findIndex((el) => el.name === this.defaultsection);
      this.currentSection = idx;
    }

    this.generateMenu();
  }

  generateSelectSection() {
    const self = this;
    let container = document.querySelector('.select-section');
    let selected = document.querySelector('.selected-value');
    let optionsContainer = document.querySelector('.options-container');
    if (selected && this.currentSection !== null) {
      let name = document.createElement('span');
      let icon = document.createElement('img');
      icon.src = ArrowUpIcon;
      name.innerHTML = this.section[this.currentSection].name;
      selected.appendChild(name);
      selected.appendChild(icon);
    }

    selected?.addEventListener('click', () => {
      optionsContainer?.classList.toggle('open');
    });

    if (optionsContainer?.innerHTML === '') {
      self.section.forEach((el, idx) => {
        let option = document.createElement('div');
        option.className = 'option';
        option.innerHTML = el.name;
        option.addEventListener('click', () => {
          this.setCurrentSection(idx);
        });
        optionsContainer?.appendChild(option);
      });
    }
  }

  setCurrentSection(sectionIndex: number) {
    let selected = document.querySelector('.selected-value');
    if (
      this.currentSection != undefined &&
      this.currentSection != sectionIndex &&
      this.currentSection >= 0 &&
      this.currentSection < this.section.length
    ) {
      this.currentSection = sectionIndex;
      if (selected) {
        selected.innerHTML = '';
        let name = document.createElement('span');
        let icon = document.createElement('img');
        icon.src = ArrowUpIcon;
        name.innerHTML = this.section[this.currentSection].name;
        selected.appendChild(name);
        selected.appendChild(icon);
      }

      this.emit('sectionChanged', this.section[this.currentSection]);
    }
  }

  generateMenu() {
    const self = this;
    let section: ISection | null = null;

    let menus = ['view'];
    if (this.currentSection) {
      section = this.section[this.currentSection];
    }

    this.menus.forEach((el) => {
      if (menus.findIndex((menu) => menu === el.name) !== -1) {
        let panelContainer = document.querySelector(
          `.tools-${el.name} + .panel`
        );

        el.menuitems.forEach((item: any) => {
          let panelItem = document.createElement('div');
          panelItem.className = 'panel-item';
          let title = document.createElement('p');
          title.innerText = item.title;
          panelItem.appendChild(title);
          let icon = document.createElement('span');
          icon.className = 'icon-check';
          panelItem.appendChild(icon);
          panelItem.classList.add('inactive');
          if (item.url) {
            panelItem.classList.add('overlay-link');
            panelItem.setAttribute('data-href', item.url);
            panelItem.setAttribute('data-width', item.width);
          }
          panelItem.setAttribute('data-name', item.name);
          if (section && section.events) {
            let isAvailabelItem =
              section.events.findIndex((event) =>
                event.tags.includes(item.name.split('layer-')[0])
              ) !== -1;
            if (isAvailabelItem || el.name !== 'view') {
              panelItem.classList.remove('inactive');
            }
          }
          panelContainer?.appendChild(panelItem);
          let eventType = panelItem
            .getAttribute('data-name')
            ?.replace('layer-', '');

          this.app.eventFilter.tags.forEach((el: string) => {
            if (eventType === el) {
              panelItem.classList.add('active');
            }
          });

          let eventTypeLC = eventType?.toLocaleLowerCase();
          if (el.name === 'view') {
            panelItem.addEventListener('click', (e) => {
              if (panelItem.classList.contains('inactive')) {
                return;
              } else {
                if (panelItem.classList.contains('active')) {
                  if (eventTypeLC === 'grid') {
                    self.app.hideGraticule();
                  } else if (eventTypeLC === 'coastlines') {
                    self.app.hideCoastLines();
                  } else {
                    self.app.eventFilter.removeTag(eventTypeLC);
                  }
                } else {
                  if (eventTypeLC === 'grid') {
                    self.app.showGraticule();
                  } else if (eventTypeLC === 'coastlines') {
                    self.app.showCoastLines();
                  } else {
                    self.app.eventFilter.addTag(eventType);
                  }
                }
              }

              panelItem.classList.toggle('active');
            });
          }
        });
      }
    });
  }
}
