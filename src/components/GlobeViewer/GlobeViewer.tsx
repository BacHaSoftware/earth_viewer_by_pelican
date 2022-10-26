import axios from 'axios';
import { useEffect, useRef } from 'react'
import { config } from '../../config';
import { loadMenu, loadSection } from '../../helpers/dataLoader';
import Menu from '../MainSlider/libs/Menu';
import MenuTools from '../MenuTools';
import { ISection } from './interface/ISection';
import Viewer from './libs/Viewer';

const GlobeViewer = () => {
    const ref = useRef<HTMLDivElement>(null);
    const cesiumRef = useRef();
    useEffect(() => {
        const initialise = async () => {
            try {
                const res = await axios.get(`${config.apiHost}/Resources/metadata.bundle/timeline.xml`);
                const parser = new DOMParser();
                const doc = parser.parseFromString(res.data, "application/xml");

                //Load Defaut Section
                let defaultsection = doc.querySelector('timeline')?.getAttribute('defaultsection');

                //Load Menu
                let menus: Menu[] = [];
                doc.querySelectorAll('menu').forEach(el => {
                    let menu: Menu = loadMenu(el);

                    menus.push(menu);
                });

                //Load Section
                let sections: ISection[] = [];
                doc.querySelectorAll('section').forEach(el => {
                    let section = loadSection(el);

                    sections.push(section);
                });

                // Load all the datasources
                for (var i = 0; i < sections.length; i++) {
                    var section = sections[i];
                    for (var j = 0; j < section.datasources.length; j++) {
                        var datasource = section.datasources[j];
                        datasource.loadData();
                    }
                }

                //Check all datasources is ready
                let loaded = true;
                for (var i = 0; i < sections.length; i++) {
                    var section = sections[i];
                    for (var j = 0; j < section.datasources.length; j++) {
                        var datasource = section.datasources[j];
                        if (!datasource) {
                            loaded = false;
                            break;
                        }
                    }
                    for (var k = 0; k < section.palettes.length; k++) {
                        var palette = section.palettes[k];
                        if (!palette) {
                            loaded = false;
                            break;
                        }
                    }
                    if (!loaded) {
                        break;
                    }
                }

                (ref.current as any).innerHTML = `<div style="width : 100%; height : 100%" id="cesiumContainer" />`;

                if (ref.current) {
                    (cesiumRef.current as any) = new Viewer({
                        defaultsection,
                        menus,
                        sections,
                        loaded
                    })
                }


            } catch (error) {

            }
        }
        initialise();
    }, [])
    return (
        <div style={{ height: 'calc(100vh - 242px)' }}>
            <div className="cesium-page" ref={ref}></div>
            <MenuTools />

            <div id="main_hud"></div>
        </div>
    )
}

export default GlobeViewer