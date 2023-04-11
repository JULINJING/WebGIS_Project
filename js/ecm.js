import json from "../NYPD.json"

// 基于准备好的dom，初始化echarts实例
var myChart1 = echarts.init(document.getElementById('main1'));
var myChart2 = echarts.init(document.getElementById('main2'));
var myChart3 = echarts.init(document.getElementById('main3'));
var myChart4 = echarts.init(document.getElementById('main4'));
var myChart5 = echarts.init(document.getElementById('main5'));
var myChart6 = echarts.init(document.getElementById('main6'));

// 指定图表的配置项和数据
//1
var option1 = {
    title: {
        text: '各自治市镇犯罪发生次数',
        textStyle: {
            fontSize: 18,
        },
    },
    tooltip: {
        show: true,
        confine: true,
        trigger: 'item',
        formatter: '{b}<br/>{c}（人）'
    },
    legend: {
        icon: 'diamond',
        orient: 'horizontal',
        left: 'right',
        itemWidth: 20,
        itemHeight: 20,
        itemStyle: {
            color: '#56ACFF',
        },
        textStyle: {
            color: '#6A93B9',
        },
        data: ['人数'],
    },
    grid: {
        left: '20%',
        right: '0',
        bottom: '0',
        top: '5%',
    },
    xAxis: {
        type: 'value',
        splitLine: {
            show: false,
        },
        splitArea: {
            show: false,
        },
    },
    yAxis: [
    {
        type: 'category',
        inverse: true,
        splitLine: {
            show: false,
        },
        axisTick: {
            show: false,
        },
        axisLine: {
            show: false,
        },
        axisLabel: {
            fontSize: 12,
            align: 'right',
            color: '#6A93B9',
        },
        offset: 0,
        data: json.BORO_NM,
    },
    ],
    series: [
    {
        z: 2,
        name: '人数',
        type: 'bar',
        zlevel: 1,
        barWidth: 40,
        itemStyle: {
            normal: {
                barBorderRadius: 30,
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 1,
                    y2: 0,
                    colorStops: [
                    {
                        offset: 0,
                        color: 'rgba(32, 75, 255, 0.07)', //  0%处的颜色
                    },
                    {
                        offset: 0.7,
                        color: 'rgba(83, 203, 255, 0.92)', //  100%处的颜色
                    },
                    {
                        offset: 1,
                        color: '#56ACFF', //  100%处的颜色
                    },
                    ],
                    global: false, //  缺省为false
                },
            },
        },
        data: json.BORO_NM_DATA,
    },
    ],
};

//2
var option2 = {
    title: {
        text: '犯罪完成情况',
        textStyle: {
            fontSize: 18,
        },
    },
    tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c}（人）'
    },
    legend: {
        type: 'scroll',
        selectedMode: true,
        data: json.CRM_ATPT_CPTD_CD,
        top: 100,
        right: 50,
        orient: 'vertical'
    },
    series: [
        {
            name: '犯罪完成情况',
            type: 'pie',
            radius: ['30%', '80%'],
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c}（人）<br/>占{d}%"
            },
            label: {
                show: true,
                position: 'inside',
                formatter: '{b} : {d}%',
            },
            labelLine: {
                show: false
            },
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 5,
            },
            emphasis: {
                focus: 'none',
                label: {
                    fontSize: 20,
                    fontWeight: 'bold'
                }
            },
            data: [
            { name: '完成', value: json.CRM_ATPT_CPTD_CD_DATA[0] },
            { name: '未遂', value: json.CRM_ATPT_CPTD_CD_DATA[1] },
            ],
            animationDuration: function (idx) {
                // 越往后的数据时长越大
                return idx * 1500;
            }
        }
    ]
};

//3
var option3 = {
    title: {
        text: '犯罪程度情况',
        textStyle: {
            fontSize: 18,
        },
    },
    legend: {
        orient: 'horizontal',
        top: 50,
        right: 50,
        data: json.LAW_CAT_CD,    //数据
        textStyle: {
            color: "#000",
        }
    },
    tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
    },
    series: [{
        name: '犯罪级别',
        type: 'pie',
        radius: ['30%', '80%'],
        roseType: 'radius',
        data: [{
                value: json.LAW_CAT_CD_DATA[0],
                name: json.LAW_CAT_CD[0],
                itemStyle: {
                    color: "#F18C6E",
                    borderColor: "#F18C6E",
                    show:false
                    
                }
            },
            {
                value: json.LAW_CAT_CD_DATA[1],
                name: json.LAW_CAT_CD[1],
                itemStyle: {
                    color: "#2CA4FB",
                    borderColor: "#2CA4FB"
                }
            },
            {
                value: json.LAW_CAT_CD_DATA[2],
                name: json.LAW_CAT_CD[2],
                itemStyle: {
                    color: "#91CC75",
                    borderColor: "#91CC75"
                }
            }
        ],
        label: {
                show: false,
                normal: {
                    formatter: '{b} : {d}%',
                    show: true,
                    position: 'inside'
                },
        },
        labelLine: {
            normal: {
                show: false
            }
        },
        emphasis: {
            focus: 'none',
            label: {
                fontSize: 20,
                fontWeight: 'bold'
            }
        }
    }]
};

//4
let zoomShow4 = false;
if (json.SUSP_AGE_GROUP.length > 4) {
    zoomShow4 = true;
} else {
    zoomShow4 = false;
}
var option4 = {
    title: {
        text: '嫌疑人/受害者年龄分布',
        textStyle: {
            fontSize: 18,
        },
    },
    dataZoom: [//滚动条
        {
            show: zoomShow4,
            type: 'slider',
            realtime: true,
            startValue: 0,
            endValue: 3,
            xAxisIndex: [0],
            bottom: '3%',
            left: '60',
            height: 10,
            borderColor: 'rgba(0,0,0,0)',
            textStyle: {
                color: '#05D5FF',
            },
        },
    ],
    legend: {
        data: ['嫌疑人人数（柱状）', '受害者人数（柱状）', '嫌疑人人数（折线）', '受害者人数（折线）'],
        itemGap: 2,
        itemWidth: 10,
        itemHeight: 10,
        x: 'center',
        top: '10%',
        textStyle: {
            color: '#000',
            fontSize: 12,
        }
    },
    grid: {
        top: '18%',
        left: '5%',
        right: '3%',
        bottom: '8%',
        containLabel: true
    },
    tooltip: {
        show: true,
        trigger: 'axis',
        textStyle: {
            color: '#fff',
            fontSize: 14
        },
        backgroundColor: 'rgba(18, 57, 60, .8)', //设置背景颜色
        borderColor: "rgba(18, 57, 60, .8)",
        formatter: function (params) {
            return (
                params[0].name +
                '<br/>' +
                params[0].marker +
                params[0].seriesName +
                ' : ' +
                params[0].value +
                '人' +
                '<br/>' +
                params[1].marker +
                params[1].seriesName +
                ' : ' +
                params[1].value +
                '人' +
                '<br/>' +
                params[2].marker +
                params[2].seriesName +
                ' : ' +
                params[2].value +
                '人' +
                '<br/>' +
                params[3].marker +
                params[3].seriesName +
                ' : ' +
                params[3].value +
                '人'
            );
        },
        axisPointer: {
            lineStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: 'rgba(0, 255, 233,0)',
                        },
                        {
                            offset: 0.5,
                            color: 'rgba(255, 255, 255,1)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(0, 255, 233,0)',
                        },
                    ],
                    global: false,
                },
            },
        },
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            axisLabel: {
                interval: 0,
                align: 'center',
                rotate: '40',
                margin: '25',
                textStyle: {
                    fontSize: 13,
                    color: '#000'
                }
            },
            boundaryGap: true,
            data: json.SUSP_AGE_GROUP,
        },
    ],
    yAxis: [
        {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(28, 130, 197, 0.3)',
                    type: 'dotted'
                },
            },
            axisLabel: {
                color: '#DEEBFF',
                textStyle: {
                    fontSize: 12
                }
            },
            axisTick: {
                show: false
            }
        },
        {
            show: false,
            type: 'value',
            position: 'right',
            axisLabel: {
                formatter: '{value}%', //使图变成百分比形式
            },
            splitLine: {
                //网格线显不显示
                show: false,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
        },
    ],
    series: [
        {
            name: '嫌疑人人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.SUSP_AGE_GROUP_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#0281FF' : '#01FEFF',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#01FEFF' : '#0281FF',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '受害者人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.VIC_AGE_GROUP_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#1DBEA5' : '#029B60',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#029B60' : '#1DBEA5',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '嫌疑人人数（折线）',
            type: 'line',
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    color: '#009EF8',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#009EF8',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#009EF8',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(0, 166, 255, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(0, 166, 255, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.SUSP_AGE_GROUP_DATA, 
        },
        {
            name: '受害者人数（折线）',
            type: 'line',
            yAxisIndex: 1,
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                normal: {
                    color: '#FFE555',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#FFE555',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#FFE555',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(255, 229, 85, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 229, 85, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.VIC_AGE_GROUP_DATA,
        },
    ],
};

//5
let zoomShow5 = false;
if (json.SUSP_RACE.length > 4) {
    zoomShow5 = true;
} else {
    zoomShow5 = false;
}
var option5 = {
    title: {
        text: '嫌疑人/受害者种族分布',
        textStyle: {
            fontSize: 18,
        },
    },
    dataZoom: [//滚动条
        {
            show: zoomShow5,
            type: 'slider',
            realtime: true,
            startValue: 0,
            endValue: 3,
            xAxisIndex: [0],
            bottom: '3%',
            left: '60',
            height: 10,
            borderColor: 'rgba(0,0,0,0)',
            textStyle: {
                color: '#05D5FF',
            },
        },
    ],
    legend: {
        data: ['嫌疑人人数（柱状）', '受害者人数（柱状）', '嫌疑人人数（折线）', '受害者人数（折线）'],
        itemGap: 2,
        itemWidth: 10,
        itemHeight: 10,
        x: 'center',
        top: '10%',
        textStyle: {
            color: '#000',
            fontSize: 12,
        }
    },
    grid: {
        top: '18%',
        left: '5%',
        right: '3%',
        bottom: '8%',
        containLabel: true
    },
    tooltip: {
        show: true,
        trigger: 'axis',
        textStyle: {
            color: '#fff',
            fontSize: 14
        },
        backgroundColor: 'rgba(18, 57, 60, .8)', //设置背景颜色
        borderColor: "rgba(18, 57, 60, .8)",
        formatter: function (params) {
            return (
                params[0].name +
                '<br/>' +
                params[0].marker +
                params[0].seriesName +
                ' : ' +
                params[0].value +
                '人' +
                '<br/>' +
                params[1].marker +
                params[1].seriesName +
                ' : ' +
                params[1].value +
                '人' +
                '<br/>' +
                params[2].marker +
                params[2].seriesName +
                ' : ' +
                params[2].value +
                '人' +
                '<br/>' +
                params[3].marker +
                params[3].seriesName +
                ' : ' +
                params[3].value +
                '人'
            );
        },
        axisPointer: {
            lineStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: 'rgba(0, 255, 233,0)',
                        },
                        {
                            offset: 0.5,
                            color: 'rgba(255, 255, 255,1)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(0, 255, 233,0)',
                        },
                    ],
                    global: false,
                },
            },
        },
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            axisLabel: {
                interval: 0,
                align: 'center',
                rotate: '40',
                margin: '25',
                textStyle: {
                    fontSize: 13,
                    color: '#000'
                }
            },
            boundaryGap: true,
            data: json.SUSP_RACE,
        },
    ],
    yAxis: [
        {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(28, 130, 197, 0.3)',
                    type: 'dotted'
                },
            },
            axisLabel: {
                color: '#DEEBFF',
                textStyle: {
                    fontSize: 12
                }
            },
            axisTick: {
                show: false
            }
        },
        {
            show: false,
            type: 'value',
            position: 'right',
            axisLabel: {
                formatter: '{value}%', //使图变成百分比形式
            },
            splitLine: {
                //网格线显不显示
                show: false,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
        },
    ],
    series: [
        {
            name: '嫌疑人人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.SUSP_RACE_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#0281FF' : '#01FEFF',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#01FEFF' : '#0281FF',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '受害者人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.VIC_RACE_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#1DBEA5' : '#029B60',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#029B60' : '#1DBEA5',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '嫌疑人人数（折线）',
            type: 'line',
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    color: '#009EF8',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#009EF8',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#009EF8',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(0, 166, 255, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(0, 166, 255, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.SUSP_RACE_DATA, 
        },
        {
            name: '受害者人数（折线）',
            type: 'line',
            yAxisIndex: 1,
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                normal: {
                    color: '#FFE555',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#FFE555',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#FFE555',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(255, 229, 85, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 229, 85, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.VIC_RACE_DATA,
        },
    ],
};

//6
let zoomShow6 = false;
if (json.SUSP_SEX.length > 4) {
    zoomShow6 = true;
} else {
    zoomShow6 = false;
}
var option6 = {
    title: {
        text: '嫌疑人/受害者性别分布',
        textStyle: {
            fontSize: 18,
        },
    },
    dataZoom: [//滚动条
        {
            show: zoomShow6,
            type: 'slider',
            realtime: true,
            startValue: 0,
            endValue: 3,
            xAxisIndex: [0],
            bottom: '3%',
            left: '60',
            height: 10,
            borderColor: 'rgba(0,0,0,0)',
            textStyle: {
                color: '#05D5FF',
            },
        },
    ],
    legend: {
        data: ['嫌疑人人数（柱状）', '受害者人数（柱状）', '嫌疑人人数（折线）', '受害者人数（折线）'],
        itemGap: 2,
        itemWidth: 10,
        itemHeight: 10,
        x: 'center',
        top: '10%',
        textStyle: {
            color: '#000',
            fontSize: 12,
        }
    },
    grid: {
        top: '18%',
        left: '5%',
        right: '3%',
        bottom: '8%',
        containLabel: true
    },
    tooltip: {
        show: true,
        trigger: 'axis',
        textStyle: {
            color: '#fff',
            fontSize: 14
        },
        backgroundColor: 'rgba(18, 57, 60, .8)', //设置背景颜色
        borderColor: "rgba(18, 57, 60, .8)",
        formatter: function (params) {
            return (
                params[0].name +
                '<br/>' +
                params[0].marker +
                params[0].seriesName +
                ' : ' +
                params[0].value +
                '人' +
                '<br/>' +
                params[1].marker +
                params[1].seriesName +
                ' : ' +
                params[1].value +
                '人' +
                '<br/>' +
                params[2].marker +
                params[2].seriesName +
                ' : ' +
                params[2].value +
                '人' +
                '<br/>' +
                params[3].marker +
                params[3].seriesName +
                ' : ' +
                params[3].value +
                '人'
            );
        },
        axisPointer: {
            lineStyle: {
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        {
                            offset: 0,
                            color: 'rgba(0, 255, 233,0)',
                        },
                        {
                            offset: 0.5,
                            color: 'rgba(255, 255, 255,1)',
                        },
                        {
                            offset: 1,
                            color: 'rgba(0, 255, 233,0)',
                        },
                    ],
                    global: false,
                },
            },
        },
    },
    xAxis: [
        {
            type: 'category',
            axisTick: {
                show: false,
            },
            splitLine: {
                show: false,
            },
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            axisLabel: {
                interval: 0,
                align: 'center',
                rotate: '40',
                margin: '25',
                textStyle: {
                    fontSize: 13,
                    color: '#000'
                }
            },
            boundaryGap: true,
            data: json.SUSP_SEX,
        },
    ],
    yAxis: [
        {
            type: 'value',
            axisLine: {
                lineStyle: {
                    color: '#1C82C5'
                }
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(28, 130, 197, 0.3)',
                    type: 'dotted'
                },
            },
            axisLabel: {
                color: '#DEEBFF',
                textStyle: {
                    fontSize: 12
                }
            },
            axisTick: {
                show: false
            }
        },
        {
            show: false,
            type: 'value',
            position: 'right',
            axisLabel: {
                formatter: '{value}%', //使图变成百分比形式
            },
            splitLine: {
                //网格线显不显示
                show: false,
            },
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false,
            },
        },
    ],
    series: [
        {
            name: '嫌疑人人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.SUSP_SEX_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#0281FF' : '#01FEFF',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#01FEFF' : '#0281FF',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '受害者人数（柱状）',
            type: 'bar',
            barMaxWidth: '16px',
            data: json.VIC_SEX_DATA.map((item) => {
                return {
                    value: item,
                    itemStyle: {
                        normal: {
                            barBorderRadius: item > 0 ? [15, 15, 0, 0] : [0, 0, 15, 15], //左上角参数1, 右上角参数2, 右下角参数3, 左下角参数4
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 0,
                                    color: item > 0 ? '#1DBEA5' : '#029B60',
                                },
                                {
                                    offset: 1,
                                    color: item > 0 ? '#029B60' : '#1DBEA5',
                                },
                            ]),
                        },
                    },
                };
            }),
        },
        {
            name: '嫌疑人人数（折线）',
            type: 'line',
            yAxisIndex: 1, //使用的 y 轴的 index，在单个图表实例中存在多个 y轴的时候有用
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 10,
            lineStyle: {
                normal: {
                    color: '#009EF8',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#009EF8',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#009EF8',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(0, 166, 255, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(0, 166, 255, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.SUSP_SEX_DATA, 
        },
        {
            name: '受害者人数（折线）',
            type: 'line',
            yAxisIndex: 1,
            showAllSymbol: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                normal: {
                    color: '#FFE555',
                },
            },
            label: {
                show: false,
                position: 'top',
                textStyle: {
                    color: '#FFE555',
                },
            },
            itemStyle: {
                color: '#fff',
                borderColor: '#FFE555',
                borderWidth: 2,
            },
            areaStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(
                        0,
                        0,
                        0,
                        1,
                        [
                            {
                                offset: 0,
                                color: 'rgba(255, 229, 85, 1)',
                            },
                            {
                                offset: 1,
                                color: 'rgba(255, 229, 85, .4)',
                            },
                        ],
                        false
                    ),
                },
            },
            data: json.VIC_SEX_DATA,
        },
    ],
};

// 使用刚指定的配置项和数据显示图表。
myChart1.setOption(option1);
myChart2.setOption(option2);
myChart3.setOption(option3);
myChart4.setOption(option4);
myChart5.setOption(option5);
myChart6.setOption(option6);