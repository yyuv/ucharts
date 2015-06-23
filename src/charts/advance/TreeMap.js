/**
 * Created by Jasion on 15/5/24.
 */


define(['require', '../../uve/graphics', '../../uve/animation', '../../uve/behavior',
    '../base', '../../../lib/d3/d3'], function (require, graph, anima, behav, base) {

    /**
     * 树图实现类
     *
     * @param container 容器，一般是一个HTML DIV元素
     *
     * @class
     * @extends UChartBase
     */
    function TreeMap(container) {

        var _width = 0, _height = 0;
        var _parentNode = null;
        var _treemap = null;
        var _fillColor = null;
        var _levelData = null;
        var _hoverLayer = null;
        var _breadcrumb = null;
        var _data = null;

        this.init = function () {
            TreeMap.prototype.init.call(this, container);

            // 初始化属性值
            var dataPlot = new base.DataPlot()
                .font(new base.Font(12, "Verdana, Arial, sans-serif").color("white"))
                .border(new base.LineStyle("yellow", 1));

            this.dataPlot(dataPlot)
                .idColumn(0)
                .categoryColumn(1)
                .valueColumn(2)
                .parentIdColumn(3)
                .hoverBorder(new base.LineStyle("orange", 2))
                .link("#"); // 为了触发doLink，在doLink中钻取到下一层
        };

        // -----------------------------------------------
        // 图表属性

        /**
         * 树形数据集的ID列
         */
        this.idColumn = function (value) {
            return this.attr("idColumn", value);
        };

        /**
         * 树形数据集的父ID列
         */
        this.parentIdColumn = function (value) {
            return this.attr("parentIdColumn", value);
        };

        /**
         * 是否显示数值
         */
        this.showValue = function (value) {
            return this.attr("showValue", value);
        };

        /**
         * 鼠标移动到的块边框（颜色、线型等）
         */
        this.hoverBorder = function (value) {
            return this.attr("hoverBorder", value);
        };

        /**
         * 树图的面包屑属性
         */
        this.breadcrumb = function (value) {
            return this.attr("breadcrumb", value);
        };
        // -----------------------------------------------

        this.render = function () {
            // 先调用父类的render，处理背景、标题等
            TreeMap.prototype.render.call(this);

            // 面包屑导航条
            _breadcrumb = null;
            var breadcrumbLayer = this.breadcrumbLayer(true);
            if (breadcrumbLayer) {
                _breadcrumb = new base.Breadcrumb(breadcrumbLayer, 0, 0, breadcrumbLayer.height());
                var height = this.property("breadcrumb.height");
                var color = this.property("breadcrumb.color");
                var hoverColor = this.property("breadcrumb.hoverColor");
                var border = this.property("breadcrumb.border");
                var gap = this.property("breadcrumb.gap");
                var marginTop = this.property("breadcrumb.marginTop");
                var marginBottom = this.property("breadcrumb.marginBottom");
                if (height) {
                    _breadcrumb.height(height);
                }
                if (color) {
                    _breadcrumb.color(color);
                }
                if (hoverColor) {
                    _breadcrumb.hoverColor(hoverColor);
                }
                if (border) {
                    _breadcrumb.border(border);
                }
                if (gap) {
                    _breadcrumb.gap(gap);
                }
                if (marginTop) {
                    _breadcrumb.marginTop(marginTop);
                }
                if (marginBottom) {
                    _breadcrumb.marginBottom(marginBottom);
                }
            }

            this.updateData();
        };

        this.updateData = function () {
            var chartLayer = this.chartLayer(true);
            chartLayer.clearAll();

            _width = chartLayer.width();
            _height = chartLayer.height();

            _treemap = d3.layout.treemap()
                .size([_width-2, _height-2])
                .sticky(true)
                .children(function(d, depth) {
                    return d.children;
                });

            var palette = this.property("palette");
            _fillColor = d3.scale.ordinal().range(palette);

            var dataRoot = this.treeData();
            renderDataNode.call(this, dataRoot);

            if (_breadcrumb) {
                _breadcrumb.render(dataRoot);
            }
        };

        this.breadcrumbLayer = function (autoCreate) {
            var height = this.property("breadcrumb.height");
            if (height > 0) {
                return this.layer("breadcrumb", autoCreate, "top", height);
            }

            return null;
        };

        this.treeData = function () {
            if (_data) {
                return _data;
            }
            else {
                var dataset = this.dataset();
                if (dataset) {
                    var table = dataset.data(), chart = this;
                    var id, name, value, parentId, rootNode = null;
                    var data = {};

                    table.forEach(function (d, i) {
                        id = d[0];
                        name = d[1];
                        value = d[2];
                        parentId = d[3];
                        data[id] = {category: name};
                        if (value != null && value != "") {
                            data[id].value = value;
                        }
                        if (parentId == null || parentId == "") {
                            if (rootNode) {
                                throw new Error("There are two or more lines have an empty parentID.");
                            }

                            rootNode = data[id];
                        }

                        // 绑定数据项到数据集，用于链接时获取自定义列的值等
                        chart.bindDatumToDataset(data[id], i);
                    });

                    var node, parentNode;
                    table.forEach(function (d, i) {
                        id = d[0];
                        parentId = d[3];
                        node = data[id];
                        if (parentId != null && parentId != "") {
                            parentNode = data[parentId];
                            if (parentNode.children == null) {
                                parentNode.children = [node];
                            }
                            else {
                                parentNode.children.push(node);
                            }
                        }
                    });

                    return rootNode;
                }
            }

            return null;
        };

        this.data = function (data) {
            if (data === undefined) {
                return _data;
            }
            else {
                _data = data;
                return this;
            }
        };

        function renderDataNode (dataNode) {
            if (dataNode == _parentNode) {
                return this;
            }

            var chartLayer = this.backMode(/*_parentNode != null*/true).chartLayer(true);
            chartLayer.clearAll();

            _treemap = d3.layout.treemap()
                .size([_width-2, _height-2])
                .sticky(true)
                .sort(function (a, b) { return a.value - b.value; })
                .children(function(d, depth) {
                    return d.children;
                });

            var chart = this;
            var drillDown = (_parentNode == dataNode.parent);
            dataNode.parent = undefined;
            _levelData = _treemap(dataNode);
            _levelData.forEach(function (d, i) {
                if (d.depth == 1) {
                    var color = chart.property("dataPlot.color", null, d);
                    if (color == null) {
                        color = _fillColor(d.category.toLowerCase());
                    }
                    var border = chart.property("dataPlot.border", null, d);
                    var font = chart.property("dataPlot.font", null, d);

                    var rect = new graph.Rect(d.x+1, d.y+1, Math.max(0, d.dx), Math.max(0, d.dy))
                        .fill(color);
                    if (border) {
                        base.util.applyBorderTo(border, rect);
                    }

                    chartLayer.addShape(rect);
                    rect.datum(d);

                    if (d.dx > 10 && d.dy > 10) {
                        var text1 = new graph.Text(d.x + d.dx/2, d.y + d.dy/2, d.category)
                            .textAnchor("middle")
                            .dominantBaseline("middle")
                            .pointerEvents(false);
                        base.util.applyFontTo(font, text1);
                        chartLayer.addShape(text1);

                        if (text1.bbox().width > d.dx) {
                            text1.textLength(d.dx-2)
                                .lengthAdjust("spacingAndGlyphs");
                        }

                        if (chart.showValue()) {
                            var valueFont = chart.property("dataPlot.valueFont", font, d);
                            var valueFormat = chart.property("dataPlot.valueFormat", null, d);
                            var space = (base.util.valueOf(font.size, font) + base.util.valueOf(valueFont.size, valueFont)) / 2 + 4;
                            var value = valueFormat? base.util.format(d.value, valueFormat) : d.value;
                            var text2 = new graph.Text(d.x + d.dx/2, d.y + d.dy/2 + space, value)
                                .textAnchor("middle")
                                .dominantBaseline("middle")
                                .pointerEvents(false);
                            base.util.applyFontTo(valueFont, text2);
                            chartLayer.addShape(text2);

                            if (text2.bbox().width > d.dx) {
                                text2.textLength(d.dx-2)
                                    .lengthAdjust("spacingAndGlyphs");
                            }
                        }
                    }
                }
            });

            _parentNode = dataNode;

            if (this.backMode()) {
                if (drillDown) {
                    this.toForeground("slideInLeft");
                }
                else {
                    this.toForeground("slideOutRight");
                }
            }

            this.handleBehaviors();
        }

        function hoverDataNode (node, over) {
            var chartLayer = this.chartLayer(false);
            if (over && !_hoverLayer) {
                _hoverLayer = new graph.Group()
                    .opacity(0)
                    .pointerEvents("none");
                chartLayer.addShape(_hoverLayer);

                var chart = this, totalRect = {x1:_width,y1:_height,x2:0,y2:0};
                _levelData.forEach(function (d, i) {
                    if (d.depth == 2 && d.parent == node) {
                        var rect = new graph.Rect(d.x+1, d.y+1, Math.max(0, d.dx), Math.max(0, d.dy))
                            .fill(_fillColor(d.category.toLowerCase()))
                            .stroke("yellow")
                            .strokeWidth(0.6)
                            .pointerEvents(false);
                        _hoverLayer.addShape(rect);
                        rect.datum(d);

                        totalRect.x1 = Math.min(totalRect.x1, d.x);
                        totalRect.y1 = Math.min(totalRect.y1, d.y);
                        totalRect.x2 = Math.max(totalRect.x2, d.x + Math.max(0, d.dx));
                        totalRect.y2 = Math.max(totalRect.y2, d.y + Math.max(0, d.dy));

                        if (d.dx > 10 && d.dy > 10) {
                            var text1 = new graph.Text(d.x+10, d.y+20, d.category)
                                .x(d.x + d.dx/2)
                                .y(d.y + d.dy/2)
                                .textAnchor("middle")
                                .dominantBaseline("middle")
                                .fill("white")
                                .fontSize(12)
                                .pointerEvents(false);
                            _hoverLayer.addShape(text1);

                            if (text1.bbox().width > d.dx) {
                                text1.textLength(Math.max(d.dx-2, 0))
                                    .lengthAdjust("spacingAndGlyphs");
                            }

                            if (chart.showValue()) {
                                var text2 = new graph.Text(d.x+10, d.y+36, d.value)
                                    .x(d.x + d.dx/2)
                                    .y(d.y + d.dy/2 + 14)
                                    .textAnchor("middle")
                                    .dominantBaseline("middle")
                                    .fill("yellow")
                                    .fontSize(8)
                                    .pointerEvents(false);
                                _hoverLayer.addShape(text2);

                                if (text2.bbox().width > d.dx) {
                                    text2.textLength(d.dx-2)
                                        .lengthAdjust("spacingAndGlyphs");
                                }
                            }
                        }
                    }
                });

                var hoverBorder = this.property("hoverBorder");
                if (totalRect.x1 < _width && hoverBorder) {
                    var rect = new graph.Rect(totalRect.x1, totalRect.y1,
                        totalRect.x2-totalRect.x1, totalRect.y2-totalRect.y1)
                        .fill("none")
                        .pointerEvents(false);
                    base.util.applyBorderTo(hoverBorder, rect);
                    _hoverLayer.addShape(rect);
                }

                var animation = new anima.Animation("linear", 200, {opacity: 1});
                animation.toShapes(_hoverLayer);
            }
            else if (!over && _hoverLayer) {
                var animation = new anima.Animation("linear", 300, {opacity: 0});
                animation.onShapeTransitionEnd = function () {
                    // 动画结束后，删除hoverLayer
                    this.remove();
                };

                _hoverLayer.opacity(1);
                animation.toShapes(_hoverLayer);
                _hoverLayer = null;
            }

            return this;
        }

        /**
         * 执行链接（覆盖父类方法）
         */
        this.doLink = function (shape) {
            var datum = shape? shape.datum() : null;
            if (datum && datum.children) {
                renderDataNode.call(this, datum);
                if (_breadcrumb) {
                    _breadcrumb.render(datum);
                }
            }
        };

        this.handleBehaviors = function () {
            TreeMap.prototype.handleBehaviors.call(this);

            var chart = this;
            var chartLayer = this.chartLayer(false);
            var rects = chartLayer.selectShapes("Rect");
            var timer = null;
            new behav.Touch()
                .moveIn(function (x, y) {
                    var datum = this.datum();
                    if (timer != null) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    timer = setTimeout(function() {
                        // 使用Timeout处理，否则在iOS中增删DOM会导致后续的Click事件无法触发
                        timer = null;
                        hoverDataNode.call(chart, datum, true);
                    }, 200);

                })
                .moveOut(function (x, y) {
                    if (timer != null) {
                        clearTimeout(timer);
                        timer = null;
                    }
                    else {
                        var datum = this.datum();
                        hoverDataNode.call(chart, datum, false);
                    }
                })
                .toShapes(rects);

            if (_breadcrumb) {
                _breadcrumb.itemClick(function (datum) {
                    renderDataNode.call(chart, datum);
                    _breadcrumb.render(datum);
                });
            }
        };

        this.init();
    }

    TreeMap.prototype = new base.UChartBase();
    TreeMap.prototype.constructor = TreeMap;

    return {
        Chart: TreeMap
    };
});
