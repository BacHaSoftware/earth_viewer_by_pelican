import Scrubber from '../../../assets/images/scrubber.png';
import { config } from '../../../config';
import { IRange, ISection } from '../../GlobeViewer/interface/ISection';
import getlength from '../helper';
const Draggable = require('draggable');

export default class TimeSlider {
  rangeMin: number;
  rangeMax: number;
  scrubberStep: number;
  scrubberOffset: number;
  timeline: any;
  timelineEvents?: any;
  container: HTMLDivElement | null;
  dragger?: any;
  app: any;
  ignoreDrag?: boolean;
  currentEvent: any;

  sectionId: number;
  constructor(app?: any) {
    this.app = app;
    this.rangeMin = 0.0;
    this.rangeMax = 0.0;
    this.scrubberStep = 1.0;
    this.scrubberOffset = 11.5; // half the scrubber image height (shouldn't change)

    this.timeline = undefined;
    this.timelineEvents = undefined;
    this.container = document.querySelector('.main-slider');
    this.sectionId = -1;
    this.currentEvent = null;

    this.init();
    app.timeline.on('loaded', () => {
      this.loadTimeline(this);
    });
    app.timeline.on('sectionChanged', () => {
      this.loadSection(this);
    });
    // //When the filter changes, redraw the slider.
    app.eventFilter.on('filterChanged', () => {
      this.redrawSlider(this);
    });
  }

  init() {
    const self = this;
    const scrubberContainer = document.createElement('div');
    scrubberContainer.className = 'timeline-scrubber';
    const scrubber = document.createElement('img');
    scrubber.src = Scrubber;
    scrubber.width = 38;
    scrubber.height = 22;
    scrubber.style.left = `-${self.scrubberOffset}px`;
    scrubber.draggable = false;
    scrubberContainer.append(scrubber);

    self.container?.appendChild(scrubberContainer);

    if (self.dragger === undefined) {
      self.dragger = new Draggable(scrubber, {
        axis: 'x',
        limit: {
          x: [
            -self.scrubberOffset,
            (self.container?.clientWidth || 0) - self.scrubberOffset,
          ],
          y: [50, 50],
        },
        onDrag: function (
          element: HTMLElement,
          x: number,
          y: number,
          event: Event
        ) {
          if (!self.ignoreDrag) {
            let range = self.rangeMax - self.rangeMin;
            let actualDraggableRange =
              (self.container?.clientWidth || 0) - self.scrubberOffset;
            let time =
              Number(
                Math.round((range * x) / actualDraggableRange).toFixed(2)
              ) + self.rangeMin;
            self.app.clock.setTime(Math.round(time));
          }
        },
      });
    }
    self.app.clock.on('timeChanged', function (time: number) {
      self.updateTime(time);
    });
    self.loadSection(self);

    // listen for window resize events
    window.onresize = () => {
      self.redraw();
    };
  }
  updateTime(time: number) {
    const self = this;
    var range = self.rangeMax - self.rangeMin;
    // update timeline events
    this.showTimelineEvents(time);
  }

  loadTimeline(timeSliderInstance: any) {
    timeSliderInstance.timeline = timeSliderInstance.app.timeline;

    // var $content = $('.timeslider-content', this.$container);

    // $content.empty();

    if (timeSliderInstance.timeline.section.length === 0) {
      return;
    }

    var defaultId = 0;
    for (var i = 0; i < timeSliderInstance.timeline.section.length; i++) {
      var isDefault = false;
      if (
        timeSliderInstance.timeline.section[i].name ===
        timeSliderInstance.timeline.defaultsection
      ) {
        isDefault = true;
        defaultId = i;
      }
    }

    timeSliderInstance.redrawContent();
    timeSliderInstance.redrawSlider(timeSliderInstance);

    timeSliderInstance.sectionId = defaultId;
    timeSliderInstance.app.timeline.setCurrentSection(defaultId);
  }

  loadSection(instance: any) {
    const self = instance;
    self.dragger.set(-self.scrubberOffset, -55);
    const section = self.app.timeline.section[self.app.timeline.currentSection];
    if (section.axis?.start !== undefined && section.axis.end !== undefined) {
      self.rangeMin = section.axis?.start;
      self.rangeMax = section.axis?.end;
    }

    self.app.clock.minTime = self.rangeMin;
    self.app.clock.maxTime = self.rangeMax;

    let range = self.rangeMax - self.rangeMin;
    self.scrubberStep = range <= 100 ? 2 : range <= 1000 ? 5 : 10; //better way? in the timeline somewhere?

    self.findTimelineEvents(section.events);
    self.redrawSlider(self);
    self.redrawContent();

    // set time to 0 or the axis' start value if 0 is not within the range
    let startTime = 0.0;
    if (self.rangeMin > 0.0 || self.rangeMax < 0.0) {
      startTime = self.rangeMin;
    }

    self.updateTime(startTime); // need to call here manually because clock won't fire timeChanged event if already the same
    self.app.clock.setTime(startTime);
  }

  redrawContent() {
    const self = this;
    const content = document.querySelector('.timeline-range-wrapper');

    let section: ISection =
      self.app.timeline.section[self.app.timeline.currentSection];
    let sectionRange = 0;
    if (section && section.axis) {
      sectionRange = section.axis.end - section.axis.start;
    }
    let contentW = content?.clientWidth;
    let contentH = content?.clientHeight;

    let layers = section.ranges.map((el) => el.left);

    //Remove duplicate value and keep unique
    let uniqueLayers = layers.filter(function (item, pos) {
      return layers.indexOf(item) == pos;
    });

    let visibleTimelineDistance = 100;

    for (let i = 0; i < section.ranges.length; i++) {
      const range: IRange = section.ranges[i];

      const rangeDiv = document.createElement('div');
      if (
        contentW &&
        contentH &&
        section &&
        section.axis &&
        range.end - section.axis.end < visibleTimelineDistance
      ) {
        rangeDiv.className = 'timeline-range';
        // rangeDiv.innerHTML = range.name;
        rangeDiv.style.background = range.bgcolor;
        rangeDiv.style.border = '1px solid #000';
        content?.appendChild(rangeDiv);
        if (range.href) {
          let textLink = document.createElement('a');
          // textLink.href = range.href;
          textLink.innerHTML = range.name;
          rangeDiv.appendChild(textLink);
          textLink.style.display = 'inline-block';
          textLink.style.color = '#000';
          textLink.style.fontSize = '14px';
          textLink.style.fontWeight = '600';
          // if (range.labelrotation !== undefined) {
          //   textLink.style.transform =
          //     'rotate(' + (range.labelrotation - 270) + 'deg)';
          //   if (range.labelrotation - 270 > 0) {
          //     rangeDiv.style.height = '61%';
          //   }
          // }
        } else {
          let textSpan = document.createElement('span');
          textSpan.innerHTML = range.name;
          textSpan.style.display = 'inline-block';
          rangeDiv.appendChild(textSpan);
          textSpan.style.color = '#000';
          textSpan.style.fontSize = '14px';
          textSpan.style.fontWeight = '600';

          // if (range.labelrotation !== undefined) {
          //   textSpan.style.transform =
          //     'rotate(' + (range.labelrotation - 270) + 'deg)';
          //   if (range.labelrotation - 270 > 0) {
          //     rangeDiv.style.height = '61%';
          //   }
          // }
        }
        let rangeLeft = (range.start / sectionRange) * 100; //Calculate percent of container
        // let rangeWidth = (range.right - range.left) * contentW - 2; // -2 for borders
        // let rangeLeft =
        //   ((range.start - section.axis.start) / sectionRange) * contentH;
        var rangeTop =
          ((range.start - section.axis.start) / sectionRange) * contentH;
        let rangeWidth = ((range.end - range.start) / sectionRange) * contentW; // -2 for borders
        let rangeHeight = contentH / uniqueLayers.length;
        const rangeTopOffset = uniqueLayers.findIndex(
          (el) => el === range.left
        );
        rangeDiv.style.left = `${rangeLeft.toString()}%`;
        rangeDiv.style.width = `${rangeWidth.toString()}px`;
        rangeDiv.style.top = `${rangeTopOffset * rangeHeight}px`;
        rangeDiv.style.lineHeight = rangeHeight + 'px';
        rangeDiv.style.backgroundColor = range.bgcolor;
      }
    }
  }

  redrawSlider(instance: any) {
    const self = instance;
    const section = self.app.timeline.section[self.app.timeline.currentSection];
    let axis = section.axis;

    document.querySelectorAll('.line').forEach((el) => {
      el.remove();
    });

    document.querySelectorAll('.label').forEach((el) => {
      el.remove();
    });
    let linebox = document.querySelector('.line-wrapper');
    let labelbox = document.querySelector('.label-wrapper');

    let totH = 1;
    if (labelbox !== null) {
      totH = labelbox?.clientWidth - this.scrubberOffset * 2;
    }
    let range = axis.end - axis.start;
    let rangeInPx = labelbox?.clientWidth;
    let numberOfLabel = Math.floor(range / axis.labelevery);
    let step = 0;
    if (rangeInPx) {
      step = rangeInPx / numberOfLabel;
    }

    let rulerNum = axis.start - axis.labelevery;
    if (range > 0) {
      // add numbers to ruler
      if (axis.labelevery > 0 && labelbox !== null) {
        for (let i = 0; i <= numberOfLabel; i++) {
          rulerNum += axis.labelevery;
          let markLeft = ((rulerNum - axis.start) / range) * (rangeInPx || 0);
          let label = document.createElement('div');
          label.className = 'label';
          label.innerHTML = Math.abs(rulerNum).toString();
          label.style.left = `${
            markLeft - (getlength(rulerNum) > 2 ? this.scrubberOffset : 0)
          }px`;
          labelbox.appendChild(label);
        }
      }

      // draw tick marks denoting imagery ranges
      let images = section.images;
      let stepMark = 0;
      if (rangeInPx) {
        stepMark = Math.floor(rangeInPx / images.length);
      }

      if (images) {
        for (let idx = 0; idx < images.length; idx++) {
          if (linebox !== null) {
            let tickLeft =
              ((images[idx].offset - axis.start) / range) * (rangeInPx || 0);
            let line = document.createElement('div');
            line.className = 'line';
            line.style.left = `${tickLeft}px`;
            if (
              images[idx].offset / axis.labelevery >= 1 &&
              (images[idx].offset / axis.labelevery) % 1 === 0
            ) {
              line.style.height = '80%';
              line.style.background = '#eee';
            }
            linebox.appendChild(line);
          }
        }
      }
    }

    //Mark event on slider
    document.querySelectorAll('.event-marker').forEach((el) => {
      el.remove();
    });

    document.querySelectorAll('.event-popup').forEach((el) => {
      el.remove();
    });

    let sliderBox = document.querySelector('.bottom-slider');
    let eventsBox = document.querySelector('.event-wrapper') as HTMLDivElement;
    if (this.timelineEvents && eventsBox) {
      //Filter the events
      let events = self.app.eventFilter.filter(this.timelineEvents);

      for (let i = 0; i < events.length; i++) {
        let currentEvent = events[i];
        let eventLeft = (currentEvent.offset / range) * totH;
        let colorStr = currentEvent.tags.replace(/,/g, ' ');
        let eventElement = document.createElement('div');
        eventElement.className = `event-marker ${colorStr}`;
        eventElement.style.left = `${eventLeft}px`;
        eventElement.style.top = `-6px`;

        sliderBox?.appendChild(eventElement);

        let eventPopup = document.createElement('div');
        eventPopup.className = 'event-popup';
        eventPopup.style.color = `${colorStr}`;
        eventPopup.classList.add('inactive');
        eventPopup.classList.add('overlay-link');
        eventPopup.setAttribute('data-name', currentEvent.name);
        eventPopup.setAttribute('data-left', `${eventLeft}px`);
        eventPopup.innerText = currentEvent.name;
        eventPopup.setAttribute(
          'data-href',
          `${config.apiHost}/${currentEvent.href}`
        );
        eventPopup.setAttribute('data-offset', currentEvent.offset);
        // eventPopup.style.position = 'absolute';

        // Attach the event object to the popup.
        eventPopup.setAttribute('data', currentEvent.name);
        if (eventsBox) {
          eventsBox.append(eventPopup);
        }
      }

      let section = this.app.timeline.section[this.app.timeline.currentSection];

      document.querySelectorAll('.event-popup').forEach((el) => {
        el.addEventListener('click', function () {
          let eventName = el.getAttribute('data-name');
          let offset = Number(el.getAttribute('data-offset'));
          let event = null;
          // This is a timeline event, so it's not going to have a lat/lon.  In this case let's zoom over all of the events and try to find one
          // that has the same name but has a lat/lon so we can zoom to it.
          for (let j = 0; j < section.events.length; j++) {
            let e = section.events[j];
            if (
              e.name == eventName && // Same name
              !isNaN(e.lon) &&
              !isNaN(e.lat) && // Has a valid location
              !isNaN(e.start) &&
              !isNaN(e.end) &&
              e.start <= offset &&
              e.end >= offset // Has a time range
            ) {
              //It's the event that matches this timeline event's offset
              event = e;
              break;
            }
          }
          self.app.showEvent(event);
        });
      });
    }
  }

  redraw() {
    this.redrawContent();
    this.redrawSlider(this);
  }

  findTimelineEvents(events: any[]) {
    let eventRegex = new RegExp('(^|,)s*timelines*($|,)', 'i');
    this.timelineEvents = events.filter((el) => eventRegex.test(el.tags));
  }

  showTimelineEvents(time: any) {
    let self = this;
    let errorNum = 30;

    var showTime = -1.0;

    let eventWrapper = document.querySelector('.event-wrapper');

    document.querySelectorAll('.event-popup').forEach((el) => {
      let offset = Number(el.getAttribute('data-offset'));
      //TODO: change test below to something more reasonable??? some percentage of range perhaps???
      let visible =
        Math.abs(time.time - offset) <
        (self.scrubberStep < 10
          ? self.scrubberStep
          : self.scrubberStep - errorNum);
      if (visible && showTime < 0.0) {
        showTime = offset;
      }
      if (visible) {
        el.classList.remove('inactive');
      } else {
        el.classList.add('inactive');
      }
    });

    if (showTime > 0.0) {
      let rulerbox = document.querySelector('.bottom-slider');
      if (rulerbox) {
        let totH = rulerbox.clientWidth - this.scrubberOffset * 2;
        let range = this.rangeMax - this.rangeMin;
        let eventLeft = (showTime / range) * totH;
        (eventWrapper as HTMLDivElement).style.left = `${eventLeft - 50}px`;
      }
    }
  }
}
