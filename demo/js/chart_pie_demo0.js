/**
 * Created by Jasion on 15/2/2.
 */

define(['require', '../../src/uve/graphics', '../../src/uve/animation', '../../src/charts/base'],
    function (require, graph, anima, base) {
        function PageExecutor() {
            var _chart = null;
            var _updateFlag = 0;

            this.execute = function () {
                var container = d3.select("div#container");
                var width = container.node().clientWidth;
                var height = container.node().clientHeight;
                if (height > width) {
                    container.node().style.height = width + "px";
                }

                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text.indexOf("UCharts") >= 0) {
                        renderByUCharts();
                    }
                    else if (text.indexOf("D3") >= 0) {
                        renderByD3();
                    }
                    else if (text.indexOf("ECharts") >= 0) {
                        renderByECharts();
                    }
                });


                // require.config({baseUrl: "js"});

                function renderByUCharts() {
                    require(['../../src/charts/basic/UChartPie'], function (uchart) {
                        if (_chart == null || !(_chart instanceof uchart.Chart) || _chart.updateData == null) {
                            _chart = new uchart.Chart(container);
                            renderChart(_chart);
                        }
                        else {
                            updateChart(_chart);
                        }
                    });
                }

                function renderByD3() {
                    require(['../../test/charts/D3Pie'], function (d3chart) {
                        if (_chart == null || !(_chart instanceof d3chart.Chart) || _chart.updateData == null) {
                            _chart = new d3chart.Chart(container);
                            renderChart(_chart);
                        }
                        else {
                            updateChart(_chart);
                        }
                    });
                }

                function renderByECharts() {
                    require(['../../test/charts/EChartPie'], function (echart) {
                        if (_chart == null || !(_chart instanceof echart.Chart) || _chart.updateData == null) {
                            _chart = new echart.Chart(container);
                            renderChart(_chart);
                        }
                        else {
                            updateChart(_chart);
                        }
                    });
                }

                function renderChart(chart) {
                    var option = {
                        title: {
                            text: '地区销售统计',
                            //subtext: '2014年度',
                            x: 'center',
                            textStyle: {
                                fontSize: 18,
                                fontWeight: 'bolder',
                                color: 'yellow'          // 主标题文字颜色
                            }
                        },
                        tooltip: {
                            //show: true
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c} ({d}%)'
                        },
                        series: [
                            {
                                name: '销售额',
                                type: 'pie',
                                radius: '70%',
                                center: ['50%', '60%']
                            }
                        ],
                        calculable: true
                    };

                    var meta = {
                        columns: [
                            {name: "region", title: "地区", datatype: "String"},
                            {name: "amount", title: "销售额", datatype: "Number"}
                        ]
                    };

                    var data = "华北,32886.65\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56";
                    var dataset = new base.Dataset(meta).parseCSV(data);

                    container.selectAll("*").remove();

                    chart.option(option)
                        .dataset(dataset)
                        .render();
                }

                function updateChart(chart) {
                    _updateFlag ++;
                    var data = (_updateFlag % 2)? "华北,5813.22\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56" :
                        "华北,32886.65\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56";
                    chart.dataset().parseCSV(data);
                    if (chart.updateData != null) {
                        chart.updateData();
                    }
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });

