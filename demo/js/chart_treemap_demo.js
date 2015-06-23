/**
 * Created by Jasion on 15/2/2.
 */

define(['require', '../../src/uve/graphics', '../../src/uve/animation', '../../src/charts/base'],
    function (require, graph, anima, base) {
        function PageExecutor() {
            var _chart = null;

            this.execute = function () {
                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text.indexOf("创建图表") >= 0) {
                        render();
                    }
                    else if (text.indexOf("额外数据") >= 0) {
                        extInfo();
                    }
                    else if (text.indexOf("条件格式") >= 0) {
                        conditionFormat();
                    }
                });

                var uchart = null;
                require(['../../src/charts/advance/TreeMap'], function (mod) {
                    uchart = mod;
                });


                function render() {
                    if (_chart) {
                        _chart.destroy();
                    }
                     var container = d3.select("div#container");
                    _chart = new uchart.Chart(container);

                    // 通过json传入已规范为树结构的数据
                    require(['./treemap_data'], function (data) {
                        _chart.data(data);

                        // 设置Tooltip，含兼容Excel的格式化函数format和计算表达式
                        var tipHtml = "<p><strong><span style='font-size:14px;color:#006600;" +
                            "white-space:nowrap;'>{$CATEGORY}</span></strong></p>" +
                            "<span style='color:#E56600;'>数量：{$VALUE}</span>" +
                            "<br/><span style='color:#E56600;'>金额：{!format({$VALUE}*100000, '#.00元')}</span>";

                        _chart.tip({html: tipHtml})
                            .title({text: "树图演示"})
                            .border({color: "red", thickness: 2})
                            .render();
                    });
                }

                function extInfo() {
                    alert("注意：请留意提示框中的信息，额外信息项来自数据集中传入的额外列");

                    var meta = {
                        columns: [
                            {name: "ID", title: "ID", datatype: "String"},
                            {name: "Name", title: "名称", datatype: "String"},
                            {name: "Value", title: "值", datatype: "Number"},
                            {name: "ParentID", title: "父ID", datatype: "String"},
                            {name: "ExtInfo", title: "自定义列", datatype: "String"}
                        ]
                    };
                    var data =
                        "1,所有产品,,,abc\n" +
                        "2,食品,,1,ext-001\n" +
                        "21,面包,500,2,abc\n" +
                        "22,饼干,500,2,abc\n" +
                        "23,肉类,,2,abc\n" +
                        "231,牛肉,500,23,abc\n" +
                        "232,猪肉,700,23,abc\n" +
                        "3,手机,1000,1,ext-002\n" +
                        "4,文具,1000,1,ext-003\n" +
                        "5,家电,500,1,ext-004\n";
                    var dataset = new base.Dataset(meta).parseCSV(data);

                    if (_chart) {
                        _chart.destroy();
                    }
                    var container = d3.select("div#container");
                    _chart = new uchart.Chart(container);
                    _chart.dataset(dataset);

                    var tipHtml = "<p><strong><span style='font-size:14px;color:#006600;'>{$CATEGORY}</span></strong></p>" +
                        "<span style='color:#E56600;'>本月销售：{!format({$VALUE}, '#.00元')}</span><br/>" +
                        "<span style='color:#E56600;'>额外信息：{!dataValue('ExtInfo')}</span>";

                    _chart.tip({html: tipHtml})
                        .title({text: "树图演示"})
                        .showValue(true)
                        .render();
                }

                function conditionFormat() {
                    alert("注意：设置颜色条件表达式，大于2000显示绿色、1000到2000显示橙色，低于1000显示红色");

                    var meta = {
                        columns: [
                            {name: "ID", title: "ID", datatype: "String"},
                            {name: "Name", title: "名称", datatype: "String"},
                            {name: "Value", title: "值", datatype: "Number"},
                            {name: "ParentID", title: "父ID", datatype: "String"},
                            {name: "ExtInfo", title: "自定义列", datatype: "String"}
                        ]
                    };
                    var data =
                        "1,所有产品,,,abc\n" +
                        "2,食品,,1,ext-001\n" +
                        "21,面包,500,2,abc\n" +
                        "22,饼干,500,2,abc\n" +
                        "23,肉类,,2,abc\n" +
                        "231,牛肉,500,23,abc\n" +
                        "232,猪肉,700,23,abc\n" +
                        "3,手机,1000,1,ext-002\n" +
                        "4,文具,1000,1,ext-003\n" +
                        "5,家电,500,1,ext-004\n";
                    var dataset = new base.Dataset(meta).parseCSV(data);

                    if (_chart) {
                        _chart.destroy();
                    }
                    var container = d3.select("div#container");
                    _chart = new uchart.Chart(container);
                    _chart.dataset(dataset);

                    var tipHtml = "<p><strong><span style='font-size:14px;color:#006600;'>{$CATEGORY}</span></strong></p>" +
                        "<span style='color:#E56600;'>本月销售：{!format({$VALUE}, '#.00元')}</span><br/>" +
                        "<span style='color:#E56600;'>额外信息：{!dataValue('ExtInfo')}</span>";

                    // 根据条件变换颜色
                    var colorExpr = "{!" +
                        "if ({$VALUE} >= 2000) 'green';" +
                        "else if ({$VALUE} >= 1000) 'orange';" +
                        "else 'red';" +
                        "}";

                    _chart.tip({html: tipHtml})
                        .title({text: "树图演示"})
                        .showValue(true)
                        .forceProperty("dataPlot.color", colorExpr)
                        .render();
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });
