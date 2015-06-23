/**
 * Created by Jasion on 15/2/2.
 */

define(['require', '../../src/charts/base', '../../src/charts/basic/UChartPie'],
    function (require, base, uchart) {
        function PageExecutor() {
            var _chart = null;
            var _updateFlag = 0;

            this.execute = function () {
                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text.indexOf("创建图表") >= 0) {
                        createUChart();
                    }
                    else if (text.indexOf("刷新数据") >= 0) {
                        refreshData();
                    }
                });


                function createUChart() {
                    if (_chart) {
                        _chart.destroy();
                    }

                    // 创建数据集
                    var meta = {
                        columns: [
                            {name: "region", title: "地区", datatype: "String"},
                            {name: "amount", title: "销售额", datatype: "Number"}
                        ]
                    };
                    var data = "华北,32886.65\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56";
                    var dataset = new base.Dataset(meta).parseCSV(data);

                    // 创建图表对象
                    var container = d3.select("div#container");
                    _chart = new uchart.Chart(container)
                        .dataset(dataset)
                        .title({text: "地区销售统计"})
                        .link("javascript:alert('{$CATEGORY}地区销售额: {!format({$VALUE}, \"#.00元\")}')")
                        .render();
                }

                function refreshData() {
                    _updateFlag ++;
                    var data = (_updateFlag % 2)?
                        "华北,5813.22\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56" :
                        "华北,32886.65\n华东,28966.33\n华南,33122.98\n西北,18995.22\n华中,8918.56";
                    _chart.dataset().parseCSV(data);
                    _chart.updateData();
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    }
);
