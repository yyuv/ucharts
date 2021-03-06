/**
 * Created by Jasion on 15/2/3.
 */

define(['require', '../../uve/graphics', '../../uve/animation', '../../uve/behavior',
    '../base', '../../../lib/d3/d3'], function (require, graph, anima, behav, uchart) {

    /**
     * 饼图实现，更适合移动端
     *
     * @param container 容器，一般是一个HTML DIV元素
     *
     * @class
     * @extends UChartBase
     */
    function UChartPie(container) {

        this.init(container);

        var _tipCtrl = null;
        var _pieLayer = null;
        var _drillIndicator = null;
        var _currentArc = null;
        var _cx = 0, _cy = 0, _r = 0;
        var _rotateAngle = 0;

        this.render = function () {
            // 先调用父类的render，处理背景、标题等
            UChartPie.prototype.render.call(this);

            var chartLayer = this.chartLayer(true);
            var pieBaseRatio = 0.816;
            var width = chartLayer.width(), height = chartLayer.height();
            var radius = Math.min(width, height * pieBaseRatio) / 2;
            var sizeRatio = Math.min(radius / 280, width / 582);

            // draw back
            var src = require.toUrl("../images/Pie_back.png");   // 560 x 560
            var backImg = new graph.Image(width / 2 - radius, 0, radius * 2, radius * 2, src);
            chartLayer.addShape(backImg);

            // draw pie
            var pieRatio = 0.82;
            _cx = width / 2;
            _cy = radius;
            _r = radius * pieRatio;

            // 添加饼图层
            _pieLayer = new graph.Group().translate([_cx, _cy]);
            chartLayer.addShape(_pieLayer);

            this.updateData();

            // draw cover
            src = require.toUrl("../images/Pie_cover.png");   // 560 x 560
            var coverImg = new graph.Image(width / 2 - radius, 0, radius * 2, radius * 2, src)
                .pointerEvents("none");  // 避免cover接收事件导致下层饼图图形无法收到事件
            chartLayer.addShape(coverImg);

            // draw base
            src = require.toUrl("../images/Pie_base.png");       //582 x 148 (22)
            var baseImg = new graph.Image(0, radius * 2 - 30 * sizeRatio, width, 148 * sizeRatio, src);
            chartLayer.addShape(baseImg);

            // draw pointer
            src = require.toUrl("../images/Pie_pointer_up.png");       //582 x 148 (22)
            var ponterImg = new graph.Image(0, radius * 2 - 80 * sizeRatio, width, 128 * sizeRatio, src);
            chartLayer.addShape(ponterImg);

            // draw drill arrow
            src = require.toUrl("../images/Pie_base_drill.png");       //582 x 148 (22)
            var d = 71 * sizeRatio;
            var x = width / 2 + d * 3;
            var y = radius * 2 - 30 * sizeRatio + d * 0.6;
            _drillIndicator = new graph.Circle(x+d/2, y+d/2, 20 * sizeRatio)
                .fill("none");
            chartLayer.addShape(_drillIndicator);
            var drillImg = new graph.Image(x, y, d, d, src).pointerEvents(false);
            chartLayer.addShape(drillImg);

            _tipCtrl = new graph.Text(width / 2, radius * 2 + 80 * sizeRatio, "")
                .textAnchor("middle")
                .fontSize(14);
            chartLayer.addShape(_tipCtrl);

            this.handleBehaviors();

            return this;
        };

        this.updateData = function () {
            // 将数据转换为适合饼图的格式（包含startAngle, endAngle属性）
            var dataset = this.dataset();
            if (dataset == null) {
                return this;
            }

            var values = dataset.data().map(function (d) {
                return d[1];
            });
            var piedata = d3.layout.pie().sort(null)(values);
            piedata.forEach(function (d, i) {
                d.category = dataset.rowData(i)[0];
            });

            // var colors = d3.scale.category20();
            var palette = this.property("palette");
            var colors = d3.scale.ordinal().range(palette);

            // 无需动画时，可直接通过graph.Arc生产饼图扇形区域
            /*_pieLayer.onDataEnter = function (d, i) {
             var arc = new graph.Arc(cx, cy, r, d.startAngle, d.endAngle)
             .fill(colors(i));
             _pieLayer.addShape(arc);
             arc.datum(d);
             };*/

            var arc = d3.svg.arc().outerRadius(_r);
            _pieLayer.dataEnter (function (d, i) {
                var path = new graph.Path(arc({startAngle: 0, endAngle: 0}))
                    .fill(colors(i));
                _pieLayer.addShape(path);
                d.color = colors(i);
                path.datum(d);

                var animation = new anima.Animation("bounce", 2000,
                    {
                        path: function () {
                            // 通过自定义插值函数实现不规则的d值动画
                            var interpolate = d3.interpolate({startAngle: d.startAngle, endAngle: d.startAngle}, d);
                            return function (t) {
                                return arc(interpolate(t));
                            };
                        }
                    });
                animation.toShapes(path);

                path.lastAngle = {startAngle: d.startAngle, endAngle: d.endAngle};
            });

            _pieLayer.onDataUpdate = function (d, i, shape) {
                var from = shape.lastAngle;
                var animation = new anima.Animation("elastic", 2000,
                    {
                        path: function () {
                            // 通过自定义插值函数实现不规则的d值动画
                            var interpolate = d3.interpolate(from, d);
                            return function (t) {
                                return arc(interpolate(t));
                            };
                        }
                    });
                animation.toShapes(shape);

                d.color = shape.fill();
                shape.lastAngle = {startAngle: d.startAngle, endAngle: d.endAngle};
            };

            _pieLayer.onDataExit = function (d, i) {
                this.remove();
            };

            _pieLayer.updateData(piedata);

            // 动画结束后让指针对中
            setTimeout(pointCenter, 2100);

            return this;
        };

        /**
         * 因饼图代表数据的图形并不在chartLayer上，覆盖此方法提供，以便父类可正常处理链接等
         *
         * @override
         */
        this.itemShapes = function () {
            var shapes = _pieLayer ? _pieLayer.shapes() : null;
            return shapes;
        };

        this.handleBehaviors = function () {
            UChartPie.prototype.handleBehaviors.call(this);

            new behav.Touch().click(function (x, y) {
                // 在组上监听事件，然后hitTest确定事件源，比每个shape建立监听性能高很多
                var arc = _pieLayer.hitTestShape(x, y);
                if (arc != null) {
                    pointCenter(arc);
                }
            }).toShapes(_pieLayer);

            var dragAngle = 0;
            var startPos = null;
            new behav.Drag()
                .dragStart(function (x, y) {
                    startPos = d3.mouse(_pieLayer.node().parentNode);
                })
                .dragMove(function (x, y) {
                    var pos = d3.mouse(_pieLayer.node().parentNode);
                    var p0 = {x: _cx, y: _cy};
                    var p1 = {x: startPos[0], y: startPos[1]};
                    var p2 = {x: pos[0], y: pos[1]};
                    dragAngle = calcAngle(p0, p1, p2);
                    if ((p1.y < p0.y && p2.y < p0.y && p2.x < p1.x /*&& Math.abs(p2.y-p1.y) < Math.abs(p2.x-p1.x)*/) ||  // 上部
                        (p1.x < p0.x && p2.x < p0.x && p2.y > p1.y /*&& Math.abs(p2.y-p1.y) > Math.abs(p2.x-p1.x)*/) ||  // 左部
                        (p1.y > p0.y && p2.y > p0.y && p2.x > p1.x /*&& Math.abs(p2.y-p1.y) < Math.abs(p2.x-p1.x)*/) ||  // 下部
                        (p1.x > p0.x && p2.x > p0.x && p2.y < p1.y /*&& Math.abs(p2.y-p1.y) > Math.abs(p2.x-p1.x)*/)) {  // 右部
                        dragAngle = -dragAngle;
                    }
                    dragAngle += _rotateAngle;
                    _pieLayer.rotate(dragAngle * 180 / Math.PI);
                })
                .dragEnd(function (x, y) {
                    _rotateAngle = dragAngle;
                    pointCenter();
                })
                .toShapes(_pieLayer);

            if (_drillIndicator) {
                // 钻取标志
                var chart = this;
                new behav.Touch()
                    .click(function() {
                        // 只有点击钻取标志才钻取，禁止父类默认点击饼块进行钻取
                        UChartPie.prototype.doLink.call(chart, _currentArc);
                    })
                    .toShapes(_drillIndicator);
            }
        };

        /**
         * 覆盖父类钻取方法，禁止默认钻取，改为点击钻取标志进行钻取
         */
        this.doLink = function (shape) {

        };

        function calcAngle(p0, p1, p2) {
            var dx1 = p1.x - p0.x;
            var dy1 = p1.y - p0.y;
            var dx2 = p2.x - p0.x;
            var dy2 = p2.y - p0.y;

            var c = Math.sqrt(dx1 * dx1 + dy1 * dy1) * Math.sqrt(dx2 * dx2 + dy2 * dy2);
            if (c == 0) {
                return -1;
            }

            var angle = Math.acos((dx1 * dx2 + dy1 * dy2) / c);
            return angle;
        }

        function pointCenter(arc) {
            if (arc == null) {
                var pointerAngle = Math.PI - _rotateAngle;
                if (pointerAngle < 0) {
                    pointerAngle += Math.PI * 2;
                }
                else if (pointerAngle > Math.PI * 2) {
                    pointerAngle -= Math.PI * 2;
                }
                _pieLayer.shapes().some(function (shape) {
                    var datum = shape.datum();
                    if (datum != null && datum.startAngle < pointerAngle && datum.endAngle > pointerAngle) {
                        arc = shape;
                        return true;
                    }

                    return false;
                });
            }
            if (arc != null) {
                var datum = arc.datum();
                if (datum != null) {
                    _tipCtrl.text(datum.category + ": " + datum.value)
                        .fill(datum.color);

                    _drillIndicator.fill(datum.color);

                    var newStartAngle = Math.PI - (datum.endAngle - datum.startAngle) / 2;
                    _rotateAngle = newStartAngle - datum.startAngle;
                    var animation = new anima.Animation("bounce", 2000, {rotate: _rotateAngle * 180 / Math.PI});
                    animation.toShapes(_pieLayer);
                }
            }

            _currentArc = arc;
        }
    }

    UChartPie.prototype = new uchart.UChartBase();
    UChartPie.prototype.constructor = UChartPie;

    return {
        Chart: UChartPie
    };
});