define(function () {
    return {
        // 全局属性
        UChartBase: {
            palette: [
                // d3_category20b
                "#393b79",
                "#5254a3",
                "#6b6ecf",
                "#9c9ede",
                "#637939",
                "#8ca252",
                "#b5cf6b",
                "#cedb9c",
                "#8c6d31",
                "#bd9e39",
                "#e7ba52",
                "#e7cb94",
                "#843c39",
                "#ad494a",
                "#d6616b",
                "#e7969c",
                "#7b4173",
                "#a55194",
                "#ce6dbd",
                "#de9ed6"
            ],

            tip: {
                scheme: "green", opacity: 0.9, shadow: true, animation: true,
                // html: "<span style='white-space:nowrap;'>名称: {$CATEGORY}</span><br/><span style='white-space:nowrap;'>数值: {$VALUE}</span>"
            },

            title: {
                // height: 30,
                font: {family: "Helvetica, Arial, sans-serif", size: 24, color: "orange", bold: true},
                location: "top center"
            },

            marginLeft: 12,
            marginRight: 12,
            marginTop: 10,
            marginBottom: 10

            // background: {color: "#a02da7e1"},
            // border: {color: "cyan", thickness: 2},
            // dataPlot: {color: "blue", border: {color: "blue", thickness: 1}, font: {family: "Verdana", size: 12}}
        },

        // 饼图属性
        UChartPie: {
            palette: [
                // d3_category20
                "#1f77b4",
                "#aec7e8",
                "#ff7f0e",
                "#ffbb78",
                "#2ca02c",
                "#98df8a",
                "#d62728",
                "#ff9896",
                "#9467bd",
                "#c5b0d5",
                "#8c564b",
                "#c49c94",
                "#e377c2",
                "#f7b6d2",
                "#7f7f7f",
                "#c7c7c7",
                "#bcbd22",
                "#dbdb8d",
                "#17becf",
                "#9edae5"
            ]
        },

        // 标签云属性
        TagCloud: {
            dataPlot: {font: {family: "Impact"}},
            startFontSize: 8,
            endFontSize: 24
            // startAngle: -60,
            // endAngle: 60,
            // orientations: 5,
            // categoryColumn: 0,
            // valueColumn: 1
        },

        // 树图属性
        TreeMap: {
            breadcrumb: {
                height: 30,
                marginTop: 1,
                marginBottom: 2,
                gap: 3,
                color: "#669933",
                hoverColor: "#F37F13"
            },
            idColumn: 0,
            categoryColumn: 1,
            valueColumn: 2,
            parentIdColumn: 3,
            dataPlot: {
                border: {color: "yellow", thickness: 1},
                font: {family: "Verdana, Arial, sans-serif", size: 12, color: "white"},
                valueFont: {family: "Verdana, Arial, sans-serif", size: 8, color: "yellow"},
                // valueFormat: "￥#.00"
            },
            hoverBorder: {color: "orange", thickness: 2}
        }
    };
});
