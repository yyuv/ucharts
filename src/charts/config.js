define(function () {
    return {
        ucharts: [
            {
                categoryName: "PieChart",
                showName: "饼图",
                chartTypes: [
                    {
                        chartName: "Pie2D",
                        showName: "2D饼图",
                        module: "./pie/pie2d"
                    },
                    {
                        chartName: "D3Pie",
                        showName: "D3饼图",
                        module: "./pie/D3Pie"
                    },
                    {
                        chartName: "EChartPie",
                        showName: "EChart饼图",
                        module: "./pie/EChartPie"
                    }
                ]
            },
            {
                categoryName: "BarChart",
                showName: "柱形图",
                chartTypes: [
                    {
                        chartName: "D3Bar",
                        showName: "D3柱形图",
                        module: "./bar/D3Bar"
                    },
                    {
                        chartName: "EChartBar",
                        showName: "EChart柱形图",
                        module: "./bar/EChartBar"
                    }
                ]
            },
            {
                categoryName: "Advance",
                showName: "高级图表",
                chartTypes: [
                    {
                        chartName: "TagCloud",
                        showName: "标签云",
                        module: "./advance/TagCloud"
                    },
                    {
                        chartName: "TreeMap",
                        showName: "树图",
                        module: "./advance/TreeMap"
                    }
                ]
            }
        ],

        themeUrl: "./default-theme.js"
    };
});
