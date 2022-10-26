import { config } from '../../../config';
import { IEvent, ISection } from '../../GlobeViewer/interface/ISection';

const Cesium = (window as any).Cesium;

export default class EventIcons {
  app: any;
  constructor(app: any) {
    this.app = app;
    app.clock.on('timeChanged', () => {
      this.updateEvents(this);
    });
    app.timeline.on('sectionChanged', () => {
      this.updateEvents(this);
    });
    app.timeline.on('loaded', this.loadEvents);
    app.eventFilter.on('filterChanged', () => {
      this.updateEvents(this);
    });
    this.init();
  }

  init() {
    const self = this;
    let handler = new Cesium.ScreenSpaceEventHandler(
      self.app.viewer.scene.canvas
    );
    handler.setInputAction(function (movement: any) {
      var pickedObject = self.app.viewer.scene.pick(movement.position);
      if (
        Cesium.defined(pickedObject) &&
        Cesium.defined(pickedObject.id) &&
        Cesium.defined(pickedObject.id.event)
      ) {
        // Show the overlay
        if (
          pickedObject.id.event.href &&
          pickedObject.id.event.href.length !== 0
        ) {
          self.app.showEvent(pickedObject.id.event);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.loadEvents();
  }

  addEvent(e: IEvent, section: ISection) {
    const self = this;
    let scale = 0.5;
    let position = Cesium.Cartesian3.fromDegrees(e.lon, e.lat);
    let entity = self.app.viewer.entities.add({
      position: position,
      label: {
        text: e.name,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        scale: scale,
      },
      billboard: {
        image: `${config.apiHost}/${e.icon}`,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scale: scale,
      },
    });
    entity.event = e;
    entity.section = section;
    return entity;
  }

  updateEvents(instance: any) {
    const self = instance;

    let time = self.app.clock.time;
    let section = self.app.timeline.section[self.app.timeline.currentSection];

    let entities = self.app.viewer.entities.values;

    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      if (entity.hasOwnProperty('event')) {
        if (
          entity.section == section &&
          entity.event.start <= time &&
          entity.event.end > time &&
          self.app.eventFilter.passes(entity.event)
        ) {
          entity.show = true;
        } else {
          entity.show = false;
        }
      }
    }
  }

  loadEvents() {
    const self = this;
    for (let i = 0; i < self.app.timeline.section.length; i++) {
      let section = self.app.timeline.section[i];
      for (let j = 0; j < section.events.length; j++) {
        let evt = section.events[j];
        if (
          !isNaN(evt.start) &&
          !isNaN(evt.end) &&
          !isNaN(evt.lat) &&
          !isNaN(evt.lon)
        ) {
          this.addEvent(evt, section);
        }
      }
    }
    this.updateEvents(self);
  }
}
