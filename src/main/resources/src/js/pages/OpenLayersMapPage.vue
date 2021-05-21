

 <template>
    <div>
        <div>
            <div id="updateButton">
                Hi, i'm a map!
                <button @click="updateMapData">update</button>
                <button @click="changeRotation">change rotation</button>
            </div>
            <div id="mapOL"></div>
            <div id="popup" class="ol-popup">
                <a href="#" id="popup-closer" class="ol-popup-closer"></a>
                <div id="popup-content"></div>
            </div>
        </div>
        <div id="check">
            <div>
                <input id="visible1" class="visible" type="checkbox" v-model="osmVisible" @click="setVisibleOSM"/>visibility
                OSM
                <div>
                    opacity OSM<input id="opacity1" type="range" v-model="osmOpacity" min="0" max="1" step="0.01"
                                      @change="osmChangeOpacity"/>
                </div>
            </div>
            <div>
                <input id="visible2" class="visible" type="checkbox" v-model="satelliteVisible"
                       @click="setVisibleSatellite"/>visibility Satellite
                <div>
                    opacity Satellite<input id="opacity2" type="range" v-model="satelliteOpacity" min="0" max="1"
                                            step="0.01" @change="satelliteChangeOpacity">
                </div>
            </div>
            <div>
                <input id="visible3" class="visible" type="checkbox" v-model="shapesVisible" @click="setVisibleShapes"/>visibility
                Shape
                <div>
                    opacity Shape<input id="opacity3" type="range" v-model="shapeOpacity" min="0" max="1" step="0.01"
                                        @change="shapeChangeOpacity"/>
                </div>
            </div>
            <div>
                <input id="visible4" class="visible" type="checkbox" v-model="targetsVisible"
                       @click="setVisibleTargets"/>visibility Targets
                <div>
                    opacity Shape<input id="opacity4" type="range" v-model="targetsOpacity" min="0" max="1" step="0.01"
                                        @change="targetsChangeOpacity"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import $ from 'jquery';
    import 'ol/ol.css';
    import {Map, View, Feature} from 'ol';
    import TileLayer from 'ol/layer/Tile';
    import VectorLayer from 'ol/layer/Vector';
    import VectorSource from 'ol/source/Vector';
    import OSM from 'ol/source/OSM';
    import XYZ from 'ol/source/XYZ';
    import Projection from 'ol/proj/Projection';
    import {fromLonLat} from 'ol/proj';
    import {toLonLat} from 'ol/proj';
    import {toStringHDMS} from 'ol/coordinate';
    import Draw from 'ol/interaction/Draw';
    import Polyline from 'ol/geom/LineString';
    import Circle from 'ol/geom/Circle';
    import Point from 'ol/geom/Point';
    import LineString from 'ol/geom/LineString';
    import MultiLineString from 'ol/geom/MultiLineString';
    import CircleStyle from 'ol/style/Circle';
    import Stroke from 'ol/style/Stroke';
    import Style from 'ol/style/Style';
    import Fill from 'ol/style/Fill';
    import Icon from 'ol/style/Icon';
    import RegularShape from 'ol/style/RegularShape';
    import GeoJSON from 'ol/format/GeoJSON';
    import Overlay from 'ol/Overlay';

    export default {
        name: "OpenLayersMapPage",
        data() {
            return {
                map: null,
                vectorLayer: null,
                targetsLayer: null,
                osmTileLayer: null,
                satelliteMap: null,
                vectorSource: null,
                targetsSource: null,
                popup: null,
                osmVisible: true,
                satelliteVisible: false,
                shapesVisible: false,
                targetsVisible: false,
                points: [],
                targets: [],
                styles: [],
                osmOpacity: 1.0,
                satelliteOpacity: 1.0,
                shapeOpacity: 1.0,
                targetsOpacity: 1.0,
                iconFeature: null
            }
        },
        created() {
            this.getTargets();
        },
        mounted() {
            var image = new CircleStyle({
                radius: 5,
                fill: null,
                stroke: new Stroke({color: 'red', width: 1})
            });

            var stroke = new Stroke({color: 'red', width: 1});
            var fill = new Fill({color: 'red'});

            var styles = {
                'Point': new Style({
                    image: image
                }),
                'LineString': new Style({
                    stroke: new Stroke({
                        color: 'green',
                        width: 1
                    })
                }),
                'MultiLineString': new Style({
                    stroke: new Stroke({
                        color: 'green',
                        width: 1
                    })
                }),
                'MultiPoint': new Style({
                    image: image
                }),
                'MultiPolygon': new Style({
                    stroke: new Stroke({
                        color: 'yellow',
                        width: 1
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 255, 0, 0.1)'
                    })
                }),
                'Polygon': new Style({
                    stroke: new Stroke({
                        color: 'blue',
                        lineDash: [4],
                        width: 3
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 0, 255, 0.1)'
                    })
                }),
                'GeometryCollection': new Style({
                    stroke: new Stroke({
                        color: 'magenta',
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'magenta'
                    }),
                    image: new CircleStyle({
                        radius: 10,
                        fill: null,
                        stroke: new Stroke({
                            color: 'magenta'
                        })
                    })
                }),
                'Circle': new Style({
                    stroke: new Stroke({
                        color: 'red',
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'rgba(255,0,0,0.2)'
                    })
                })
            };

            var styleFunction = function (feature) {
                return styles[feature.getGeometry().getType()];
            };

            var geojsonObject = {
                'type': 'FeatureCollection',
                'crs': {
                    'type': 'name',
                    'properties': {
                        'name': 'EPSG:3857'
                    }
                },
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': [[[-5e6, -1e6], [-4e6, 1e6], [-3e6, -1e6]]]
                    }
                }, {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'MultiLineString',
                        'coordinates': [
                            [[-1e6, -7.5e5], [-1e6, 7.5e5]],
                            [[1e6, -7.5e5], [1e6, 7.5e5]],
                            [[-7.5e5, -1e6], [7.5e5, -1e6]],
                            [[-7.5e5, 1e6], [7.5e5, 1e6]]
                        ]
                    }
                }, {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'MultiPolygon',
                        'coordinates': [
                            [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
                            [[[-2e6, 6e6], [-2e6, 8e6], [0, 8e6], [0, 6e6]]],
                            [[[1e6, 6e6], [1e6, 8e6], [3e6, 8e6], [3e6, 6e6]]]
                        ]
                    }
                }, {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'GeometryCollection',
                        'geometries': [{
                            'type': 'LineString',
                            'coordinates': [[-5e6, -5e6], [0, -5e6]]
                        }, {
                            'type': 'Point',
                            'coordinates': [4e6, -5e6]
                        }, {
                            'type': 'Polygon',
                            'coordinates': [[[1e6, -6e6], [2e6, -4e6], [3e6, -6e6]]]
                        }]
                    }
                }]
            };

            this.vectorSource = new VectorSource({
                features: new GeoJSON().readFeatures(geojsonObject)
            })

            this.iconFeature = new Feature({
                geometry: new Point(fromLonLat([37.616667, 55.75])),
                name: 'MOSCOW',
                population: 4000,
                rainfall: 500,
            });

            var iconStyle = new Style({
                image: new Icon({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    src: 'http://localhost:8101/icon.png',
                    scale: 1
                })
            });

            this.iconFeature.setStyle(iconStyle);

            // составной объект
            /*var stackedStyle = [
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 3,
                        radius: 16,
                        // angle: Math.PI / 4,
                        displacement: [0, 0],
                    })
                }),
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 4,
                        radius: 20,
                        angle: Math.PI / 4,
                        displacement: [0, -23],
                        rotation: Math.PI / 4
                    })
                })];*/

            var stackedStyle = [
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 2,
                        radius: 16,
                        rotation: Math.PI / 4,
                        displacement: [0, 0],
                    })
                }),
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 2,
                        radius: 16,
                        // angle: Math.PI / 4,
                        displacement: [16, 0],
                        rotation: Math.PI / 4

                    })
                }),
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 2,
                        radius: 8,
                        angle: Math.PI / 2,
                        displacement: [8, -16],
                        rotation: Math.PI / 4

                    })
                }),
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 2,
                        radius: 6,
                        angle: Math.PI / 4,
                        displacement: [4, 20],
                        rotation: Math.PI / 4
                    })
                }),
                new Style({
                    image: new RegularShape({
                        // fill: fill,
                        stroke: stroke,
                        points: 2,
                        radius: 6,
                        angle: 3 * Math.PI / 4,
                        displacement: [12, 20],
                        rotation: Math.PI / 4
                    })
                })
            ];

            var stackedFeature = new Feature(new Point(fromLonLat([0, 0])));
            stackedFeature.setStyle(stackedStyle);


            this.vectorSource.addFeature(new Feature({
                geometry: new Circle([5e6, 7e6], 1e6),
                info: 'CIRCLE'
            }));
            this.vectorSource.addFeature(this.iconFeature);


            this.vectorLayer = new VectorLayer({
                source: this.vectorSource,
                style: styleFunction,
                zIndex: 3,
                visible: this.shapesVisible
            });

            this.osmTileLayer = new TileLayer({
                source: new OSM(),
                zIndex: 1,
                visible: this.osmVisible,
                opacity: this.osmOpacity
            });

            var key = 'sBuhkVxMVajBjg05ybfC';
            var attributions = '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

            this.satelliteMap = new TileLayer({
                source: new XYZ({
                    attributions: attributions,
                    url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=' + key,
                    maxZoom: 20
                }),
                zIndex: 2,
                visible: this.satelliteVisible
            });


            this.targetsSource = new VectorSource();
            this.targetsSource.addFeature(stackedFeature);

            this.targetsLayer = new VectorLayer({
                source: this.targetsSource,
                zIndex: 4,
                visible: this.targetsVisible,
                // style: stackedStyle
            });


            this.map = new Map({
                target: 'mapOL',
                layers: [
                    this.osmTileLayer,
                    this.vectorLayer,
                    this.satelliteMap,
                    this.targetsLayer
                ],
                view: new View({
                    center: [0, 0],
                    zoom: 2
                })
            });

            var element = document.getElementById('popup');

            var localPopup = new Overlay({
                element: element,
                positioning: 'bottom-center',
                stopEvent: false,
                offset: [0, -50]
            });
            this.map.addOverlay(localPopup);

            this.map.on('click', function (evt) {
                var feature = this.forEachFeatureAtPixel(evt.pixel,
                    function (feature) {
                        return feature;
                    });
                if (feature) {
                    console.log(feature)
                    var coord = this.getCoordinateFromPixel(evt.pixel);
                    document.getElementById('popup-content').innerHTML = '<p>' + feature.values_.info.name + ' </p>'
                    localPopup.setPosition(coord);
                } else {
                    document.getElementById('popup').popover('destroy');
                    console.log('not feature')
                }
            });


        },
        methods: {
            getTargets() {
                this.$resource("http://localhost:8092/v1/info/ais/target/last?period=1800").get()
                    .then(result => {
                        if (result.body)
                            result.json().then(data => {
                                this.targets = data;
                            });
                        else
                            this.targets = null;
                    })
            },
            updateMapData() {
                this.targets.forEach(t => {
                    var iconStyle = new Style({
                        image: new Icon({
                            anchor: [0.5, 0],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            scale: 0.5,
                            color: 'red',
                            src: 'http://localhost:8101/ship.png',
                            rotation: t.course * Math.PI / 180,
                        })
                    });

                    var geom = new Point(fromLonLat([t.lon, t.lat]));
                    var feature = new Feature({
                        geometry: geom,
                        info: t,
                    });
                    feature.setStyle(iconStyle);
                    this.targetsSource.addFeature(feature);
                    // this.points.push(feature);
                })
            },
            changeRotation() {
                if (this.iconFeature.getStyle().getImage().getRotation() + Math.PI / 6 > Math.PI) {
                    this.iconFeature.getStyle().setImage(new Icon({
                        src: 'http://localhost:8101/ship.png',
                        rotation:
                            this.iconFeature.getStyle().getImage().getRotation(),
                        anchor: [0.5, 0],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        scale: 0.5,
                        color: 'red'
                    }));
                } else {
                    this.iconFeature.getStyle().setImage(new Icon({
                        src: 'http://localhost:8101/icon.png',
                        rotation: this.iconFeature.getStyle().getImage().getRotation(),
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                    }));
                }
                this.iconFeature.getStyle().getImage().setRotation(this.iconFeature.getStyle().getImage().getRotation() + Math.PI / 6)
                if(this.iconFeature.getStyle().getImage().getRotation() > 2 * Math.PI){
                    this.iconFeature.getStyle().getImage().setRotation(this.iconFeature.getStyle().getImage().getRotation() -  2 * Math.PI)
                }
                this.vectorLayer.getSource().changed();
            },
            setVisibleOSM() {
                this.osmTileLayer.setVisible(!this.osmVisible)
            },
            setVisibleSatellite() {
                this.satelliteMap.setVisible(!this.satelliteVisible)
            },
            setVisibleShapes() {
                this.vectorLayer.setVisible(!this.shapesVisible)
            },
            setVisibleTargets() {
                this.targetsLayer.setVisible(!this.targetsVisible)
            },
            osmChangeOpacity() {
                this.osmTileLayer.setOpacity(parseFloat(this.osmOpacity));
            },
            satelliteChangeOpacity() {
                this.satelliteMap.setOpacity(parseFloat(this.satelliteOpacity));
            },
            shapeChangeOpacity() {
                this.vectorLayer.setOpacity(parseFloat(this.shapeOpacity));
            },
            targetsChangeOpacity() {
                this.targetsLayer.setOpacity(parseFloat(this.targetsOpacity));
            }
        }
    }
</script>

<style scoped>
    #mapOL {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 250px;
        top: 50px;
    }

    #check {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
    }

    #updateButton {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
    }

    .ol-popup {
        position: absolute;
        background-color: white;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
        padding: 15px;
        border-radius: 10px;
        border: 1px solid #cccccc;
        bottom: 12px;
        left: -50px;
        min-width: 280px;
    }

    .ol-popup:after, .ol-popup:before {
        top: 100%;
        border: solid transparent;
        content: " ";
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;
    }

    .ol-popup:after {
        border-top-color: white;
        border-width: 10px;
        left: 48px;
        margin-left: -10px;
    }

    .ol-popup:before {
        border-top-color: #cccccc;
        border-width: 11px;
        left: 48px;
        margin-left: -11px;
    }

    .ol-popup-closer {
        text-decoration: none;
        position: absolute;
        top: 2px;
        right: 8px;
    }

    .ol-popup-closer:after {
        content: "✖";
    }
</style>