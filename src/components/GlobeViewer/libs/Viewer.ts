import Snowball from '../../../assets/images/snowball.jpg';
import TimeSlider from '../../MainSlider/libs/TimeSlider';
import { IImage, ISection } from '../interface/ISection';
import Section from './section';
import Clock from '../../MainSlider/libs/Clock';
import { config } from '../../../config';
import TimeLine from '../../MainSlider/libs/TimeLine';
import TagFilter from '../../MainSlider/libs/TagFilter';
import EventIcons from '../../MainSlider/libs/EventIcons';
import DataHud from '../../MainSlider/libs/DataHud';
import axios from 'axios';

const Cesium = (window as any).Cesium;
export default class Viewer {
  viewer: any;
  clock: any;
  timeline: any;
  titled: boolean;
  section?: ISection;
  chartVisible: boolean;
  overlayVisible: boolean;
  highResLayer: any;
  checkHighResTimeout: any;
  animating: boolean;
  loadHighResTimeout: any;
  activeLayer?: any;
  graticule?: any;
  timeSlider?: any;
  coastlines: any;
  eventFilter: any;
  flyTo?: any;
  eventIcons: any;
  datahud: any;

  constructor(conf: any) {
    this.titled = true;
    this.clock = new Clock();
    this.eventFilter = new TagFilter();
    this.timeline = new TimeLine(conf, this);
    this.timeSlider = new TimeSlider(this);
    this.init();
    this.datahud = new DataHud(this);
    this.eventIcons = new EventIcons(this);
    this.section = new Section(
      this.timeline.section[this.timeline.currentSection]
    );

    this.timeline.on('loaded', () => {
      this.loadImage(this);
    });
    this.timeline.on('sectionChanged', () => {
      this.onSectionChanged(this);
    });

    this.loadImage(this);
    this.clock.on('timeChanged', () => {
      this.updateImage(this);
    });
    this.chartVisible = false;
    this.overlayVisible = false;
    this.highResLayer = null;
    this.checkHighResTimeout = null;
    this.animating = false;
    this.loadHighResTimeout = null;
  }

  async init() {
    this.viewer = new Cesium.Viewer('cesiumContainer', {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      skyAtmosphere: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      // We only want a 3D scene.
      scene3DOnly: true,
      // We just load something as a placeholder here, this will get wiped out when all the images are loaded later.
      imageryProvider: new Cesium.SingleTileImageryProvider({
        url: Snowball,
        rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
        hasAlphaChannel: false,
      }),
    });

    //Hide logo
    this.viewer._cesiumWidget._creditContainer.style.display = 'none';

    // Hide the star field.
    this.viewer.scene.skyBox.show = false;

    // Hide the moon.
    this.viewer.scene.moon.show = false;

    // Disable lighting and the sun rendering.
    this.viewer.scene.globe.enableLighting = false;
    this.viewer.scene.sun.show = false;

    // Increase the maximum screen space error so that we draw less tiles.
    this.viewer.scene.globe.maximumScreenSpaceError = 50;

    // Cool wireframe debugger
    //this.viewer.scene.globe._surface.tileProvider._debug.wireframe = true;

    // This is how you would tweak the FOV of the viewer if you wanted to.
    // this.viewer.scene.camera.frustum.fov = Cesium.Math.toRadians(45);

    this.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 8375000.0;
    this.viewer.scene.screenSpaceCameraController.maximumZoomDistance = 35000000.0;

    //this.viewer.resolutionScale = 1.0 / devicePixelRatio;

    // Disable tilt
    this.viewer.scene.screenSpaceCameraController.enableLook = false;

    // Disable the double click on entity action
    this.viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    );
    this.viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_CLICK
    );

    document.querySelectorAll('.overlay-link').forEach((el) => {
      el.addEventListener('click', () => {
        let href = el.getAttribute('data-href');
        let width = Number(el.getAttribute('width'));

        if (href) {
          this.showOverlay(href, width);
        }
      });
    });

    document.querySelectorAll('#info_overlay_close').forEach((el) => {
      el.addEventListener('click', () => {
        this.hideOverlay();
      });
    });

    this.createGraticule();

    const res = await axios.get(
      `${config.apiHost}/Resources/ne_110m_coastline.json`
    );

    this.coastlines = this.viewer.scene.primitives.add(
      new Cesium.PolylineCollection()
    );

    let coastlinesMaterial = Cesium.Material.fromType('Color');
    coastlinesMaterial.uniforms.color = Cesium.Color.YELLOW;

    // Loop over all the features
    for (var i = 0; i < res.data.features.length; i++) {
      var feature = res.data.features[i];
      var positions = [];
      for (var j = 0; j < feature.geometry.coordinates.length; j++) {
        positions.push(
          feature.geometry.coordinates[j][0],
          feature.geometry.coordinates[j][1]
        );
      }
      var polyline = this.coastlines.add({
        positions: Cesium.Cartesian3.fromDegreesArray(positions),
        material: coastlinesMaterial,
        width: 2.0,
      });
      polyline.show = false;
    }
  }

  hideOverlay() {
    document.querySelector('#info_overlay')?.classList.add('inactive');

    document.querySelector('#info_overlay_content')?.setAttribute('src', '');

    this.overlayVisible = false;
  }

  onSectionChanged(app: any) {
    app.loadImage(app);
  }

  checkImageryLayers() {
    let numLoaded = 0;
    let total = this.viewer.scene.imageryLayers.length;

    for (let i = 0; i < this.viewer.scene.imageryLayers.length; i++) {
      if (this.viewer.scene.imageryLayers.get(i).imageryProvider.ready) {
        numLoaded += 1;
      }
    }

    console.log('Waiting on ' + total + ' images loaded=' + numLoaded);

    let loaded = numLoaded === total;
    let percentComplete = Math.round((numLoaded / total) * 100.0);
    if (percentComplete < 0) percentComplete = 0;
    if (percentComplete > 100) percentComplete = 100;

    const loadProgress = document.getElementById('main_loadprogress');
    if (loadProgress !== null) {
      loadProgress.innerHTML = `Loading...<br/> ${percentComplete}%`;
    }

    const splashScreen = document.getElementById('main_splashscreen');

    if (splashScreen !== null && !loaded) {
      splashScreen.style.display = 'block';
      setTimeout(this.checkImageryLayers, 10);
    }
  }

  loadImage(app: any) {
    //remove all existing imagery layers
    app.viewer.scene.imageryLayers.removeAll();

    //Get the current section
    let section: ISection = app.timeline.section[app.timeline.currentSection];
    for (let i = 0; i < section.images.length; i++) {
      let image: IImage = section.images[i];

      let layer = null;
      if (!app.titled) {
        // Load a single image source
        let url = `${config.apiHost}Resources/Images/Small/${image.src}.jpg`;

        layer = app.viewer.scene.imageryLayers.addImageryProvider(
          new Cesium.SingleTileImageryProvider({
            url: url,
            rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
          })
        );
      } else {
        layer = app.viewer.scene.imageryLayers.addImageryProvider(
          new Cesium.TileMapServiceImageryProvider({
            url: `${config.apiHost}/Resources/Images/Small_Tiled/${image.src}`,
            tilingScheme: new Cesium.GeographicTilingScheme(),
            fileExtension: 'jpg',
            maximumLevel: 0,
          })
        );
      }

      layer.image = image;
      image.layer = layer;
    }

    app.updateImage(app);
  }

  removeHighRes() {
    if (this.highResLayer) {
      this.viewer.scene.imageryLayers.remove(this.highResLayer);
      this.highResLayer = null;
    }
  }

  checkHighRes() {
    // Cancel the existing timeout if we have one pending.
    if (this.checkHighResTimeout) {
      clearTimeout(this.checkHighResTimeout);
      this.checkHighResTimeout = null;
    }

    // If the layer is ready, add it to the scene.
    if (this.highResLayer) {
      this.highResLayer.alpha = 1.0;
      this.viewer.scene.imageryLayers.add(this.highResLayer);
      // Hide all of the other layers
      for (var i = 0; i < this.viewer.scene.imageryLayers.length; i++) {
        var l = this.viewer.scene.imageryLayers.get(i);
        if (l != this.highResLayer) {
          l.alpha = 0.0;
        }
      }
      this.checkHighResTimeout = null;
    } else {
      // Check again later.
      this.checkHighResTimeout = setTimeout(this.checkHighRes, 5);
    }
  }

  loadHighRes() {
    if (this.activeLayer && this.activeLayer.image) {
      if (!this.titled) {
        this.highResLayer = new Cesium.ImageryLayer(
          new Cesium.SingleTileImageryProvider({
            url: `${config.apiHost}/Resources/Images/Full_Tiled/${this.activeLayer.image.src}.jpg`,
            rectangle: Cesium.Rectangle.fromDegrees(-180, -90, 180, 90),
            hasAlphaChannel: false,
          })
        );
      } else {
        this.highResLayer = new Cesium.ImageryLayer(
          new Cesium.TileMapServiceImageryProvider({
            url: `${config.apiHost}/Resources/Images/Full_Tiled/${this.activeLayer.image.src}`,
            tilingScheme: new Cesium.GeographicTilingScheme(),
            fileExtension: 'jpg',
            maximumLevel: 0,
          })
        );
      }

      this.highResLayer.alpha = 1.0;
      this.checkHighRes();
      this.loadHighResTimeout = null;
    }
  }

  updateImage(app: any) {
    const self = this;
    let t = app.clock.time;
    // Find the layer that should be visible
    let section: ISection = app.timeline.section[app.timeline.currentSection];
    let prevActiveLayer = app.activeLayer;

    // Figure out the active image.
    for (let i = section.images.length - 1; i >= 0; i--) {
      let image = section.images[i];
      if (image.offset != undefined && image.offset <= t) {
        app.activeLayer = image.layer;
        if (app.activeLayer && app.activeLayer.alpha != undefined) {
          app.activeLayer.alpha = 1.0;
        }
        break;
      }
    }

    let activeLayerChanged = prevActiveLayer != app.activeLayer;

    // Remove any existing high res layer if the layer has changed.
    if (activeLayerChanged) {
      app.removeHighRes();
    }

    // Load the high res layer if necessary.
    if (!app.animating && (activeLayerChanged || !app.highResLayer)) {
      app.removeHighRes();
      if (app.loadHighResTimeout) {
        clearTimeout(app.loadHighResTimeout);
        app.loadHighResTimeout = null;
      }
      app.loadHighResTimeout = setTimeout(function () {
        console.log('Loading high res');
        app.loadHighRes();
      }, 500);
      app.loadHighRes();
    }
  }

  startAnimating() {
    if (!this.animating) {
      this.animating = true;
      this.removeHighRes();
      this.updateImage(this);
    }
  }

  stopAnimating() {
    if (this.animating) {
      this.animating = false;
      this.removeHighRes();
      this.updateImage(this);
    }
  }

  createGraticule() {
    // Create a simple graticule
    this.graticule = this.viewer.scene.primitives.add(
      new Cesium.PolylineCollection()
    );
    var i = 0;
    var j = 0;
    var spacing = 10.0;
    var samples = 30.0;
    var numLatLines = 180.0 / spacing;
    var numLonLines = 360.0 / spacing;

    var latSpacing = 180.0 / samples;
    var lonSpacing = 360.0 / samples;

    var lon = 0;
    var lat = 0;
    var positions = null;

    var width = 2.0;

    var gridMaterial = Cesium.Material.fromType('Color');
    gridMaterial.uniforms.color = new Cesium.Color(0.6, 0.6, 0.6, 1.0);
    // Latitude lines
    for (i = 0; i <= numLatLines; i++) {
      lat = -90.0 + i * spacing;
      if (lat != -90.0 && lat != 90.0) {
        positions = [];
        for (j = 0; j <= samples; j++) {
          positions.push(-180.0 + j * lonSpacing, lat);
        }
        this.graticule.add({
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          material: gridMaterial,
          width: 1.0,
        });
      }
    }

    // Longitude lines
    for (i = 0; i <= numLonLines; i++) {
      lon = -180.0 + i * spacing;
      if (lon != 180.0) {
        positions = [];
        for (j = 0; j <= samples; j++) {
          positions.push(lon, -90.0 + j * latSpacing);
        }
        this.graticule.add({
          positions: Cesium.Cartesian3.fromDegreesArray(positions),
          material: gridMaterial,
          width: 2.0,
        });
      }
    }
  }

  showGraticule() {
    var len = this.graticule.length;
    for (var i = 0; i < len; ++i) {
      var p = this.graticule.get(i);
      p.show = true;
    }
  }

  hideGraticule() {
    var len = this.graticule.length;
    for (var i = 0; i < len; ++i) {
      var p = this.graticule.get(i);
      p.show = false;
    }
  }

  hideCoastLines() {
    var len = this.coastlines.length;
    for (var i = 0; i < len; ++i) {
      var p = this.coastlines.get(i);
      p.show = false;
    }
  }
  showCoastLines() {
    var len = this.coastlines.length;
    for (var i = 0; i < len; ++i) {
      var p = this.coastlines.get(i);
      p.show = true;
    }
  }

  showOverlay(href: string, width?: number, dismissProp?: any) {
    let overlayEl = document.getElementById('info_overlay');
    overlayEl?.classList.remove('inactive');
    let overlayContent = document.getElementById('info_overlay_content');
    if (overlayEl && overlayContent) {
      // overlayEl.style.width = '40%';
    }

    if (width && overlayEl) {
      overlayEl?.classList.add('fixedsize');
      overlayEl.style.width = `${width}`;
    }

    if (dismissProp && overlayEl) {
      overlayEl?.classList.add('dismissible');
      overlayEl.style.width = `${width}`;
      overlayEl.setAttribute('dismissProp', dismissProp);
    }

    if (overlayContent) {
      overlayContent.setAttribute(
        'src',
        `${config.apiHost}/${href}&output=embed`
      );
    }

    if (overlayEl) {
      overlayEl.style.display = 'block';
    }
    this.overlayVisible = true;
  }

  showEvent(event: any) {
    let eventHeight = this.viewer.camera.positionCartographic.height;
    if (event.href && event.href.length > 0 && event.href !== 'No data') {
      this.showOverlay(event.href);
    }
    // Zoom the camera to the event.
    if (!isNaN(event.lon) && !isNaN(event.lat)) {
      let ellipsoid = this.viewer.scene.globe.ellipsoid;
      let cameraHeight = ellipsoid.cartesianToCartographic(
        this.viewer.camera.position
      ).height;

      // Cancel any existing flyTo
      if (this.flyTo) {
        this.flyTo.cancel();
        this.flyTo = null;
      }

      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          event.lon,
          event.lat,
          eventHeight
        ),
      });
    }
  }
}
