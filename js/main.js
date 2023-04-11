// const url =["https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js","https://unpkg.com/element-ui/lib/index.js","http://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"]

// function addScript(url) {
//     document.write("<script language=javascript src=" + url + "></script>");
//     return url;
// }
// for (var i = 0; i < url.length; i++){
//     addScript(url[i]);
//     console.log(addScript(url[i]));
// }

import LineString from 'ol/geom/LineString';
import Multipoint from 'ol/geom/Multipoint';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
// import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import { Style, Stroke, Fill, Text, RegularShape, Circle} from 'ol/style';
import { Polygon, MultiPolygon } from 'ol/geom';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
// import Heatmap from 'ol/layer/Heatmap';
import Cluster from 'ol/source/Cluster';
import { boundingExtent } from 'ol/extent';
import { transform } from 'ol/proj';
import { fromLonLat } from "ol/proj";
import { FullScreen, defaults as defaultControls,MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import Select from 'ol/interaction/Select';
import WFS from 'ol/format/WFS';

import price from "../price.json";
import areaGeo from "../成都市.json";
import productJson from "../number.json"

//@auther:hzt
const layers = [
    new TileLayer({
        source: new XYZ({
            url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
            maxZoom: 20,
        }),
        zIndex: -1
    })
];
const map = new Map({
    layers: layers,
    target: 'map',
    view: new View({
        center: [11584000, 3590000],
        zoom: 8,
    }),
});

//突出底图
function addArea(geo) {
    if (geo.length == 0) return false;
    let areaFeature = null;
    // 设置图层
    const areaLayer = new VectorLayer({
        source: new VectorSource({
            features: []
        }),
        zIndex: 0
    });
    // 添加图层
    map.addLayer(areaLayer);
    geo.forEach((g, index)=> {
        let lineData = g.features[index];
        if (lineData.geometry.type == "MultiPolygon") {
            areaFeature = new Feature({
                geometry: new MultiPolygon(
                    lineData.geometry.coordinates
                ).transform("EPSG:4326", "EPSG:3857")
            });
        } else if (lineData.geometry.type == "Polygon") {
            areaFeature = new Feature({
                geometry: new Polygon(
                    lineData.geometry.coordinates
                ).transform("EPSG:4326", "EPSG:3857")
            });
        }
    });
    areaFeature.setStyle(
        new Style({
            fill: new Fill({ color: "#4e98f444" }),
            stroke: new Stroke({
                width: 3,
                color: [71, 137, 227, 1]
            })
        })
    );
    areaLayer.getSource().addFeatures([areaFeature]);
};
addArea(areaGeo);

//点样式
//随缩放切换
const labelStyle1 = new Style({
    text: new Text({})
});

const labelStyle2 = new Style({
    text: new Text({
        font: '10px Calibri,sans-serif',
        fill: new Fill({
            color: '#b9c4d3',
        }),
        stroke: new Stroke({
            color: '#000',
            width: 3
        }),
        textAlign: 'start',
        textBaseline: 'bottom',
        offsetX: 5,
    }),
});

const pointStyle = new Style({
    image: new RegularShape({
        points: 3, //顶点数
        radius: 10, //图形大小
        stroke: new Stroke({
            color: '#000',
            size: 5
        }),
        fill: new Fill({
            color: '#0A56A3'
        })
    })
});

const style = [pointStyle,labelStyle1];

//WFS 简单直接方法
const store = new VectorLayer({
    visible: false,
    source: new VectorSource({
        crossOrigin: 'anonymous',
        url: `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storetable}&outputFormat=application%2Fjson`,
        format: new GeoJSON(),
    }),
    style: function (feature) {
        labelStyle2.getText().setText([
            ` ${feature.get('name')}`,
            '',
        ]);
        return style;
    },
    zIndex: 1
});
// // WMS方法
// const store = new TileLayer({
//     source: new TileWMS({
//         url: 'http://localhost:8088/geoserver/WebGIS/wms',
//         params: { 'LAYERS': 'WebGIS:store', 'TILED': true },
//         serverType: 'geoserver',
//     }),
// });
map.addLayer(store);

// //热力图
// var hot = new Heatmap({
//     source: new VectorSource({
//         //使用json数据
//         crossOrigin: 'anonymous',
//         url: 'http://localhost:8088/geoserver/WebGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=WebGIS%3Astore&outputFormat=application%2Fjson',
//         format: new GeoJSON()
//     }),
//     blur: 5,
//     radius: 5,
//     weight: function (feature) {
//         const id = feature.get('id');
//         const magnitude = parseFloat(id.substr(6));
//         return magnitude;
//     },
// });
// map.addLayer(hot);

//聚合图
const styleCache = {};
const clusters = new VectorLayer({
    source: new Cluster({
        source: new VectorSource({
            //使用json数据
            crossOrigin: 'anonymous',
            url: `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storetable}&outputFormat=application%2Fjson`,
            format: new GeoJSON()
        }),
        distance: 100,//px
        minDistance: 5,//px
    }),
    style:
    //     function (feature) {
    //     const size = feature.get('features').length;
    //     let style = styleCache[size];
    //     if (!style) {
    //     style = new Style({
    //         image: new Circle({
    //             radius: 10,
    //             stroke: new Stroke({
    //                 color: '#fff',
    //             }),
    //             fill: new Fill({
    //                 color: '#3399CC',
    //             }),
    //         }),
    //         text: new Text({
    //             text: size.toString(),
    //             fill: new Fill({
    //                 color: '#fff',
    //             }),
    //         }),
    //     });
    //     styleCache[size] = style;
    //     }
    //     return style;
    // },
    function (feature) {
        const size = feature.get('features').length;
        if (size == 1) {
            //只有一个点
            return new Style({
                image: new Circle({ // 圆形
                    radius: 6, // 半径
                    stroke: new Stroke({ // 边框
                        color: '#b9c4d3'
                    }),
                    fill: new Fill({ // 填充
                        color: '#92B8FF'
                    })
                }),
                text: new Text({ // 文字样式
                    font: '8px',
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            })
        }
        if (size > 1 && size < 10) {
            return new Style({
                image: new Circle({ // 圆形
                    radius: 10, // 半径
                    stroke: new Stroke({ // 边框
                        color: '#b9c4d3'
                    }),
                    fill: new Fill({ // 填充
                        color: '#5E91F2'
                    })
                }),
                text: new Text({ // 文字样式
                    font: '10px',
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            })
        }
        if (size >= 10 && size < 100) {
            return new Style({
                image: new Circle({ // 圆形
                    radius: 14, // 半径
                    stroke: new Stroke({ // 边框
                        color: '#b9c4d3'
                    }),
                    fill: new Fill({ // 填充
                        color: '#1564BF'
                    })
                }),
                text: new Text({ // 文字样式
                    font: '12px',
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            })
        }
        if (size >= 100 && size < 1000) {
            return new Style({
                image: new Circle({ // 圆形
                    radius: 18, // 半径
                    stroke: new Stroke({ // 边框
                        color: '#b9c4d3'
                    }),
                    fill: new Fill({ // 填充
                        color: '#003B8E'
                    })
                }),
                text: new Text({ // 文字样式
                    font: '14px',
                    text: size.toString(),
                    fill: new Fill({
                        color: '#fff'
                    })
                })
            })
        }
    },
    zIndex: 2
})
map.addLayer(clusters);
map.on('click', (e) => {
    clusters.getFeatures(e.pixel).then((clickedFeatures) => {
        if (clickedFeatures.length) {
            // 获取坐标
            const features = clickedFeatures[0].get('features');
            if (features.length > 1) {
                const extent = boundingExtent(
                //边界
                features.map((r) => r.getGeometry().getCoordinates())
                );
                map.getView().fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
            }
        }
    });
});

//响应移动缩放事件
function onMoveEnd(evt) {
    const map = evt.map;
    if (map.getView().getZoom() <= 12) {
        style.pop();
        style.push(labelStyle1);
        // clusters.setVisible(true);
    }
    else {
        style.pop();
        style.push(labelStyle2);
        // clusters.setVisible(false);
    }
}
map.on('moveend', onMoveEnd);

//显示事件
const checkStore = document.querySelector('input');
checkStore.addEventListener('change', () => {
    // const layers = map.getLayers().getArray();
    // layers.forEach(e => {
    //     if (e.get("zIndex") == 1&& !checkStore.checked ) {
    //         e.setVisible(false);
    //     } else {
    //         e.setVisible(true);
    //     }
    // })
    if (!checkStore.checked) {
        store.setVisible(false);
        clusters.setVisible(true);
    }
    else {
        store.setVisible(true);
        clusters.setVisible(false);
    }
});

//@auther:wbw
//初始位置选取
var change_value = false;//开关逻辑判断
var initial_coordinates = [104.09,30.71];  //存储初始坐标
var store_coordinates;//存储商店坐标
var simu_user_select_coord = []//模拟选点
//初始点图层及样式定义
const iconStyle = new Style({
    image: new Icon({
        anchor: [0.5, 1],    
        src: require("../img/images/startIcon.png"),
        scale:0.2
    }),
});
var iconFeature;
var startSource = new VectorSource({
    features: [],
});
var startLayer = new VectorLayer({
    zIndex:20000
});
function location_select(e){
    // console.log(transform(e.coordinate, 'EPSG:3857', 'EPSG:4326'));
    initial_coordinates = transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
    simu_user_select_coord.push({ lng: initial_coordinates[0], lat: initial_coordinates[1] })
    if (simu_user_select_coord.length > 9) {
        simu_user_select_coord=simu_user_select_coord.slice(simu_user_select_coord.length - 9)
    }
    if (simulateUserVectorLayer)
        map.removeLayer(simulateUserVectorLayer)
    var linestr = []
    simu_user_select_coord.forEach((e) => {
        linestr.push(transform([e.lng, e.lat], 'EPSG:4326', 'EPSG:3857'))
    })
    simulateUserVectorLayer = new VectorLayer({
        visible: true,
        source: new VectorSource({
            features: [new Feature({
                geometry: new Multipoint(linestr)
            })]

        }),
        style: function (feature) {
            return simu_user_point_style
        },
        zIndex: 1
    });
    map.addLayer(simulateUserVectorLayer)

    map.removeLayer(startLayer);
    iconFeature = new Feature({
        geometry: new Point(fromLonLat(initial_coordinates)),
    });
    iconFeature.setStyle(iconStyle);
    startSource.clear();
    startSource.addFeature(iconFeature);
    startLayer.setSource(startSource)
    map.addLayer(startLayer);
}
var locationSelect = document.getElementById("location_select");
locationSelect.addEventListener('change', () => {
    change_value = !change_value;
    //alert(change_value);
    if(change_value==true){
        map.on('singleclick', location_select)
        if (simulateUserVectorLayer)
            map.addLayer(simulateUserVectorLayer)
    }
    else{
        map.un('singleclick', location_select);
        if (simulateUserVectorLayer)
            map.removeLayer(simulateUserVectorLayer)
    }
});

map.addControl(new MousePosition({
    // 设置数据格式
    coordinateFormat:createStringXY(6),
    // 设置空间参考系统为'EPSG:4326'
    projection:'EPSG:4326'
}))

//点击显示门店生鲜销售价格信息
var id;
// var storeName;
var json = [];//存储选择的商店的售卖信息
var radarChart = echarts.init(document.getElementById('radarChart'));//价格雷达图存放节点
var legendData = ['单价(元/kg)', '最高价(元/kg)','最低价(元/kg)']; //图例
var maxprice = 0; //存储选择的商店的商品的最高价格
var priceArray = [];
var avgpriceArray = [];
var maxpriceArray = [];
var minpriceArray= [];
var indicator = [];
var store_name;
var dataname = [];

//获取节点数组
function getClass(oBox, tagname) {
    var aTag = oBox.getElementsByTagName("*");
    var aBox = [];
    for (var i = 0; i < aTag.length; i++) {
        if (aTag[i].className == tagname) {
            aBox.push(aTag[i]);
        }
    }
    return aBox;
}

map.on('click', function () {
    let selectAdded = map.getInteractions();
    if (selectAdded) {
        map.removeInteraction(selectAdded);
    }
    //指定图层后，点击地图时要素属于该图层时才可选中，否则不选中
    let select = new Select({ layers: [store] });
    map.addInteraction(select);
    
    select.on('select', (e) => {
        // app.productList = [];//更换商店清空购物车
        //暂无数据消失
        var tempEmpty1 = document.getElementById('tempEmpty1');
        var tempEmpty2 = document.getElementById('tempEmpty2');
        tempEmpty1.style.display = 'none';
        tempEmpty2.style.display = 'none';
        var productGraph = document.getElementById('radarChart');
        productGraph.style.display = 'block';
        if (e.selected.length == 0) return

        let feature = e.selected[0];
        //feature.getGeometry() //空间信息
        //feature.getProperties()//要素属性信息
        id = feature.getProperties().id_2;
        store_name = feature.getProperties().name;
        //console.log(transform(feature.getGeometry().flatCoordinates, 'EPSG:3857', 'EPSG:4326'));
        store_coordinates = transform(feature.getGeometry().flatCoordinates, 'EPSG:3857', 'EPSG:4326');
        // storeName = feature.getProperties().name;

        for (var index in price) {
            if (price[index].id == id) {
                // console.log(price[index].type, price[index].price);
                json.push(price[index]);
                
                priceArray.push(
                    {name:price[index].type,value:price[index].price.toString()}
                );
                avgpriceArray.push(
                    {name:price[index].type,value:price[index].avg_price.toFixed(3).toString()}
                );
                maxpriceArray.push(
                    { name: price[index].type, value: price[index].max_price.toString() }
                );
                minpriceArray.push(
                    { name: price[index].type, value: price[index].min_price.toString() }
                );
                dataname.push(price[index].type);
                //console.log(json); 
                // indicator.push(
                //     { name: price[index].type }
                // )
                if (price[index].price > maxprice) {
                    maxprice = price[index].price;
                }
            }
        }

        indicator.forEach((e) => {
            e.max=maxprice;
        })

        //数据写入表格
        var tb = document.getElementById("common-table");
        var tbstr = "<thead><th>商品</th><th>单价(元/kg)</th><th>均价(元/kg)</th><th>加入购物车</th></thead>";
        tbstr += `<tbody>`;
        json.forEach((e) => {
            tbstr += `<tr>
            <td style="width:50%">${e.type}</td>
            <td style="width:50%">${e.price}</td>
            <td style="width:50%">${e.avg_price.toFixed(3)}</td>
            <td style="width:50%"><button class="buy"><i class="el-icon-plus"></i></button></td>
            </tr>`
        })
        tbstr += "</tbody>";
        tb.innerHTML = tbstr;
        json = [];
        //使用该方法时，选中后有默认的选中图标，若不需要选中图标加上下面这行代码即可
        //select.getFeatures().clear()
        var buy = getClass(tb, "buy");//获取tb下的所有添加购物车按钮
        for (var i = 0; i < buy.length; i++) {
            buy[i].onclick = function () {
                var tr = this.parentNode.parentNode
                var tds = tr.getElementsByTagName("td");
                var name = tds[0].innerText;
                var price = parseFloat(tds[1].innerText);

                app.productList.push(
                    {
                        'pro_name': name,
                        'pro_num': 1,
                        'pro_price': price,
                    }
                ); 
                app.productList.map(function (item) {    //map:'键值对'
                    app.$set(item, 'select', true)      //往item添加select属性，默认为true
                });
            }
        }

        var datavaule = priceArray;
        var datavaule2 = avgpriceArray;
        var datavaule3 = maxpriceArray;
        var datavaule4 = minpriceArray;
        for (let i = 0; i < dataname.length; i++) {
            indicator.push({
                name: dataname[i],
                max: maxprice,
            })
        }

        // console.log(indicator);
        function contains(arrays, obj) {
            let i = arrays.length;
            while (i--) {
                if (arrays[i] === obj) {
                    return i;
                }
            }
            return false;
        }

        var buildSeries = function (data) {
            var helper = data.map((item, index) => {
                var arr = new Array(data.length);
                arr.splice(index, 1, item);
                return arr;
            });
            return [data, ...helper].map((item, index) => {
                return {
                    type: 'radar',
                    name: legendData[0],
                    // 折线拐点标志样式
                    itemStyle: {
                        opacity: index === 0 ? '4A99FF' : 0,
                        color: index === 0 ? '#4A99FF' : 'transparent'
                    },
                    // 线条样式
                    // lineStyle: {
                    //     color: index === 0 ? '#01B7D8' : 'transparent'
                    // },
                    // //区域填充样式
                    areaStyle: {
                        normal: { // 单项区域填充样式
                            color: {
                                type: 'linear',
                                x: 0, //右
                                y: 0, //下
                                x2: 1, //左
                                y2: 1, //上
                                colorStops: [{
                                    offset: 0,
                                    color: '#4A99FF'
                                }, {
                                    offset: 0.5,
                                    color: 'rgba(0,0,0,0)'
                                }, {
                                    offset: 1,
                                    color: '#4A99FF'
                                }],
                                globalCoord: false
                            },
                            opacity: 1 // 区域透明度
                        }
                    },
                    // 提示框内容
                    tooltip: {
                        backgroundColor: 'rgba(50,50,50,0.7)',
                        borderWidth: 0,
                        padding: [5, 10],
                        textStyle: {
                            color: '#FFFFFF',
                            fontFamily: 'sans-serif'
                        },
                        confine: true, // 提示框显示在canvas以内
                        show: index === 0 ? false : true,
                        formatter: function () {
                            return datavaule[index - 1].name + "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#4A99FF'></span>" + '单价: ' + data[index - 1] + '元/kg'
                        }
                    },
                    z: index === 0 ? 1 : 2,
                    data: [item]
                }
            })
        }

        var buildSeries2 = function (data) {
            var helper = data.map((item, index) => {
                var arr = new Array(data.length);
                arr.splice(index, 1, item);
                return arr;
            });
            return [data, ...helper].map((item, index) => {
                return {
                    type: 'radar',
                    name: legendData[1],
                    // 折线拐点标志样式
                    itemStyle: {
                        opacity: index === 0 ? '#4BFFFC' : 0,
                        color: index === 0 ? '#4BFFFC' : 'transparent'
                    },
                    // 线条样式
                    // lineStyle: {
                    //     color: index === 0 ? '#F7DA6D' : 'transparent'
                    // },
                    // 区域填充样式
                    areaStyle: {
                        normal: { // 单项区域填充样式
                            color: {
                                type: 'linear',
                                x: 0, //右
                                y: 0, //下
                                x2: 1, //左
                                y2: 1, //上
                                colorStops: [{
                                    offset: 0,
                                    color: '#4BFFFC'
                                }, {
                                    offset: 0.5,
                                    color: 'rgba(0,0,0,0)'
                                }, {
                                    offset: 1,
                                    color: '#4BFFFC'
                                }],
                                globalCoord: false
                            },
                            opacity: 1 // 区域透明度
                        }
                    },
                    // 提示框内容
                    tooltip: {
                        backgroundColor: 'rgba(50,50,50,0.7)',
                        borderWidth: 0,
                        padding: [5, 10],
                        textStyle: {
                            color: '#FFFFFF',
                            fontFamily: 'sans-serif'
                        },
                        confine: true, // 提示框显示在canvas以内
                        show: index === 0 ? false : true,
                        formatter: function () {
                            return datavaule[index - 1].name + "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#4BFFFC'></span>" + '均价 : ' + data[index - 1] + '元/kg'
                        }
                    },
                    z: index === 0 ? 1 : 2,
                    data: [item]
                }
            })
        }

        var buildSeries3 = function (data) {
            var helper = data.map((item, index) => {
                var arr = new Array(data.length);
                arr.splice(index, 1, item);
                return arr;
            });

            return [data, ...helper].map((item, index) => {
                return {
                    type: 'radar',
                    name: legendData[1],
                    // 折线拐点标志样式
                    itemStyle: {
                        opacity: index === 0 ? '#31e586' : 0,
                        color: index === 0 ? '#31e586' : 'transparent'
                    },
                    // 线条样式
                    // lineStyle: {
                    //     color: index === 0 ? '#F7DA6D' : 'transparent'
                    // },
                    // 区域填充样式
                    areaStyle: {
                        normal: { // 单项区域填充样式
                            color: {
                                type: 'linear',
                                x: 0, //右
                                y: 0, //下
                                x2: 1, //左
                                y2: 1, //上
                                colorStops: [{
                                    offset: 0,
                                    color: '#31e586'
                                }, {
                                    offset: 0.5,
                                    color: 'rgba(0,0,0,0)'
                                }, {
                                    offset: 1,
                                    color: '#31e586'
                                }],
                                globalCoord: false
                            },
                            opacity: 1 // 区域透明度
                        }
                    },
                    // 提示框内容
                    tooltip: {
                        backgroundColor: 'rgba(50,50,50,0.7)',
                        borderWidth: 0,
                        padding: [5, 10],
                        textStyle: {
                            color: '#FFFFFF',
                            fontFamily: 'sans-serif'
                        },
                        confine: true, // 提示框显示在canvas以内
                        show: index === 0 ? false : true,
                        formatter: function () {
                            return datavaule[index - 1].name + "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:#31e586'></span>" + '最高价 : ' + data[index - 1] + '元/kg'
                        }
                    },
                    z: index === 0 ? 1 : 2,
                    data: [item]
                }
            })
        }

        var buildSeries4 = function (data) {
            var helper = data.map((item, index) => {
                var arr = new Array(data.length);
                arr.splice(index, 1, item);
                return arr;
            });

            return [data, ...helper].map((item, index) => {
                return {
                    type: 'radar',
                    name: legendData[2],
                    // 折线拐点标志样式
                    itemStyle: {
                        opacity: index === 0 ? 'white' : 0,
                        color: index === 0 ? 'white' : 'transparent'
                    },
                    // 线条样式
                    // lineStyle: {
                    //     color: index === 0 ? '#F7DA6D' : 'transparent'
                    // },
                    // 区域填充样式
                    areaStyle: {
                        normal: { // 单项区域填充样式
                            color: {
                                type: 'linear',
                                x: 0, //右
                                y: 0, //下
                                x2: 1, //左
                                y2: 1, //上
                                colorStops: [{
                                    offset: 0,
                                    color: 'white'
                                }, {
                                    offset: 0.5,
                                    color: 'rgba(0,0,0,0)'
                                }, {
                                    offset: 1,
                                    color: '#31e586'
                                }],
                                globalCoord: false
                            },
                            opacity: 1 // 区域透明度
                        }
                    },
                    // 提示框内容
                    tooltip: {
                        backgroundColor: 'rgba(50,50,50,0.7)',
                        borderWidth: 0,
                        padding: [5, 10],
                        textStyle: {
                            color: '#FFFFFF',
                            fontFamily: 'sans-serif'
                        },
                        confine: true, // 提示框显示在canvas以内
                        show: index === 0 ? false : true,
                        formatter: function () {
                            return datavaule[index - 1].name + "<br/><span style='display:inline-block;margin-right:5px;border-radius:10px;width:9px;height:9px;background-color:white'></span>" + '最低价 : ' + data[index - 1] + '元/kg'
                        }
                    },
                    z: index === 0 ? 1 : 2,
                    data: [item]
                }
            })
        }

        var option = {
            tooltip: {
                show: false,
                trigger: "item",
                // triggerOn: "click",
                // confine: true,
                // formatter: (params) => {
                //     console.log(params);
                //     // let i = contains(dataname, value);
                //     // let percent = datavaule[i];
                // }
            },
            title: {
                text: store_name,
                left: 'center',
                top: 5,
                textStyle: {
                    color: '#fff',
                    fontWeight: 'normal',
                    fontSize: 16,
                }
                },
            legend: {
                orient: 'vertical',
                icon: 'circle', //图例形状
                data: legendData,
                bottom: 0,
                right: 0,
                itemWidth: 14, // 图例标记的图形宽度。[ default: 25 ]
                itemHeight: 14, // 图例标记的图形高度。[ default: 14 ]
                itemGap: 21, // 图例每项之间的间隔。[ default: 10 ]横向布局时为水平间隔，纵向布局时为纵向间隔。
                textStyle: {
                    fontSize: 10,
                    color: '#00E4FF',
                },
            },
            radar: {
                indicator: indicator,
                center: ["50%", "50%"],
                radius: "65%",
                startAngle: 240,
                splitNumber: 5,
                splitArea: {
                    show: true,
                    areaStyle: { // 分隔区域的样式设置。
                        color: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'], // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
                    }
                },
                axisLabel: {
                    lineStyle: {
                        color: '#153269'
                    }
                },
                axisLine: {
                    lineStyle: {
                        color: '#153269'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: '#113865', // 分隔线颜色
                        width: 1, // 分隔线线宽
                    }
                },
                name: {
                    formatter: function (value) {
                        let i = contains(dataname, value);
                        let percent = datavaule[i];
                        let ret = "";//拼接加\n返回的类目项  
                        let maxLength = 6;//每项显示文字个数  
                        let valLength = value.length;//X轴类目项的文字个数  
                        let rowN = Math.ceil(valLength / maxLength); //类目项需要换行的行数  
                        if (rowN > 1)//如果类目项的文字大于6,
                        {
                            let temp = "";//每次截取的字符串  
                            let start = 0;//开始截取的位置  
                            let end = maxLength;//结束截取的位置  
                            temp = value.substring(start, end) + '\n' + value.substring(end, valLength)
                            ret += temp; //凭借最终的字符串  
                            // return '{a|' + percent + '}\n' + '{b|' + ret + '}'
                            return '{b|' + ret + '}'
                        }
                        else {
                            // return '{a|' + percent + '}\n' + '{b|' + value + '}'
                            return '{b|' + value + '}'
                        }
                    },
                    textStyle: {
                        rich: {
                            a: {
                                color: '#b9c4d3',
                                fontSize: 14,
                                padding: [0, 0],
                                // lineHeight: 20,
                            },
                            b: {
                                color: '#b9c4d3',
                                fontSize: 14,
                                padding: [0, 0],
                                // lineHeight: 20,
                            }
                        },
                    },
                },
            },
            series: [...buildSeries(datavaule.map(item => item.value)),...buildSeries3(datavaule3.map(item => item.value)),...buildSeries4(datavaule4.map(item => item.value))]
        };
        
        radarChart.setOption(option);

        maxprice = 0; 
        priceArray = [];
        avgpriceArray = [];
        indicator = [];
        dataname = [];
        maxpriceArray = [];
        minpriceArray = [];

    })
})

//@author: cht
//获取当前位置的纬度、经度
//需修改，调用相应的接口
function get_coord() {
    return {
        lat: initial_coordinates[1],//纬度
        lng: initial_coordinates[0]//经度
    }
}
//附近商店点样式
const select_store_point_style = new Style({
    text: new Text({
        font: '10px Calibri,sans-serif',
        fill: new Fill({
            color: '#b9c4d3',
        }),
        stroke: new Stroke({
            color: '#000',
            width: 3
        }),
        textAlign: 'start',
        textBaseline: 'bottom',
        offsetX: 5,
    }),
    image: new RegularShape({
        points: 3, //顶点数
        radius: 10, //图形大小
        stroke: new Stroke({
            color: '#000',
            size: 5
        }),
        fill: new Fill({
            color: '#FF56A3'
        })
    })
});
//推荐商店点样式
const recom_store_point_style = new Style({
    text: new Text({
        font: '10px Calibri,sans-serif',
        fill: new Fill({
            color: '#b9c4d3',
        }),
        stroke: new Stroke({
            color: '#000',
            width: 3
        }),
        textAlign: 'start',
        textBaseline: 'bottom',
        offsetX: 5,
    }),
    image: new RegularShape({
        points: 3, //顶点数
        radius: 10, //图形大小
        stroke: new Stroke({
            color: '#000',
            size: 5
        }),
        fill: new Fill({
            color: '#f3961b'
        })
    })
});
//模拟用户点样式
const simu_user_point_style = new Style({
    image: new RegularShape({
        points: 4, //顶点数
        radius: 10, //图形大小
        stroke: new Stroke({
            color: '#000',
            size: 5
        }),
        fill: new Fill({
            color: '#00BCD9'
        })
    })
});
//附近商店图层
var near_store_layer = undefined
//店名和商品名的输入框
const input1 = document.getElementsByClassName("inline-input")[0].getElementsByTagName('input')[0]
const input2 = document.getElementsByClassName("inline-input")[1].getElementsByTagName('input')[0]
//查找和显示附近商店
function select_near_store() {
    //console.log("dianlea")
    if (near_store_layer) {
        map.removeLayer(near_store_layer)
    }
    var max_dist = 3000//附近范围3km
    var coord = get_coord();

    near_store_layer = new VectorLayer({
        visible: true,
        source: new VectorSource({
            crossOrigin: 'anonymous',
            url: `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storeDistView}&outputFormat=application%2Fjson&viewparams=lng:${coord.lng};lat:${coord.lat};dist:${max_dist}`,
            format: new GeoJSON(),
        }),
        style: function (feature) {
            select_store_point_style.getText().setText([
                ` ${feature.get('name')}`,
                '',
            ]);
            return select_store_point_style;
        },
        zIndex: 1
    });
    map.addLayer(near_store_layer);

    // console.log(map)
    document.getElementById("near-store").style.display = ""

}
//点击checkbox，查看附近商店
const check_near = document.getElementById("near-store")
check_near.addEventListener('change', () => {
    near_store_layer.setVisible(check_near.querySelector('input').checked);
})
//点击checkbox，查看推荐商店
var recom_store_layer = undefined//推荐商店图层
const check_recom = document.getElementById("recom-store")
check_recom.addEventListener('change', () => {
    recom_store_layer.setVisible(check_recom.querySelector('input').checked);
})
//按下“附近的生鲜商店”按钮
document.getElementById("near-store-button").onclick = () => {
    select_near_store()
}
//按店名查找商店
function select_store_by_name() {
    //暂无数据消失
    var tempEmpty1 = document.getElementById('tempEmpty1');
    tempEmpty1.style.display = 'none';
    if (recom_store_layer) {
        map.removeLayer(recom_store_layer)
    }
    var coord = get_coord()
    var url = `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storeNameView}&outputFormat=application%2Fjson&viewparams=lng:${coord.lng};lat:${coord.lat};word:${input1.value}`;
    //添加图层
    recom_store_layer = new VectorLayer({
        visible: true,
        source: new VectorSource({
            crossOrigin: 'anonymous',
            url: url,
            format: new GeoJSON(),
        }),
        style: function (feature) {
            recom_store_point_style.getText().setText([
                ` ${feature.get('name')}`,
                '',
            ]);
            return recom_store_point_style;
        },
        zIndex: 1
    });
    map.addLayer(recom_store_layer)

    document.getElementById("recom-store").style.display = ""
    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("get", url, true);
    xhr.send();
    //数据写入表格
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var res = JSON.parse(xhr.responseText)
                var tb = document.getElementById("common-table")
                if (res.features.length == 0) {
                    tb.innerHTML = `<div style="margin-top:135px">没有符合查询条件的店铺！</div>`;
                    tb.style.height = "300px";
                    tb.style.textAlign = "center";
                }
                else {
                    var tbstr = `<thead><th style="width:40%">商店名称</th><th style="width:30%">区域</th><th style="width:30%">距离</th></thead>`
                    tbstr += `<tbody>`
                    res.features.forEach((e) => {
                        var p = e.properties
                        var ds
                        if (p.distance < 1000) {
                            ds = p.distance.toFixed(0) + "米"
                        }
                        else {
                            ds = (p.distance / 1000).toFixed(2) + "千米"
                        }
                        tbstr += `<tr>
                        <td style="width:40%">${p.name}</td>
                        <td style="width:30%">${p.adname}</td>
                        <td style="width:30%">${ds}</td>
                        </tr>`
                    })
                    tbstr += "</tbody>"
                    tb.innerHTML = tbstr
                }
            }
        }
    }
}
//按商品名查找商店
function select_store_by_type(price1, price2) {
    //暂无数据消失
    var tempEmpty1 = document.getElementById('tempEmpty1');
    tempEmpty1.style.display = 'none';
    // //滑块出现
    // var sliderBox = document.getElementById('slider-box');
    // sliderBox.style.visibility = 'visible';
    if (recom_store_layer) {
        map.removeLayer(recom_store_layer)
    }
    var coord = get_coord()
    var url
    if (price1 != undefined && price2 != undefined) {
        url = `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storeTypeView}&outputFormat=application%2Fjson&viewparams=lng:${coord.lng};lat:${coord.lat};word:${input2.value};min:${price1};max:${price2}`
        // console.log(url)
    }
    else url = `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${cfg.database}%3A${cfg.storeTypeView}&outputFormat=application%2Fjson&viewparams=lng:${coord.lng};lat:${coord.lat};word:${input2.value}`
    recom_store_layer = new VectorLayer({
        visible: true,
        source: new VectorSource({
            crossOrigin: 'anonymous',
            url: url,
            format: new GeoJSON(),
        }),
        style: function (feature) {
            recom_store_point_style.getText().setText([
                ` ${feature.get('name')}`,
                '',
            ]);
            return recom_store_point_style;
        },
        zIndex: 1
    });
    map.addLayer(recom_store_layer)

    document.getElementById("recom-store").style.display = ""
    var xhr = new XMLHttpRequest() || new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("get", url, true);
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var res = JSON.parse(xhr.responseText)
                var tb = document.getElementById("common-table")
                // console.log(res)
                if (res.features.length == 0) {
                    tb.innerHTML = `<div style="margin-top:135px">没有符合查询条件的店铺！</div>`;
                    tb.style.height = "300px";
                    tb.style.textAlign = "center";
                }
                else {
                    var tbstr = `<thead><th style="width:40%">商店名称</th><th style="width:20%">距离</th><th style="width:20%">商品</th><th style="width:20%">单价</th></thead>`
                    tbstr += `<tbody>`
                    res.features.forEach((e) => {
                        var p = e.properties
                        var ds
                        if (p.distance < 1000) {
                            ds = p.distance.toFixed(0) + "米"
                        }
                        else {
                            ds = (p.distance / 1000).toFixed(2) + "千米"
                        }
                        tbstr += `<tr>
                        <td style="width:40%">${p.name}</td>
                        <td style="width:20%">${ds}</td>
                        <td style="width:20%">${p.type}</td>
                        <td style="width:20%">${p.price}元</td>
                        </tr>`
                    })
                    tbstr += "</tbody>"
                    tb.innerHTML = tbstr
                }
            }
        }
    }
}
//按店铺名查找商店的输入框
input1.onkeydown = () => {
    if (window.event.keyCode == 13) {
        select_store_by_name()
    }
}
//按商品名查找商店的输入框
input2.onkeydown = () => {
    if (window.event.keyCode == 13) {
        select_store_by_type(undefined, undefined)
    }
}

//ol绘制带箭头的线
const styleFunction = function (feature) {
    const geometry = feature.getGeometry();
    const styles = [
        // linestring
        new Style({
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2,
            }),
        }),
    ];

    geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(
            new Style({
                geometry: new Point(end),
                image: new Icon({
                    src: 'https://openlayers.org/en/latest/examples/data/arrow.png',
                    anchor: [0.75, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                    scale: 0.5
                }),
            })
        );
    });

    return styles;
};
var simulateUserVectorLayer = undefined;
//调用百度api，一对一配送
function baiduRoutePlan() {
    //这里改成获取坐标的方法
    var coord_st = get_coord()
    var coord_ed = { lat: store_coordinates[1], lng: store_coordinates[0] }
    var url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${coord_st.lat},${coord_st.lng}&destination=${coord_ed.lat},${coord_ed.lng}&ak=2iOhjjlMEYGGRlKnu2RAaPyRsT7Gltpb&callback=baiduRoutePlanCallback`
    // console.log(url)
    jQuery.getScript(url)
    if (simulateUserVectorLayer) {
        map.removeLayer(simulateUserVectorLayer)
        simulateUserVectorLayer = undefined
    }
}
//求数组的全排列，用于硬算最短路线
function permute(input) {
    var permArr = [],
        usedChars = [];
    function main(input) {
        var i, ch;
        for (i = 0; i < input.length; i++) {
            ch = input.splice(i, 1)[0];
            usedChars.push(ch);
            if (input.length == 0) {
                permArr.push(usedChars.slice());
            }
            main(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }
        return permArr
    }
    return main(input);
};
//模拟的多个用户位置图层
var simulateUserVectorLayer = undefined
//店家一对多配送
function baiduRoutePlan_shop() {
    //这里改成获取坐标的方法
    //店家坐标
    var coord_st = { lat: store_coordinates[1], lng: store_coordinates[0] }
    //所有需配送的用户坐标，不能超过十个
    if (simu_user_select_coord.length > 9) {
        simu_user_select_coord.splice(simu_user_select_coord.length - 9)
    }
    var coord_lt = simu_user_select_coord
    //  [{ lng: 104.029339, lat: 30.622467 }, { lng: 104.155879, lat: 30.650446 }, { lng: 104.155879, lat: 30.650446 }, { lng: 104.095862, lat: 30.637105 }, { lng: 104.229339, lat: 30.642467 }, { lng: 104.329339, lat: 30.522467 }]
    //全排列强求粗略的最短路径
    var l_min = 9999
    var min_index = 0
    var p_lt = permute(coord_lt)
    for (let index = 0; index < p_lt.length; index++) {
        const e = p_lt[index];
        var l = Math.sqrt(Math.pow(coord_st.lng - e[0].lng, 2) + Math.pow(coord_st.lng - e[0].lng, 2))
        for (let i = 1; i < e.length; i++) {
            l += Math.sqrt(Math.pow(e[i].lng - e[i - 1].lng, 2) + Math.pow(e[i].lng - e[i - 1].lng, 2))
        }
        if (l < l_min) {
            l_min = l
            min_index = index
        }
    }
    coord_lt = p_lt[min_index]
    //生成百度api字符串
    var coord_ed = coord_lt[coord_lt.length - 1]
    var waypoints_str = coord_lt[0].lat + "," + coord_lt[0].lng
    for (let index = 1; index < coord_lt.length - 1; index++) {
        waypoints_str += "|" + coord_lt[index].lat + "," + coord_lt[index].lng
    }
    var url = `https://api.map.baidu.com/directionlite/v1/driving?origin=${coord_st.lat},${coord_st.lng}&destination=${coord_ed.lat},${coord_ed.lng}&ak=2iOhjjlMEYGGRlKnu2RAaPyRsT7Gltpb&waypoints=${waypoints_str}&callback=baiduRoutePlanCallback`
    // console.log(url)
    jQuery.getScript(url)
    //创建多个用户位置标记
    if (simulateUserVectorLayer)
        map.removeLayer(simulateUserVectorLayer)
    var linestr = [transform([coord_st.lng, coord_st.lat], 'EPSG:4326', 'EPSG:3857')]
    coord_lt.forEach((e) => {
        linestr.push(transform([e.lng, e.lat], 'EPSG:4326', 'EPSG:3857'))
    })
    // console.log(linestr)
    simulateUserVectorLayer = new VectorLayer({
        visible: true,
        source: new VectorSource({
            features: [new Feature({
                geometry: new Multipoint(linestr)
            })]

        }),
        style: function (feature) {
            return simu_user_point_style},
        zIndex: 1
    });
    map.addLayer(simulateUserVectorLayer)
}

//调用百度api的回调函数，用来绘制路线和显示导航步骤
window.baiduRoutePlanCallback = baiduRoutePlanCallback
var RouteVectorLayer = undefined

function baiduRoutePlanCallback(response) {
    if (RouteVectorLayer)
        map.removeLayer(RouteVectorLayer)
    if (response.status != 0) return
    var sl = response.result.routes[0].steps[0].start_location
    var sl_xy = transform([sl.lng, sl.lat], 'EPSG:4326', 'EPSG:3857');
    var linestr = [sl_xy]
    var stepstr = []
    response.result.routes[0].steps.forEach((e) => {
        linestr.push(transform([e.end_location.lng, e.end_location.lat], 'EPSG:4326', 'EPSG:3857'))
        stepstr.push(e.instruction)
    })
    //    console.log(stepstr)
    //    console.log(linestr)
    // var ins_html = `<ul>`
    // stepstr.forEach((e) => {
    //     ins_html += `<li>${e}</li>`
    // })
    // ins_html += `</ul>`
    //数据写入表格
    var ins_html =`<table id="nav-table" width="670px">`
    if (document.getElementsByClassName('el-radio-button')[0].className == 'el-radio-button el-radio-button--mini') {
        ins_html +=
            `<thead><th width="65%" style="text-align:right">用户自提路径导航</th>
            <th id="exit-nav" width="35%" style="text-align:right">
            退出导航<i class="el-icon-close"></i></th></thead>`;
    } else {
        ins_html +=
        `<thead><th width="65%" style="text-align:right">店家配送路径导航</th>
        <th id="exit-nav" width="35%" style="text-align:right">
        退出导航<i class="el-icon-close"></i></th></thead>`;
    }
    ins_html += `<tbody>`;
    stepstr.forEach((e) => {
        ins_html += `<tr>
        <td><li>${e}</li></td>
        </tr>`
    });
    ins_html += "</tbody>";
    ins_html += "</table>";
    document.getElementsByClassName('part-info')[0].innerHTML = ins_html;

    //清除路径 此处才能获得到exit-nav的dom
    // console.log(document.getElementById('exit-nav'));
    document.getElementById('exit-nav').onclick = () => {
        if (simulateUserVectorLayer) {
            map.removeLayer(simulateUserVectorLayer)
        }
        if (RouteVectorLayer) {
            map.removeLayer(RouteVectorLayer)
        }
        document.querySelector('.part-map').classList.remove('foldMapStyle');
        document.querySelector('.part-info').classList.remove('foldInfoStyle');
    };
    // 面板切换
    if (!document.querySelector('.part-map').classList.contains('foldMapStyle'))
        document.querySelector('.part-map').classList.add('foldMapStyle')
    if (!document.querySelector('.part-info').classList.contains('foldInfoStyle'))
        document.querySelector('.part-info').classList.add('foldInfoStyle')
    var wireFeature = new Feature({
        geometry: new LineString(linestr)
    });
    var vectorSource = new VectorSource({
        features: [wireFeature]
    });
    RouteVectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction

    });
    map.addLayer(RouteVectorLayer)
}
//给购物车中的按钮添加点击事件（PS：点击购物车按钮后，购物车底栏中的关键事件才能用DOM获取）
document.getElementById("cart-button").onclick = () => {
    document.querySelector('.btn-buy').onclick = () => {
        if (document.getElementsByClassName('el-radio-button')[0].className == 'el-radio-button el-radio-button--mini') {
            //用户自提路径
            baiduRoutePlan();
        } else {
            //商家配送路径
            baiduRoutePlan_shop();
        };
    }
}
//给滑动条添加点击事件
var slider = document.getElementsByClassName('el-slider')[0]
slider.onclick = () => {
    var max = Number(slider.ariaValueMax)
    console.log(max)
    var min = Number(slider.ariaValueMin)
    var p1 = min + (max - min) * Number(document.getElementsByClassName('el-slider__button-wrapper')[0].style.left.split("%")[0]) / 100
    var p2 = min + (max - min) * Number(document.getElementsByClassName('el-slider__button-wrapper')[1].style.left.split("%")[0]) / 100
    select_store_by_type(Math.min(p1, p2), Math.max(p1, p2))
}

//@author: yqx
// // 词云图
// const storeFeatureRequest = new WFS().writeGetFeature({
//     srsName: 'EPSG:4326',
//     featureNS: `http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}`,
//     featurePrefix: `${cfg.database}`,
//     featureTypes: [`${cfg.storetable}`],
//     outputFormat: 'application/json',
//     // filter: andFilter(
//     //   likeFilter('name', 'Mississippi*'),
//     //   equalToFilter('waterway', 'riverbank')
//     // ),
// });
// function findStoreFeaturesAndShowTable() {
//     fetch(`http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows`, {
//         method: 'POST',
//         body: new XMLSerializer().serializeToString(storeFeatureRequest),
//     }).then(function (response) {
//         return response.json();
//     }).then(function (json) {
//         const features = new GeoJSON().readFeatures(json);
//         showTable(features);
//     });
// }

// function showTable(features) {
//     // console.log(document.getElementById("word-rank"));
//     // let rankEcharts = echarts.init(document.getElementById("main"));
//     // console.log(rankEcharts);
//     // let keywords = [];
//     let keywords1 = [];
//     let keywords2 = [];
//     features.forEach(feature => {
//         // keywords.push({
//         //     "name": feature.values_.name,
//         //     "value": feature.values_.number
//         // });
//         keywords1.push(feature.values_.name);
//         keywords2.push(feature.values_.number);
//     });
//     // console.log(keywords);
//     // 基于准备好的dom，初始化echarts实例
//     var myChart = echarts.init(document.getElementById('main'));

//     // 指定图表的配置项和数据
//     var option = {
//     title: {
//         text: 'Test'
//     },
//     tooltip: {},
//     legend: {
//         data: ['总数']
//     },
//     xAxis: {
//         data: keywords1
//     },
//     yAxis: {},
//     series: [
//         {
//         name: '总数',
//         type: 'bar',
//         data: keywords2
//         }
//     ]
//     };

//     // 使用刚指定的配置项和数据显示图表。
//     myChart.setOption(option);
//     // let option = {
//     //     series: [{
//     //         type: 'wordCloud',
//     //         sizeRange: [15, 80],
//     //         rotationRange: [0, 0],
//     //         rotationStep: 45,
//     //         gridSize: 8,
//     //         shape: 'circle',
//     //         width: '100%',
//     //         height: '100%',
//     //         left: 'center',
//     //         top: 'center',
//     //         textStyle: {
//     //             fontFamily: 'sans-serif',
//     //             fontWeight: 'bold',
//     //             color: function () {
//     //                 // Random color
//     //                 return 'rgb(' + [
//     //                     Math.round(Math.random() * 160),
//     //                     Math.round(Math.random() * 160),
//     //                     Math.round(Math.random() * 160)
//     //                 ].join(',') + ')';
//     //             }
//     //         },
//     //         emphasis: {
//     //             focus: 'self',

//     //             textStyle: {
//     //                 textShadowBlur: 10,
//     //                 textShadowColor: '#333'
//     //             }
//     //         },
//     //         data: keywords
//     //         // 以下是测试
//     //         // data: [
//     //         // {name: "龙头镇", value: "111"},
//     //         // {name: "大埔镇", value: "222"},
//     //         // {name: "太平镇", value: "458"},
//     //         // {name: "沙埔镇", value: "445"},
//     //         // {name: "东泉镇", value: "456"},
//     //         // {name: "凤山镇", value: "647"},
//     //         // {name: "六塘镇", value: "189"},
//     //         // {name: "冲脉镇", value: "864"},
//     //         // {name: "寨隆镇", value: "652"},
//     //         // ]
//     //     }]
//     // };
//     // console.log(option);
//     // rankEcharts.setOption(option);
//     // window.addEventListener("resize", function () {
//     //     rankEcharts.resize();
//     // })
// }

// findStoreFeaturesAndShowTable();

//滚动排行榜
const storeFeatureRequest = new WFS().writeGetFeature({
    srsName: 'EPSG:4326',
    featureNS: `http://${cfg.host}:${cfg.port}/${cfg.database}`,
    featurePrefix: `${cfg.database}`,
    featureTypes: [`${cfg.storetable}`],
    outputFormat: 'application/json',
    // filter: andFilter(
    //   likeFilter('name', 'Mississippi*'),
    //   equalToFilter('waterway', 'riverbank')
    // ),
});
function initScrollRankChart() {
    const scrollChart = echarts.init(document.getElementById('scroll-rank'));
    sendResquestToStore(scrollChart);
}
function sendResquestToStore(chart) {
    fetch(`http://${cfg.host}:${cfg.port}/geoserver/${cfg.database}/ows`, {
        method: 'POST',
        body: new XMLSerializer().serializeToString(storeFeatureRequest),
    }).then(function (response) {
        return response.json();
    }).then(function (json) {
        const features = new GeoJSON().readFeatures(json);
        loadScrollRankOption(features, chart);
    });
}
let option = {};
let end = 3;
function loadScrollRankOption(features, chart) {
    let dataList = [], dataName = [], dataValue = [];
    features.forEach(feature => {
        dataList.push({
            "name": feature.values_.name,
            "value": feature.values_.number
        });
    });
    dataList.sort((d1, d2) => {
        return d2.value - d1.value;
    });
    dataList.forEach((d) => {
        dataName.push(d.name);
        dataValue.push(d.value);
    })
    option = {
        title: {
            text: "商品丰度",
            left: 'center',
            top: 5,
            textStyle: {
                color: '#fff',
                fontWeight: 'normal',
                fontSize: 16,
            }
        },
        grid: {
            left: "3%",
            right: "3.5%",
            bottom: "5%",
            top: "20%",
            containLabel: true
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow"
            },
            padding: 10,
        },
        dataZoom: {
            yAxisIndex: [0, 23],
            show: false,
            type: "slider", // 这个 dataZoom 组件是 slider 型 dataZoom 组件
            startValue: 0, // 从头开始。
            endValue: end // 一次性展示个数。
        },
        yAxis: [{
            type: "category",
            inverse: true,
            axisLabel: {
                // rotate: 45,
                textStyle: {
                    color: "#b9c4d3",
                    fontSize: 12
                },
                formatter: function (value) {
                    let length = 8;
                    let num = Math.ceil(value.length / length);
                    if (num > 1) {
                        let newValue = '';
                        for (let i = 0 ; i < num; i++) {
                            newValue += value.substring(i * length, (i + 1) * length) + '\n';
                        }
                        return newValue;
                    }
                    return value;
                }
            },
            axisTick: {
                show: false
            },
            axisLine: {
                show: false
            },
            data: dataName
        }],
        xAxis: {
            type: "value",
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false,
                lineStyle: {
                    color: "#fff"
                }
            },
            axisLabel: {
                textStyle: {
                    color: "#fff",
                    fonSize: 12
                },
                show: false
            },
            min: 6,
            max: 24,
            interval: 3
        },
        series: [
            {
                type: "bar",
                barWidth: 20,
                itemStyle: {
                    normal: {
                        // color: "#1890FF"
                        // color: "red"
                        color: (data) => {
                            if (data.value >= 20) {
                                return "#1890FF";
                            } else if (data.value >= 17) {
                                return "#b9c4d3";
                            } else {
                                return "#15CDCA";
                            }
                        }
                    }
                },
                label: {
                    //图形上的文本标签
                    normal: {
                        show: true,
                        position: "right",
                        textStyle: {
                            color: "#b9c4d3",
                            fontStyle: "normal",
                            fontFamily: "微软雅黑",
                            fontSize: 12
                        }
                    },
                },
                data: dataList
            }
        ]
    }
    chart.setOption(option);
    autoScroll(dataList.length - 1, dataName, chart);
}
function autoScroll(length, dataName, scrollChart) {
    setInterval(() => {
        // 每次向后滚动一个，最后一个从头开始。
        if (Number(option.dataZoom.endValue) === length) {
            option.dataZoom.endValue = end;
            option.dataZoom.startValue = 0;
        } else {
            option.dataZoom.endValue = option.dataZoom.endValue + 1;
            option.dataZoom.startValue = option.dataZoom.startValue + 1;
        }
        scrollChart.setOption(option);
    }, 3000);
}

initScrollRankChart();


//散点图
productJson.sort((p1, p2) => {
    return Number(p2.number) - Number(p1.number);
});
const bubbleChart = echarts.init(document.getElementById('product-rank'));
const getSeriesData = (datalist = []) => {
    let data = datalist,
        offsetData = [],
        symbolSizeData = [];
    //计算offsetData和symbolSizeData
    offsetData = [
        [8, 19],
        [17, 69],
        [26, 45],
        [35, 72],
        [44, 22],
        [53, 62],
        [63, 81],
        [72, 34],
        [81, 71],
        [91, 11]
    ];
    let mean = 0;
    data.forEach((d) => {
        mean += Number(d.value);
    });
    mean /= data.length;
    data.forEach((d) => {
        symbolSizeData.push(5.5 * Number(d.value) - 5 * mean);
    });

    let datas = [];
    for (let i = 0; i < data.length; i++) {
        let item = data[i];
        let itemName = "",
            nameArr = [];
        if (item && item.name) {
            itemName = item.name;
            nameArr = [];
        }
        if (itemName.length > 6) {
            nameArr.push(
                `{name|${itemName.slice(0, 6)}}`,
                `{name|${itemName.slice(6, itemName.length)}}`
            );
        } else {
            nameArr.push(item.name);
        }
        let formatter = [...nameArr, `\n{value|${item.value}}`].join("\n");
        datas.push({
            value: offsetData[i],
            symbolSize: symbolSizeData[i],
            label: {
                // 在文本中，可以对部分文本采用 rich 中定义样式。
                // 这里需要在文本中使用标记符号：
                // `{styleName|text content text content}` 标记样式名。
                // 注意，换行仍是使用 '\n'。
                formatter: formatter,
                align: "center",
                rich: {
                    name: {
                        color: "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: "Bold",
                        wordBreak: "break-all",
                        width: "6px",
                        overflow: "hidden",
                        textOverflow: "hidden",
                    },
                    value: {
                        fontSize: "12px",
                        fontWeight: "Bold",
                        color: "#81D0E8",
                    },
                },
            },
            itemStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.45, 0.7, [
                    {
                        offset: 0.3,
                        color: "rgba(0,215,233,0.1)",
                    },
                    {
                        offset: 1,
                        color: "rgba(0,215,233,0.8)",
                    },
                ]),
                opacity: 0.8,
                shadowColor: "#045878",
                borderWidth: 1,
                borderColor: "rgba(0, 215, 233, 1)",
                shadowBlur: 10,
                shadowOffsetX: 1,
                shadowOffsetY: 1,
            },
            emphasis: {
                label: {
                    rich: {
                        name: {
                            color: "#FFB229",
                            fontSize: "18px",
                            fontWeight: "Bold",
                        },
                        value: {
                            fontSize: symbolSizeData[i] > 125 ? "24px" : "18px",
                            fontWeight: "Bold",
                            color: "#FFB229",
                        },
                    },
                },
            },
        });
    }
    return datas;
};

let timeInterval = null;

let appArray = {
    currentIndex: 0
};

let selectIndex = 0;

function showTable(productJson) {
    let datas = [];
    productJson.forEach(p => {
        datas.push({
            "name": p.type,
            "value": p.number
        });
    });

    let option = {
        title: {
            text: "商品热度",
            left: 'center',
            top: 10,
            textStyle: {
                color: '#fff',
                fontWeight: 'normal',
                fontSize: 16,
            }
        },
        grid: {
            show: false,
            top: 10,
            bottom: 10,
        },
        xAxis: [
            {
                gridIndex: 0,
                type: "value",
                show: false,
                min: 0,
                max: 100,
                nameLocation: "middle",
                nameGap: 5,
            },
        ],
        yAxis: [
            {
                gridIndex: 0,
                min: 0,
                show: false,
                max: 100,
                nameLocation: "middle",
                nameGap: 30,
            },
        ],
        series: [
            {
                type: "scatter",
                symbol: "circle",
                symbolSize: 120,
                label: {
                    show: true,
                    formatter: "{b}",
                    color: "#fff",
                    fontSize: "16",
                },

                itemStyle: {
                    color: "#00acea",
                },
                emphasis: {
                    itemStyle: {
                        color: new echarts.graphic.RadialGradient(0.5, 0.45, 0.7, [
                            {
                                offset: 0.3,
                                color: "rgba(191, 153, 30,0.1)",
                            },
                            {
                                offset: 1,
                                color: "rgba(191, 153, 30,0.8)",
                            },
                        ]),
                        opacity: 0.8,
                        shadowColor: "rgba(191, 153, 30,1)",
                        borderWidth: 1,
                        borderColor: "rgba(191, 153, 30, 1)",
                        shadowBlur: 10,
                        shadowOffsetX: 1,
                        shadowOffsetY: 1,
                    },
                },
                data: getSeriesData(datas),
            },
        ],
    };
    // 图表动效及点击效果start
    bubbleChart.setOption(option);
    const highlight = (option, datalist) => {
        appArray.currentIndex = 0;
        timeInterval = setInterval(async () => {
            let dataLen = option.series[0].data.length;
            //取消之前高亮的图形
            bubbleChart.dispatchAction({
                type: "downplay",
                seriesIndex: 0,
                dataIndex: appArray.currentIndex,
            });
            appArray.currentIndex = (appArray.currentIndex + 1) % dataLen;
            //高亮当前图形
            bubbleChart.dispatchAction({
                type: "highlight",
                seriesIndex: 0,
                dataIndex: appArray.currentIndex,
            });
        }, 1000);
    };
    highlight(option, datas);

    bubbleChart.on("click", (params) => {
        if (params.seriesType == "scatter") {
            clearInterval(timeInterval);
            let { dataIndex } = params;
            selectIndex = dataIndex;
            bubbleChart.dispatchAction({
                type: "downplay",
                seriesIndex: 0,
                dataIndex: appArray.currentIndex,
            });
            bubbleChart.dispatchAction({
                type: "highlight",
                seriesIndex: 0,
                dataIndex: dataIndex,
            });
            appArray.currentIndex = dataIndex;
            startTimeout();
        }
    });

    const startTimeout = () => {
        setTimeout(() => {
            if (selectIndex == appArray.currentIndex) {
                restartInterval();
            } else {
                startTimeout();
            }
        }, 2000);
    };

    const restartInterval = () => {
        timeInterval = setInterval(async () => {
            let dataLen = datas.length;
            //取消之前高亮的图形
            bubbleChart.dispatchAction({
                type: "downplay",
                seriesIndex: 0,
                dataIndex: appArray.currentIndex,
            });
            appArray.currentIndex = (appArray.currentIndex + 1) % dataLen;
            //高亮当前图形
            bubbleChart.dispatchAction({
                type: "highlight",
                seriesIndex: 0,
                dataIndex: appArray.currentIndex,
            });
        }, 1000);
    };
}

showTable(productJson.slice(0, 10).sort(() => { return Math.random() > 0.5 ? -1 : 1; }));