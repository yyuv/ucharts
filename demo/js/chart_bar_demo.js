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
                height = height * 0.7 - 30;
                width -= 30;

                if (height > width) {
                    container.node().style.height = width + "px";
                }

                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text.indexOf("创建") >= 0) {
                        render();
                    }
                    else if (text.indexOf("刷新") >= 0) {
                        update();
                    }
                });


                function render() {
                    //1.基本绘图
                    var margin = {top: 10, right: 10, bottom: 30, left: 30};
                    //var dataset = [ 11, 12, 15, 20, 18, 17, 16, 18, 23, 25, 8, 10, 13, 19, 21, 25, 22, 18, 15, 13];
                    var dataset = [11, 12, 15, 20, 18, 17, 16, 18, 23, 25];
                    // 使用了d3.scale.ordinal() 它支持范围分档。与定量比例尺（如d3.scale.linear()）返回连续的范围值不同，序数比例尺使用的是离散范围值，也就是输出值是事先就确定好的。
                    // 映射范围时，可以使用range()，也可以使用rangeBands()。后者接收一个最小值和一个最大值，然后根据输入值域的长度自动将其切分成相等的块或“档”。0.2也就是档间距为每一档宽度的20%。
                    var x = d3.scale.ordinal()
                        .domain(d3.range(dataset.length))
                        .rangeBands([0, width], 0.2);

                    var y = d3.scale.linear()
                        .domain([0, d3.max(dataset, function (d) {
                            return d;
                        })])
                        .range([height, 0]);

                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom");

                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left");

                    var container = d3.select("#container");
                    container.select("svg").remove();
                    var svg = container.append("svg")
                        .attr("width", width + margin.left + margin.right)
                        .attr("height", height + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


                    svg.selectAll("rect")// 插入的不是circle了，改为rect
                        .data(dataset)
                        .enter()
                        .append("rect")
                        .attr("x", function (d, i) {
                            return x(i);
                        })
                        .attr("y", function (d) {
                            return y(0);
                        })
                        .attr("width", x.rangeBand())
                        .attr("height", function (d) {
                            return height - y(0);
                        })
                        .attr("fill", function (d) {
                            return "rgb(255, 127, 127)";//"rgb(60, 127, " + d * 10 + ")";// 根据值的大小获取颜色
                        })
                        .transition()
                        .duration(2000)
                        .ease("elastic")
                        .attr("y", function (d) {
                            return y(d);
                        })
                        .attr("height", function (d) {
                            return height - y(d);
                        });
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis)
                        .append("text")
                        .attr("class", "label")
                        .attr("x", width)
                        .attr("y", -6)
                        .style("text-anchor", "end")
                        .text("X轴");

                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis)
                        .append("text")
                        .attr("class", "label")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .text("Y轴");


                }

                function update() {
                    _updateFlag++;

                    // 新数据集
                    //var dataset = [ 21, 22, 25, 10, 18, 17, 6, 8, 13, 15, 15, 20, 23, 19, 11,15, 25, 8, 25, 23 ];
                    var dataset = (_updateFlag % 2) ? [21, 22, 25, 10, 18, 17, 6, 8, 13, 15] :
                        [11, 12, 15, 20, 18, 17, 16, 18, 23, 25];
                    // 更新所有矩形
                    var svg = d3.select("#container>svg");

                    var x = d3.scale.ordinal()
                        .domain(d3.range(dataset.length))
                        .rangeBands([0, width], 0.2);

                    var y = d3.scale.linear()
                        .domain([0, d3.max(dataset, function (d) {
                            return d;
                        })])
                        .range([height, 0]);

                    svg.selectAll("rect")
                        .data(dataset)
                        .transition()
                        .duration(2000)
                        .ease("elastic") //• circle:     逐渐进入并加速，然后突然停止。
                        //• elastic:    描述这个效果的一个最恰当的词是“有弹性”。
                        //• bounce:     像皮球落地一样反复弹跳，慢慢停下来。
                        //• linear:     线性，匀速
                        /*.delay(function(d, i) {
                         return i * 100;
                         })*/
                        .attr("y", function (d) {
                            return y(d);
                        })
                        .attr("height", function (d) {
                            return height - y(d);
                        });
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });

