/**
 * Created by Jasion on 14/12/6.
 */

/**
 * 可视化组件基础模块
 */
define(['require', '../uve/graphics', '../uve/animation', '../uve/behavior',
    '../../lib/d3/d3'], function (require, graph, anima, behav) {

    var _config = null;
    var _util = null;
    var _ready = null;

    /**
     * 可视化组件基础类
     *
     * @param container     容纳组件的容器或父组件
     *
     * @class
     * @extends BaseObject
     */
    function UChartBase() {

        this.init = function (container) {
            UChartBase.prototype.init.call(this);

            if (container instanceof Array) {
                // is d3 selection
                this.__container__ = container.node();
            }
            else {
                this.__container__ = container;
            }

            this.__gc__ = null;
            this.__option__ = null;             // 选项，随可视化组件不同选项内容则不同
            this.__dataset__ = null;            // 数据集，暂时支持一个，看需要可扩展支持多个
            this.__backMode__ = false;
            this.__tooltip__ = null;
            this.__layers__ = [];
            this.__forceProperties__ = null;

            // 设置默认属性
            this.marginTop(10)
                .marginBottom(10)
                .marginLeft(13)
                .marginRight(13);

            this.palette(["#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
                    "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"]
            );
        };

        //------------------------------------
        // 图表公共属性

        /**
         * 设置/获取样式类
         */
        this.styleClass = function (value) {
            return this.attr("styleClass", value);
        };

        /**
         * 设置/获取调色板
         *
         * @param value     颜色数组，e,g,["#ff0000","red"]
         */
        this.palette = function (value) {
            return this.attr("palette", value);
        };

        /**
         * 设置/获取背景
         */
        this.background = function (value) {
            return this.attr("background", value);
        };

        /**
         * 设置/获取边框类型
         */
        this.border = function (value) {
            return this.attr("border", value);
        };

        /**
         * 设置/获取标题
         * @param value
         */
        this.title = function (value) {
            return this.attr("title", value);
        };

        /**
         * 设置/获取提示框属性
         */
        this.tip = function (value) {
            return this.attr("tip", value);
        };

        /**
         * 设置/获取超链接，支持{$CATEGORY}、{$VALUE}等内置变量
         */
        this.link = function (value) {
            return this.attr("link", value);
        };

        /**
         * 图表上部空白
         */
        this.marginTop = function (value) {
            return this.attr("marginTop", value);
        };

        /**
         * 图表下部空白
         */
        this.marginBottom = function (value) {
            return this.attr("marginBottom", value);
        };

        /**
         * 图表左边空白
         */
        this.marginLeft = function (value) {
            return this.attr("marginLeft", value);
        };

        /**
         * 图表右边空白
         */
        this.marginRight = function (value) {
            return this.attr("marginRight", value);
        };

        /**
         * 图表项属性，包括每个图表项的颜色、边框等
         */
        this.dataPlot = function (value) {
            return this.attr("dataPlot", value);
        };

        /**
         * 图表分类/名称据列序号
         */
        this.categoryColumn = function (value) {
            return this.attr("categoryColumn", value);
        };

        /**
         * 图表的数值列序号
         */
        this.valueColumn = function (value) {
            return this.attr("valueColumn", value);
        };
        //------------------------------------

        function valueAccessor(value) {
            /*if (value != null && typeof value == "object") {
             // 属性值转换为函数
             var allAttrs = Object.keys(value);
             n = allAttrs.length;
             for (i = 0; i < n; i++) {
             var name = allAttrs[i];
             if (typeof value[name] !== "function") {
             value[name] = valueAccessor(value[name]);
             }
             }
             }*/

            var _value = value;
            return function () {
                return _value;
            }
        }

        /**
         * 强制设置属性值，不受主题影响
         *
         * @param name      属性名
         * @param value     属性值
         */
        this.forceProperty = function (name, value) {
            if (this.__forceProperties__ == null) {
                this.__forceProperties__ = new d3.map();
            }

            this.__forceProperties__.set(name, value);
            return this;
        };

        /**
         * 获取指定名称的图表属性值，会自动搜索主题
         *
         * @param name          属性名称
         * @param defaultValue  默认值
         */
        this.property = function (name, defaultValue, datum) {
            // 1. 优先强制属性值
            var value = this.__forceProperties__? this.__forceProperties__.get(name) : undefined;

            // 2. 其次从主题获取
            if (value === undefined) {
                var theme = _config.theme();
                if (theme) {
                    // 存在主题，则先在主题按优先级别搜索属性设置
                    var styleClass = this.styleClass();
                    var typeName = this.type();
                    var styleObj, styleObjs = [];

                    if (styleClass) {
                        styleObj = theme[typeName + "$" + styleClass];
                        if (styleObj) {
                            styleObjs.push(styleObj);
                        }

                        styleObj = theme["$" + styleClass];
                        if (styleObj) {
                            styleObjs.push(styleObj);
                        }
                    }

                    styleObj = theme[typeName];
                    if (styleObj) {
                        styleObjs.push(styleObj);
                    }

                    styleObj = theme["UChartBase"];
                    if (styleObj) {
                        styleObjs.push(styleObj);
                    }

                    var i, n = styleObjs.length;
                    if (name.indexOf(".") < 0) {
                        for (i = 0; i < n; i++) {
                            styleObj = styleObjs[i];
                            value = styleObj[name];
                            if (value !== undefined) {
                                break;
                            }
                        }
                    }
                    else {
                        var names = name.split(".");
                        for (i = 0; i < n; i++) {
                            styleObj = styleObjs[i];
                            var obj = styleObj[names[0]];
                            if (obj != null) {
                                for (var j = 1; j < names.length; j++) {
                                    obj = obj[names[j]];
                                    if (j == names.length - 1) {
                                        value = obj;
                                        break;
                                    }
                                    if (obj == null) {
                                        break;
                                    }
                                }
                            }

                            if (value !== undefined) {
                                break;
                            }
                        }
                    }
                }
            }

            // 3. 最后返回图表本身设置
            if (value === undefined) {
                if (name.indexOf(".") < 0) {
                    value = this.attr(name);
                }
                else {
                    var names = name.split(".");
                    var obj = this.attr(names[0]);
                    if (obj != null) {
                        for (var j = 1; j < names.length; j++) {
                            value = obj[names[j]];
                            if (value == null) {
                                break;
                            }

                            if (typeof value == "function") {
                                value = value.call(obj);
                            }

                            obj = value;
                        }
                    }
                }
            }

            // 取默认值
            if (value == null && defaultValue != null) {
                value = defaultValue;
            }

            // 计算值
            if (value != null && datum !== undefined) {
                var type = typeof value;
                if (type == "function") {
                    value = value.call(this);
                }
                else if (type == "string") {
                    value = this.processExpr(value, datum);
                }
            }

            return value;
        };

        /**
         * 组件选项
         */
        this.option = function (value) {
            if (!arguments.length) {
                return this.__option__;
            }
            else {
                this.__option__ = value;
                return this;
            }
        };

        /**
         * 设置/获取图表数据集
         */
        this.dataset = function (value) {
            if (value === undefined) {
                return this.__dataset__;
            }
            else {
                this.__dataset__ = value;
                return this;
            }
        };

        /**
         * 获取/创建当前组件的绘图上下文
         *
         * @param reset 是否重置
         */
        this.gc = function (reset) {
            if (reset && this.__gc__ != null) {
                this.__gc__.clearAll();
            }
            else if (reset && this.__gc__ == null) {
                var size = this.containerSize();
                this.__gc__ = new graph.GraphicsContext(this.__container__, size[0], size[1]);
            }

            return this.__gc__;
        };

        /**
         * 返回背景层
         *
         * @param autoCreate    如果背景层不存在，是否自动创建
         */
        this.backgroundLayer = function (autoCreate) {

            return this.layer("bg", autoCreate, "back");
        };

        /**
         * 返回标题层
         *
         * @param autoCreate    如果标题层不存在，是否自动创建
         */
        this.titleLayer = function (autoCreate) {
            var titleHeight = this.property("title.height", 0);
            if (titleHeight == 0) {
                var font = this.property("title.font");
                if (font) {
                    titleHeight = _util.valueOf(font.size, font);
                    titleHeight += titleHeight / 2;
                }
            }

            var titleLocation = this.property("title.location");
            if (titleLocation && titleLocation.indexOf("bottom") >= 0) {
                return this.layer("title", autoCreate, "bottom", titleHeight);
            }
            else {
                return this.layer("title", autoCreate, "top", titleHeight);
            }
        };

        /**
         * 返回标题层
         *
         * @param autoCreate    如果标题层不存在，是否自动创建
         * @param backMode      后台模式，用于后台渲染，通过
         */
        this.chartLayer = function (autoCreate) {
            var backMode = this.backMode();
            var id = backMode ? "chart_back" : "chart";
            var curChartLayer = this.layer("chart", false);
            var chartLayer = this.layer(id, autoCreate, "none", 0, curChartLayer);
            if (backMode) {
                chartLayer.opacity(0);
            }

            return chartLayer;
        };

        /**
         * 是否后台模式，后台模式渲染不会马上显示出来，渲染完毕通过toForground显示出来，可应用动画
         */
        this.backMode = function (value) {
            if (value === undefined) {
                return this.__backMode__;
            }
            else {
                this.__backMode__ = value;
                return this;
            }
        };

        /**
         * 将后台渲染的内容显示出来
         *
         * @param thansition    动画效果，支持：slideInLeft、slideInRight、slideOutRight，等
         */
        this.toForeground = function (thansition) {
            if (this.backMode()) {
                var chartLayer = this.chartLayer(false);
                var parentLayer = chartLayer.group();
                var translate = chartLayer.translate();
                if (translate == null) {
                    translate = [0, 0];
                }
                else if (typeof translate == "string") {
                    translate = translate.split(",");
                    translate[0] = parseFloat(translate[0]);
                    translate[1] = parseFloat(translate[1]);
                }

                var curChartLayer = this.layer("chart", false);
                curChartLayer.id("chart_old");
                chartLayer.id("chart");

                var targetLayer = chartLayer;
                var containerSize = this.containerSize();
                if (thansition == "slideInLeft") {
                    var newTranslate = [translate[0] + containerSize[0], translate[1]];
                    chartLayer.translate(newTranslate).opacity(1);
                    parentLayer.sendToBack(curChartLayer, chartLayer);
                    targetLayer = chartLayer;
                }
                else if (thansition == "slideInRight") {
                    var newTranslate = [translate[0] - containerSize[0], translate[1]];
                    chartLayer.translate(newTranslate).opacity(1);
                    parentLayer.sendToBack(curChartLayer, chartLayer);
                    targetLayer = chartLayer;
                }
                else if (thansition == "slideOutRight") {
                    translate[0] += containerSize[0];
                    chartLayer.opacity(1);
                    targetLayer = curChartLayer;
                }

                var animation = new anima.Animation("linear", 500, {translate: translate})
                    .transitionEnd(function () {
                        curChartLayer.opacity(1);
                        animation = new anima.Animation("linear", 500, {opacity: 0})
                            .transitionEnd(function () {
                                this.remove();
                            });
                        animation.toShapes(curChartLayer);
                    });
                animation.toShapes(targetLayer);

                this.backMode(false);
            }

            return this;
        };

        /**
         * 数据集数据变化后，调用此方法刷新可视化组件
         */
        this.updateData = function () {
            // 由子类实现
        };

        /**
         * 渲染输出
         */
        this.render = function () {
            if (this.__container__) {
                this.__layers__ = [];
                this.gc(true);
                this.renderBackground();
                this.renderTitle();
            }
        };

        /**
         * 处理交互行为，基础类支持提示框、链接等交互操作
         */
        this.handleBehaviors = function () {
            var chart = this;
            var shapes = this.itemShapes();
            var tip = chart.property("tip");
            var link = chart.property("link");
            if ((tip || link) && shapes != null && shapes.length > 0) {
                if (link) {
                    shapes.forEach(function (shape) {
                        shape.cursor("hand");
                    });
                }

                var moving = 0, lastShape = null;
                new behav.Touch()
                    .moving(function () {
                        moving++;
                    })
                    .moveIn(function (x, y) {
                        chart.showTip(x, y, this.datum(), true);
                    })
                    .moveOut(function () {
                        var tooltip = chart.tooltip(false);
                        if (tooltip != null) {
                            tooltip.hide();
                        }
                    })
                    .click(function (x, y) {
                        // 在移动端，无Tip，点击则执行Link；有Tip则显示Tip，再次点击才执行Link
                        var tipHtml = chart.property("tip.html");
                        if (tipHtml == null || tipHtml == "") {
                            chart.doLink(this);
                        }
                        else if (moving < 3) {
                            chart.showTip(x, y, this.datum(), false);
                            moving = 3;
                        }
                        else if (moving > 5 || (moving >= 3 && moving <= 5 && lastShape == this)) {
                            var tooltip = chart.tooltip(false);
                            if (tooltip != null) {
                                tooltip.hide();
                            }
                            chart.doLink(this);
                            moving = 0;
                        }
                        else {
                            chart.showTip(x, y, this.datum(), false);
                            moving = 3;
                        }
                        lastShape = this;
                    })
                    .toShapes(shapes);
            }
        };

        /**
         * 显示提示框
         * @param x         提示框左上角位置x坐标
         * @param y         提示框左上角位置y坐标
         * @param datum     数据项，用于提示框内容的动态计算
         * @param autoMode  是否自动模式（自动模式当鼠标移动等操作会自动消失）
         */
        this.showTip = function (x, y, datum, autoMode) {
            var tipHtml = this.property("tip.html", null, datum);
            if (tipHtml != null && tipHtml != "") {
                var tooltip = this.tooltip(true);
                tooltip.autoMode(autoMode)
                    .html(tipHtml)
                    .show(x + 13, y + 13);
            }
        };

        /**
         * 渲染背景
         */
        this.renderBackground = function () {
            if (this.__container__ && this.__gc__) {
                var bgShape = null;
                var bg = this.property("background");
                if (bg != null) {
                    var bgLayer = this.backgroundLayer(true);
                    bgLayer.clearAll();
                    var width = bgLayer.width(), height = bgLayer.height();
                    bgShape = _util.applyBackgroundTo(bg, bgLayer, 0, 0, width, height);
                }

                var border = this.property("border");
                if (border && bgShape) {
                    _util.applyBorderTo(border, bgShape);
                }
            }
        };

        /**
         * 渲染标题
         */
        this.renderTitle = function () {
            var titleText = this.property("title.text");
            if (titleText) {
                var titleLayer = this.titleLayer(true);
                if (titleLayer) {
                    titleLayer.clearAll();

                    var textAnchor = "middle";
                    var location = this.property("title.location", "top center");
                    var x = titleLayer.width() / 2, y = titleLayer.height() / 2;
                    if (location && location.indexOf("left") >= 0) {
                        textAnchor = "start";
                        x = 2;
                    }
                    else if (location && location.indexOf("right") >= 0) {
                        textAnchor = "end";
                        x = titleLayer.width() - 2;
                    }

                    var text = new graph.Text(x, y, titleText)
                        .textAnchor(textAnchor)
                        .dominantBaseline("middle");

                    var font = this.property("title.font");
                    if (font) {
                        _util.applyFontTo(font, text);
                    }

                    titleLayer.addShape(text);
                }
            }
        };

        /**
         * 获取图表类型名称
         */
        this.type = function () {
            return this.constructor.name;
        };

        /**
         * 获取/设置容器
         */
        this.container = function (container) {
            if (container === undefined) {
                return this.__container__;
            }
            else {
                this.__container__ = container;
                return this;
            }
        };

        /**
         * 容器大小
         */
        this.containerSize = function () {
            if (this.__container__) {
                var width = parseInt(this.__container__.clientWidth),
                    height = parseInt(this.__container__.clientHeight);
                return [width, height];
            }

            return null;
        };

        /**
         * 执行超链接
         */
        this.doLink = function (shape) {
            var datum = shape? shape.datum() : null;
            var link = this.property("link", null, datum);
            if (link != null && link != "") {
                window.location.href = link;
            }
        };

        function findCount(source, target) {
            var re = new RegExp(target, "g");
            var matchs = source.match(re);
            return matchs ? matchs.length : 0;
        }

        function findExpr(source, from, isVariable) {
            var start = source.indexOf(isVariable ? "{$" : "{!", from);
            if (start < 0) {
                return null;
            }

            var end = 0, pos = start, expr = null;
            while ((pos = source.indexOf("}", pos + 1)) > 0) {
                expr = source.substring(start + 2, pos);
                if (findCount(expr, "{") == findCount(expr, "}")) {
                    end = pos;
                    break;
                }
            }
            if (end <= 0) {
                return null;
            }

            return {expr: expr, start: start, end: end};
        }

        function format(value, pattern) {
            return _util.format(value, pattern);
        }

        this.bindDatumToDataset = function (datum, rowIndex) {
            datum.dataRow = rowIndex;
        };

        /**
         * 处理字符串中嵌入的表达式，返回计算后的字符串
         *
         * @param source    源字符串
         * @param datum     数据项
         */
        this.processExpr = function (source, datum) {
            var result = source;
            if (result && result.indexOf("{!") >= 0) {
                // 内置函数，用于获取自定义列
                var chart = this;
                function dataValue(columnName) {
                    var dataset = chart.dataset();
                    if (dataset) {
                        var column = dataset.columnIndex(columnName);
                        if (column >= 0) {
                            var row = datum.dataRow;
                            if (row >= 0) {
                                var rowData = dataset.rowData(row);
                                return rowData[column];
                            }
                        }
                    }

                    return "!ERROR";
                }

                // 处理表达式
                var exprObj = null, value = null, pos = 0;
                while (exprObj = findExpr(result, pos)) {
                    if (datum != null && exprObj.expr.indexOf("{$") >= 0) {
                        exprObj.expr = _util.replaceAll(exprObj.expr, "{$CATEGORY}", "datum.category");
                        exprObj.expr = _util.replaceAll(exprObj.expr, "{$VALUE}", "datum.value");
                    }
                    value = eval(exprObj.expr);
                    if (exprObj.start == 0 && exprObj.end == result.length-1) {
                        // 整个source就是一个表达式，则直接返回表达式计算结果
                        return value;
                    }

                    result = result.substr(0, exprObj.start) + (value || "") + result.substr(exprObj.end + 1);
                    pos = exprObj.start;
                }
            }

            if (result && result.indexOf("{$") >= 0) {
                // 处理内置变量
                if (datum != null) {
                    result = _util.replaceAll(result, "{$CATEGORY}", datum.category);
                    result = _util.replaceAll(result, "{$VALUE}", datum.value);
                }

                // 处理自定义变量
                if (result && result.indexOf("{$") >= 0) {
                    var exprObj = null, value = null, pos = 0;
                    while (exprObj = findExpr(result, pos, true)) {
                        value = eval(exprObj.expr);
                        result = result.substr(0, exprObj.start) + (value || "") + result.substr(exprObj.end + 1);
                        pos = exprObj.start;
                    }
                }
            }

            return result;
        };

        /**
         * 返回提示框对象
         *
         * @param autoCreate    如果不存在，是否自动创建
         */
        this.tooltip = function (autoCreate) {
            if (this.__tooltip__ == null && autoCreate) {
                this.__tooltip__ = new Tooltip(
                    this.property("tip.scheme", "green"),
                    this.property("tip.opacity", 0.9),
                    this.property("tip.shadow"),
                    this.property("tip.animation"));
            }

            return this.__tooltip__;
        };

        /**
         * 销毁当前图形对象
         */
        this.destroy = function () {
            var gc = this.gc(false);
            var root = gc? gc.root() : null;
            if (root) {
                root.remove();
            }
        };

        /**
         * 返回/创建指定名称的层
         *
         * @param id            层ID
         * @param autoCreate    如果不存在，是否自动创建
         * @param dock          停靠模式：top,bottom,left,right,none
         * @param size          层的大小（根据停靠模式，可以是高度或宽度）
         */
        this.layer = function (id, autoCreate, dock, size, beforeLayer) {
            var layer = null;
            var i, n = this.__layers__.length;
            for (i = 0; i < n; i ++) {
                layer = this.__layers__[i];
                if (layer.id() == id) {
                    break;
                }
                else {
                    layer = null;
                }
            }
            
            if (layer == null && autoCreate && this.__gc__) {
                // 计算位置
                var containerSize = this.containerSize();
                if (dock == "back") {
                    // 背景层
                    layer = new Layer()
                        .id(id)
                        .x(0)
                        .y(0)
                        .width(containerSize[0])
                        .height(containerSize[1]);
                }
                else {
                    var left = this.property("marginLeft"), top = this.property("marginTop");
                    var right = this.property("marginRight"), bottom = this.property("marginBottom");
                    for (i = 0; i < n; i ++) {
                        layer = this.__layers__[i];
                        if (layer.dock() == "left") {
                            left += layer.width();
                        }
                        else if (layer.dock() == "right"){
                            right += layer.width();
                        }
                        else if (layer.dock() == "top"){
                            top += layer.height();
                        }
                        else if (layer.dock() == "bottom"){
                            bottom += layer.height();
                        }
                    }

                    layer = new Layer()
                        .id(id)
                        .dock(dock);
                    if (dock == "left") {
                        layer.x(left)
                            .y(top)
                            .width(size)
                            .height(Math.max(containerSize[1] - top - bottom, 0));
                    }
                    else if (dock == "right") {
                        layer.x(containerSize[0] - right - size)
                            .y(top)
                            .width(size)
                            .height(Math.max(containerSize[1] - top - bottom, 0));
                    }
                    else if (dock == "top") {
                        layer.x(left)
                            .y(top)
                            .width(Math.max(containerSize[0] - left - right, 0))
                            .height(size);
                    }
                    else if (dock == "bottom") {
                        layer.x(left)
                            .y(containerSize[1] - bottom - size)
                            .width(Math.max(containerSize[0] - left - right, 0))
                            .height(size);
                    }
                    else {
                        layer.x(left)
                            .y(top)
                            .width(Math.max(containerSize[0] - left - right, 0))
                            .height(Math.max(containerSize[1] - top - bottom, 0));
                    }
                }
                if (layer.x() || layer.y()) {
                    layer.translate([layer.x(), layer.y()]);
                }

                var root = this.__gc__.root();
                root.addShape(layer, beforeLayer);
                this.__layers__.push(layer);
            }

            return layer;
        };

        /**
         * 返回代表数据的图形集合（数组）
         */
        this.itemShapes = function () {
            var chartLayer = this.chartLayer(false);
            var shapes = chartLayer ? chartLayer.shapes() : null;
            return shapes;
        };
    }

    UChartBase.prototype = new graph.BaseObject();
    UChartBase.prototype.constructor = UChartBase;


    /**
     * 渲染层
     * 
     * @class
     * @extends Group
     */
    function Layer () {
        var _dock = null;
        var _x = 0, _y = 0;
        var _width = 0, _height = 0;

        /**
         * 渲染层停靠方式，包括：left、top、right、bottom、none
         * 根据停靠方式，层自动计算渲染位置及渲染区大小
         */
        this.dock = function (value) {
            if (value === undefined) {
                return _dock;
            }
            else {
                _dock = value;
                return this;
            }
        };

        /**
         * 渲染区左上角x坐标
         */
        this.x = function (value) {
            if (value === undefined) {
                return _x;
            }
            else {
                _x = value;
                return this;
            }
        };

        /**
         * 渲染区左上角y坐标
         */
        this.y = function (value) {
            if (value === undefined) {
                return _y;
            }
            else {
                _y = value;
                return this;
            }
        };

        /**
         * 渲染区宽度
         */
        this.width = function (value) {
            if (value === undefined) {
                return _width;
            }
            else {
                _width = value;
                return this;
            }
        };

        /**
         * 渲染区高度
         */
        this.height = function (value) {
            if (value === undefined) {
                return _height;
            }
            else {
                _height = value;
                return this;
            }
        };

        this.init();
    }

    Layer.prototype = new graph.Group();
    Layer.prototype.constructor = Layer;


    /**
     * 数据集类
     *
     * @param meta      数据集的元数据, e.g. {columns: [{name: "amount", title: "销售额", datatype: "Number"}]}
     * @param data      数据集的数据(CSV格式), e.g.: "华北,32886.65\n华东,28966.33\n华南,53122.98\n西北,18995.22"
     *
     * @class
     */
    function Dataset(meta, data) {
        var _meta = meta;   //数据集元数据，包括列名、标题、数据类型等
        var _data = data;   //数据集数据，按行、列组织为二维数组

        /**
         * 数据集元数据（列名、标题、数据类型等信息）
         */
        this.meta = function (value) {
            if (!arguments.length) {
                return _meta;
            }
            else {
                _meta = value;
                return this;
            }
        };

        /**
         * 数据集数据（二维数组）
         */
        this.data = function (value) {
            if (!arguments.length) {
                return _data;
            }
            else {
                _data = value;
                return this;
            }
        };

        /**
         * 解析CSV格式数据
         *
         * @param dataCSV   CSV格式数据
         */
        this.parseCSV = function (dataCSV) {
            if (dataCSV != null) {
                _data = d3.csv.parseRows(dataCSV);

                if (_data && this.column(0)) {
                    // 转换数据类型
                    var colCount = this.columnCount();
                    var rowCount = this.rowCount();
                    for (var col = 0; col < colCount; col++) {
                        var column = this.column(col);
                        if (column && column.datatype == "Number") {
                            for (var row = 0; row < rowCount; row++) {
                                var rowData = this.rowData(row);
                                if (rowData && rowData[col]) {
                                    rowData[col] = Number(rowData[col]);
                                }
                            }
                        }
                    }
                }
            }
            else {
                _data = null;
            }

            return this;
        };

        /**
         * 返回数据行数
         */
        this.rowCount = function () {
            if (_data != null) {
                return _data.length;
            }

            return 0;
        };

        /**
         * 返回数据列数
         */
        this.columnCount = function () {
            if (_meta && _meta.columns) {
                return _meta.columns.length;
            }
            else {
                var rowData = this.rowData(0);
                if (rowData) {
                    return rowData.length;
                }
            }

            return 0;
        };

        /**
         * 返回指定行的数据（含各列数据的数组）
         *
         * @param index       行序号
         */
        this.rowData = function (index) {
            if (_data != null && index < _data.length) {
                return _data[index];
            }

            return null;
        };

        /**
         * 返回指定名称的列的序号
         */
        this.columnIndex = function (name) {
            if (_meta && _meta.columns) {
                var i, n = _meta.columns.length;
                for (i = 0; i < n; i ++) {
                    if (_meta.columns[i].name == name) {
                        return i;
                    }
                }
            }

            return -1;
        };

        /**
         * 增加列信息（元数据）
         *
         * @param name      列名
         * @param title     列标题
         * @param datatype  列数据类型，有效数据类型包括：String,Number,Date,Boolean
         */
        this.addColumn = function (name, title, datatype) {
            var column = new Object();
            column.name = name;
            column.title = title;
            column.datatype = datatype;

            if (_meta == null) {
                _meta = new Object();
                _meta.columns = new Array();
            }
            var count = _meta.columns.length;
            _meta.columns[count] = column;
        };

        /**
         * 返回指定列的信息
         * @param index     列序号
         */
        this.column = function (index) {
            if (_meta && _meta.columns) {
                if (index >= 0 && index < _meta.columns.length) {
                    return _meta.columns[index];
                }
            }

            return null;
        };
    }

    /**
     * 背景类
     *
     * @param color     颜色值，可以是渐变色，如：#ff0000,#ffffff,0
     * @param image     背景图
     * @param repeat    背景图重复方式，包括：no-repeat, repeat, repeat-x, repeat-y, stretch
     *
     * @class
     * @extends BaseObject
     */
    function Background(color, image, repeat) {

        /**
         * 设置/获取背景颜色，支持渐变色(起始颜色, 结束颜色, 渐变角度)
         *
         * e.g. 单色：  red、#80ffee00
         *      渐变色：#ffee00,#ffffff,90
         */
        this.color = function (value) {
            return this.attr("color", value);
        };

        /**
         * 设置/获取背景图像
         */
        this.image = function (value) {
            return this.attr("image", value);
        };

        /**
         * 设置/获取背景图像的重复方式
         *
         * 有效重复方式包括：
         * no-repeat, repeat, repeat-x, repeat-y, stretch
         */
        this.repeat = function (value) {
            return this.attr("repeat", value);
        };


        // 初始化
        this.init();
        if (color) {
            this.color(color);
        }
    }

    Background.prototype = new graph.BaseObject();
    Background.constructor = Background;

    /**
     * 字体类
     *
     * @class
     * @extends BaseObject
     */
    function Font(fontSize, family) {

        /**
         * 字体族，e.g.'Verdana, Arial, Serif’
         */
        this.family = function (value) {
            return this.attr("family", value);
        };

        /**
         * 字体大小
         */
        this.size = function (value) {
            return this.attr("size", value);
        };

        /**
         * 字体颜色
         */
        this.color = function (value) {
            return this.attr("color", value);
        };

        /**
         * 字体描边颜色
         */
        this.stroke = function (value) {
            return this.attr("stroke", value);
        };

        /**
         * 是否粗体
         */
        this.bold = function (value) {
            return this.attr("bold", value);
        };

        /**
         * 是否倾斜
         */
        this.italic = function (value) {
            return this.attr("italic", value);
        };

        /**
         * 是否加下划线
         */
        this.underline = function (value) {
            return this.attr("underline", value);
        };


        // 初始化
        this.init();
        if (fontSize) {
            this.size(fontSize);
        }
        if (family) {
            this.family(family);
        }
    }

    Font.prototype = new graph.BaseObject();
    Font.constructor = Font;

    /**
     * 线型类
     *
     * @param color         颜色
     * @param thickness     粗细
     * @param type          线型，包括：solid, dash, dot, dashdot, dashdotd
     *
     * @class
     * @extends BaseObject
     */
    function LineStyle(color, thickness, type) {
        /**
         * 颜色
         */
        this.color = function (value) {
            return this.attr("color", value);
        };

        /**
         * 粗细
         */
        this.thickness = function (value) {
            return this.attr("thickness", value);
        };

        /**
         * 线型
         */
        this.type = function (value) {
            return this.attr("type", value);
        };

        // 初始化
        this.init();
        if (type) {
            this.type(type);
        }
        if (color) {
            this.color(color);
        }
        if (thickness) {
            this.thickness(thickness);
        }
    }

    LineStyle.prototype = new graph.BaseObject();
    LineStyle.constructor = LineStyle;

    /**
     * 标题类
     *
     * @class
     * @extends BaseObject
     */
    function Title(text) {
        /**
         * 标题文字
         */
        this.text = function (value) {
            return this.attr("text", value);
        };

        /**
         * 标题字体
         */
        this.font = function (value) {
            return this.attr("font", value);
        };

        /**
         * 标题位置
         *
         * 水平位置包括：left,center,right
         * 垂直位置包括：top,bottom
         * 可以是两者组合，如： center bottom
         */
        this.location = function (value) {
            return this.attr("location", value);
        };

        // 初始化
        this.init();
        if (text) {
            this.text(text);
        }
    }

    Title.prototype = new graph.BaseObject();
    Title.constructor = Title;


    /**
     * 数据项图形对象
     *
     * @param color
     * @param border
     * @param font
     *
     * @class
     * @extends BaseObject
     */
    function DataPlot(color, border, font) {
        /**
         * 颜色
         */
        this.color = function (value) {
            return this.attr("color", value);
        };

        /**
         * 边框
         */
        this.border = function (value) {
            return this.attr("border", value);
        };

        /**
         * 字体
         */
        this.font = function (value) {
            return this.attr("font", value);
        };

        // initialize
        this.init();

        if (color) {
            this.color(color);
        }
        if (border) {
            this.border(border);
        }
        if (font) {
            this.font(font);
        }
    }

    DataPlot.prototype = new graph.BaseObject();
    DataPlot.constructor = DataPlot;


    /**
     * 弹出提示类
     *
     * @param scheme    配色方案，支持：yellow、blue、green、red、dark
     * @param opacity   透明度，取值0 - 1
     * @param shadow    是否显示阴影
     * @param animation 是否以动画方式显示
     *
     * @class
     * @extends BaseObject
     */
    function Tooltip(scheme, opacity, shadow, animation) {
        var _tipDiv = null;
        var _html = null;
        var _timer = null;
        var _mousePos = null;

        // 初始化
        this.init = function () {
            Tooltip.prototype.init.call(this);

            this.scheme(scheme);
            this.opacity(opacity ? opacity : 1);
            this.shadow(shadow);
            this.animation(animation);
        };

        /**
         * 提示框的配色方案，有效值包括：default,blue,green,red,dark
         */
        this.scheme = function (value) {
            return this.attr("scheme", value);
        };

        /**
         * 提示框的透明度
         */
        this.opacity = function (value) {
            return this.attr("opacity", value);
        };

        /**
         * 是否有阴影
         */
        this.shadow = function (value) {
            return this.attr("shadow", value);
        };

        /**
         * 是否应用动画效果
         */
        this.animation = function (value) {
            return this.attr("animation", value);
        };

        /**
         * 提示文字（HTML片段，支持嵌入内置变量）
         */
        this.html = function (value) {
            _html = value;
            return this;
        };

        // 确保Tooltip在当前屏幕的可视范围内
        function ensureVisible(x, y) {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            var screenWidth = window.innerWidth;
            var screenHeight = window.innerHeight;
            var tipWidth = parseInt(_tipDiv.style("width"));
            var tipHeight = parseInt(_tipDiv.style("height"));

            x += scrollLeft, y += scrollTop;
            if (x + tipWidth > scrollLeft + screenWidth - 10) {
                x = scrollLeft + screenWidth - 10 - tipWidth;
            }
            if (y + tipHeight > scrollTop + screenHeight) {
                y = scrollTop + screenHeight - tipHeight;
            }

            return [x, y];
        }

        // 创建提示框的DIV层
        function createDiv() {
            _tipDiv = d3.select("#uchart_tip");
            if (_tipDiv.empty()) {
                _tipDiv = d3.select("body").append("div")
                    .attr("id", "uchart_tip")
                    .style("position", "absolute")
                    .style("left", "0px")
                    .style("top", "0px")
                    .style("opacity", 0)
                    .style("pointer-events", "none")
                    .style("box-sizing", "border-box")
                    .style("font-size", "13px")
                    .style("padding", "8px")
                    .style("border-radius", "5px")
                    .style("z-index", "999999");
                //.attr('class', 'uchart-tip')
            }

            if (this.shadow()) {
                _tipDiv.style("text-shadow", "none")
                    .style("-moz-box-shadow", "0 0 10px rgba(0, 0, 0, .5)")
                    .style("-webkit-box-shadow", "0 0 10px rgba(0, 0, 0, .5)")
                    .style("box-shadow", "0 0 10px rgba(0, 0, 0, .5)");
            }

            var scheme = this.scheme();
            if (scheme == "blue") {
                // 蓝色提示框
                _tipDiv.style("border", "1px solid #add9ed")
                    .style("background-color", "#e5f6fe")
                    .style("color", "#5e99bd");
            }
            else if (scheme == "green") {
                // 绿色提示框
                _tipDiv.style("border", "1px solid #90d93f")
                    .style("background-color", "#caed9e")
                    .style("color", "#3f6219");
            }
            else if (scheme == "red") {
                // 红色提示框
                _tipDiv.style("border", "1px solid #d95252")
                    .style("background-color", "#f78b83")
                    .style("color", "#912323");
            }
            else if (scheme == "dark") {
                // 黑色提示框
                _tipDiv.style("border", "1px solid #303030")
                    .style("background-color", "#505050")
                    .style("color", "#f3f3f3");
            }
            else {
                // 黄色提示框
                _tipDiv.style("border", "1px solid #f1d031")
                    .style("background-color", "#ffffa3")
                    .style("color", "#555");
            }
        }

        /**
         * 在指定位置显示提示框
         */
        this.show = function (x, y) {
            if (_html == null || _html == "") {
                return this;
            }

            if (_timer) {
                clearInterval(_timer);
                _timer = null;
            }

            if (this.autoMode()) {
                if (_mousePos == null) {
                    _mousePos = d3.event ? [d3.event.clientX, d3.event.clientY] : [0, 0];
                    d3.select("body").on("mousemove", function () {
                        _mousePos = [d3.event.clientX, d3.event.clientY];//d3.mouse(_tipDiv.node());
                    });
                }
                else if (d3.event) {
                    _mousePos = [d3.event.clientX, d3.event.clientY];
                }

                var tip = this;
                var lastPos = _mousePos;
                var opacity = tip.opacity();
                _timer = setInterval(function () {
                    if (Math.abs(lastPos[0] - _mousePos[0]) < 5 && Math.abs(lastPos[1] - _mousePos[1]) < 5) {
                        if (!tip.isShown()) {
                            if (_tipDiv == null) {
                                createDiv.call(tip);
                            }
                            _tipDiv.html(_html);
                            var pos = ensureVisible(_mousePos[0] + 13, _mousePos[1] + 13);
                            if (tip.animation()) {
                                _tipDiv.style("left", pos[0] + "px")
                                    .style("top", pos[1] + "px")
                                    .transition()
                                    .duration(300)
                                    .ease("linear")
                                    .style("opacity", opacity)

                            }
                            else {
                                _tipDiv.style("opacity", opacity)
                                    .style("left", pos[0] + "px")
                                    .style("top", pos[1] + "px");
                            }
                        }
                    }
                    else {
                        if (!tip.isShown()) {
                            // 移动了鼠标，重新计算延迟
                            lastPos = _mousePos;
                        }
                        else {
                            tip.hide();
                        }
                    }
                }, 500);
            }
            else {
                if (_tipDiv == null) {
                    createDiv.call(this);
                }
                _tipDiv.html(_html);
                var pos = ensureVisible(x, y);
                if (this.animation()) {
                    _tipDiv.transition()
                        .duration(1000)
                        .ease("elastic")
                        .style("opacity", opacity)
                        .style("left", pos[0] + "px")
                        .style("top", pos[1] + "px");
                }
                else {
                    _tipDiv.style("opacity", opacity)
                        .style("left", pos[0] + "px")
                        .style("top", pos[1] + "px");
                }
            }

            return this;
        };

        /**
         * 隐藏提示
         */
        this.hide = function () {
            if (_tipDiv) {
                _tipDiv.transition()
                    .duration(300)
                    .ease("linear")
                    .style("opacity", 0);
            }

            if (_timer) {
                clearInterval(_timer);
                _timer = null;
            }

            return this;
        };

        /**
         * 标题位置
         *
         * 水平位置包括：left,center,right
         * 垂直位置包括：top,bottom
         * 可以是两者组合，如： center bottom
         */
        this.location = function (value) {
            return this.attr("location", value);
        };

        /**
         * 是否自动模式
         * 如果设置为自动模式，图表移动位置时提示框会自动消失
         */
        this.autoMode = function (value) {
            return this.attr("autoMode", value);
        };

        /**
         * 设置提示的样式
         *
         * @param name      CSS项目名称
         * @param value     CSS项目值
         */
        this.style = function (name, value) {
            _tipDiv.style(name, value);
            return this;
        };

        /**
         * 判断提示框是否已显示
         */
        this.isShown = function () {
            if (_tipDiv == null || _tipDiv.style("opacity") == 0) {
                return false;
            }

            return true;
        };

        this.init();
    }

    Tooltip.prototype = new graph.BaseObject();
    Tooltip.constructor = Tooltip;


    /**
     * 面包屑导航条
     *
     * @class
     * @extends BaseObject
     */
    function Breadcrumb(breadcrumbLayer, x, y, height) {

        this.init = function () {
            Breadcrumb.prototype.init.call(this);

            this.height(30)
                .color("#3082D9")
                .hoverColor("#F37F13")
                .border({color: "yellow", thickness: 1})
                .gap(4)
                .marginTop(3)
                .marginBottom(3);
        };

        // ====================================================
        // Properties

        /**
         * 面包屑高度
         */
        this.height = function (value) {
            return this.attr("height", value);
        };

        /**
         * 颜色
         */
        this.color = function (value) {
            return this.attr("color", value);
        };

        /**
         * 鼠标移上去的颜色
         */
        this.hoverColor = function (value) {
            return this.attr("hoverColor", value);
        };

        /**
         * 边框属性，包括颜色、线型
         */
        this.border = function (value) {
            return this.attr("border", value);
        };

        /**
         * 面包屑条目间隙
         */
        this.gap = function (value) {
            return this.attr("gap", value);
        };

        /**
         * 上边空白
         */
        this.marginTop = function (value) {
            return this.attr("marginTop", value);
        };

        /**
         * 下边空白
         */
        this.marginBottom = function (value) {
            return this.attr("marginBottom", value);
        };
        // ====================================================

        /**
         * 渲染输出
         *
         * @param datum     关联的数据项
         */
        this.render = function (datum) {
            var index = this.findBreadcrumbItem(datum);
            if (index < 0) {
                // 不存在，则创建
                var text = datum.category ? datum.category : datum.text;
                var gap = this.gap(), lastPos = -gap + 1;
                var marginTop = this.marginTop(), marginBottom = this.marginBottom();
                var shapes = breadcrumbLayer.shapes();
                if (shapes && shapes.length > 0) {
                    lastPos = shapes[shapes.length - 1].lastPos;
                }

                var shape = createBreadcrumbItem.call(this, lastPos + gap, marginTop,
                    height - marginTop - marginBottom, text);
                shape.datum(datum);
                shape.cursor("hand");

                var breadcrumb = this;
                new behav.Touch()
                    .click(function (x, y) {
                        if (this.datum() && breadcrumb.onItemClick) {
                            breadcrumb.onItemClick(this.datum());
                        }
                    })
                    .moveIn(function (x, y) {
                        var shape = this.selectShape("Path");
                        if (shape && breadcrumb.hoverColor()) {
                            shape.fill(breadcrumb.hoverColor());
                        }
                    })
                    .moveOut(function (x, y) {
                        var shape = this.selectShape("Path");
                        if (shape) {
                            shape.fill(breadcrumb.color());
                        }
                    })
                    .toShapes(shape);
            }
            else {
                // 已存在，删除后面的条目
                var count = breadcrumbLayer.shapes() ? breadcrumbLayer.shapes().length : 0;
                for (var i = count; i >= index + 1; i--) {
                    var shape = breadcrumbLayer.selectShape("Group#ID_" + i);
                    if (shape) {
                        shape.opacity(1);
                        var animation = new anima.Animation("linear", 200, {opacity: 0}, (count - i) * 100)
                            .transitionEnd(function () {
                                this.remove();
                            });
                        animation.toShapes(shape);
                    }
                }
            }
        };

        /**
         * 根据数据项查找面包屑条目，返回其序号（找不到返回-1）
         */
        this.findBreadcrumbItem = function (datum) {
            if (breadcrumbLayer) {
                for (var i = 1; ; i++) {
                    var shape = breadcrumbLayer.selectShape("Group#ID_" + i);
                    if (shape == null) {
                        break;
                    }

                    if (shape.datum() == datum) {
                        return i;
                    }
                }
            }

            return -1;
        };

        /**
         * 创建面包屑条目
         */
        function createBreadcrumbItem(x, y, h, text) {
            var count = breadcrumbLayer.shapes() ? breadcrumbLayer.shapes().length : 0;
            var group = new graph.Group().id("ID_" + (count + 1));
            breadcrumbLayer.addShape(group);

            var path = new graph.Path()
                .fill(this.color());
            if (this.border()) {
                _util.applyBorderTo(this.border(), path);
            }

            var w = 1;
            if (count == 0) {
                // is home
                w = h;
                path.beginPath()
                    .moveTo(x, y)
                    .lineToH(x + w)
                    .lineTo(x + w + 8, h / 2)
                    .lineTo(x + w, h)
                    .lineToH(x)
                    .close()
                    .endPath();
                group.addShape(path);

                var src = require.toUrl("./images/home.png");
                var homeImg = new graph.Image(x + 6, y + 4, w - 8, h - 8, src)
                    .pointerEvents("none");
                group.addShape(homeImg);
            }
            else {
                // 先按宽带1画
                w = 1;
                path.beginPath()
                    .moveTo(x, y)
                    .lineToH(x + w)
                    .lineTo(x + w + 8, h / 2)
                    .lineTo(x + w, h)
                    .lineToH(x)
                    .lineTo(x + 8, h / 2)
                    .close()
                    .endPath();
                group.addShape(path);

                var label = new graph.Text(0, 0, text)
                    .fontSize(13)
                    .fill("white")
                    .opacity(0)
                    .pointerEvents("none");
                group.addShape(label);

                // 调整为匹配文字的宽度
                var bbox = label.bbox();
                var w0 = w;
                w = bbox.width + 8 + 6;

                var animation = new anima.Animation("linear", 300,
                    {
                        path: function () {
                            // 通过自定义插值函数实现不规则的d值动画
                            var interpolate = d3.interpolate(w0, w);
                            return function (t) {
                                var w = interpolate(t);
                                path.beginPath()
                                    .moveTo(x, y)
                                    .lineToH(x + w)
                                    .lineTo(x + w + 8, h / 2)
                                    .lineTo(x + w, h)
                                    .lineToH(x)
                                    .lineTo(x + 8, h / 2)
                                    .close()
                                    .endPath(true);
                                return path.lastPath();
                            };
                        }
                    })
                    .transitionEnd(function () {
                        new anima.Animation("linear", 200, {opacity: 1})
                            .toShapes(label);
                    });
                animation.toShapes(path);

                // 中心点相对于基准点的坐标
                var cx0 = bbox.x + bbox.width / 2;
                var cy0 = bbox.y + bbox.height / 2;

                // 文字中心点移到Block的中点
                var offX = x + 8 + 4 + bbox.width / 2 - cx0;
                var offY = y + h / 2 - cy0;
                label.translate([offX, offY]);
            }

            group.lastPos = x + w;

            return group;
        };

        /**
         * 面包屑点击事件
         *
         * @param method    事件方法
         */
        this.itemClick = function (method) {
            if (method === undefined) {
                return this.onItemClick;
            }
            else {
                this.onItemClick = method;
                return this;
            }
        };

        this.init();
    }

    Breadcrumb.prototype = new graph.BaseObject();
    Breadcrumb.constructor = Breadcrumb;


    /**
     * UCharts 配置类，用于获取图表类库及路径、主题等
     *
     * @class
     */
    function UChartConfig() {

        var _theme = null;
        var _ucharts = null;

        /**
         * 获取 / 设置当前主题
         */
        this.theme = function (value) {
            if (value === undefined) {
                return _theme;
            }
            else {
                _theme = value;
                return this;
            }
        };

        /**
         * 返回全部已注册的图表类型信息（数组）
         */
        this.allChartTypes = function () {
            return _ucharts;
        };

        /**
         * 根据图表名称、类别查找图表
         *
         * @param chartName     图表名
         * @param categoryName  图表类别
         */
        this.findChart = function (chartName, categoryName) {
            if (_ucharts) {
                for (var i = 0; i < _ucharts.length; i++) {
                    var category = _ucharts[i];
                    if (categoryName == null || categoryName.equal(category.categoryName)) {
                        for (var j = 0; j < category.chartTypes.length; j++) {
                            var chartType = category.chartTypes[j];
                            if (chartName == chartType.chartName) {
                                return chartType;
                            }
                        }
                    }
                }
            }

            return null;
        };

        this.init = function () {
            require(['./config'], function (config) {
                var themeUrl = config.themeUrl;
                _ucharts = config.ucharts;
                if (themeUrl && themeUrl != "") {
                    themeUrl = themeUrl.replace(".js", "");
                    require([themeUrl], function (theme) {
                        _theme = theme;
                        _theme.url = themeUrl + ".js";
                        if (_ready) {
                            _ready.call(this);
                        }
                    });
                }
                else {
                    if (_ready) {
                        _ready.call(this);
                    }
                }
            });
        };

        this.init();
    }

    UChartConfig.prototype = new graph.BaseObject();
    UChartConfig.constructor = UChartConfig;


    /**
     * 公共方法类
     *
     * @class
     */
    function Util() {
        function _format(pattern, num, z) {
            var j = pattern.length >= num.length ? pattern.length : num.length;
            var p = pattern.split("");
            var n = num.split("");
            var bool = true, nn = "";
            for (var i = 0; i < j; i++) {
                var x = n[n.length - j + i];
                var y = p[p.length - j + i];
                if (z == 0) {
                    if (bool) {
                        if (( x && y && (x != "0" || y == "0")) || ( x && x != "0" && !y ) || ( y && y == "0" && !x )) {
                            nn += x ? x : "0";
                            bool = false;
                        }
                    } else {
                        nn += x ? x : "0";
                    }
                } else {
                    if (y && ( y == "0" || ( y == "#" && x ) ))
                        nn += x ? x : "0";
                }
            }
            return nn;
        }

        function _formatNumber(numChar, pattern) {
            var patterns = pattern.split(".");
            var numChars = numChar.split(".");
            var z = patterns[0].indexOf(",") == -1 ? -1 : patterns[0].length - patterns[0].indexOf(",");
            var num1 = _format(patterns[0].replace(","), numChars[0], 0);
            var num2 = _format(patterns[1] ? patterns[1].split('').reverse().join('') : "", numChars[1] ? numChars[1].split('').reverse().join('') : "", 1);
            num1 = num1.split("").reverse().join('');
            var reCat = eval("/[0-9]{" + (z - 1) + "," + (z - 1) + "}/gi");
            var arrdata = z > -1 ? num1.match(reCat) : undefined;
            if (arrdata && arrdata.length > 0) {
                var w = num1.replace(arrdata.join(''), '');
                num1 = arrdata.join(',') + ( w == "" ? "" : "," ) + w;
            }
            num1 = num1.split("").reverse().join("");
            return (num1 == "" ? "0" : num1) + (num2 != "" ? "." + num2.split("").reverse().join('') : "" );
        }

        /**
         * 格式化数字
         */
        function formatNumber(num, opt) {
            var reCat = /[0#,.]{1,}/gi;
            var zeroExc = opt.zeroExc == undefined ? true : opt.zeroExc;
            var pattern = opt.pattern.match(reCat)[0];
            var numChar = num.toString();
            return !(zeroExc && numChar == 0) ? opt.pattern.replace(pattern, _formatNumber(numChar, pattern)) : opt.pattern.replace(pattern, "0");
        }

        /**
         * 格式化
         *
         * @param value     原始值
         * @param pattern   格式化模板，兼容Excel格式模板
         */
        this.format = function (value, pattern) {
            return formatNumber(value, {pattern: pattern});
        };

        /**
         * 全部替换
         */
        this.replaceAll = function (source, findWhat, replaceWith) {
            var result = source;
            if (source != null && findWhat != null && findWhat != "") {
                // result = source.replace(new RegExp(findWhat, "g"), replaceWith);
                var pos = 0, len1 = findWhat.length, len2 = replaceWith.length;
                while ((pos = result.indexOf(findWhat, pos)) >= 0) {
                    result = result.substr(0, pos) + replaceWith + result.substr(pos + len1);
                    pos += len2;
                }
            }

            return result;
        };

        /**
         * 返回自动对象属性值
         */
        this.valueOf = function (source, owner, defaultValue) {
            var result = null;
            if (source == null) {
                result = null;
            }
            else if (typeof source == "function") {
                result = source.call(owner);
            }
            else {
                result = source;
            }
            if (result == null && defaultValue) {
                result = defaultValue;
            }

            return result;
        };

        /**
         * 应用字体到指定文字
         */
        this.applyFontTo = function (font, text) {
            var fontFamily = this.valueOf(font.family, font);
            var fontSize = this.valueOf(font.size, font);
            var fontColor = this.valueOf(font.color, font);
            var fontStroke = this.valueOf(font.stroke, font);
            var fontBold = this.valueOf(font.bold, font);
            var fontItalic = this.valueOf(font.italic, font);

            if (fontFamily != null) {
                text.fontFamily(fontFamily);
            }
            if (fontSize != null) {
                text.fontSize(fontSize);
            }
            if (fontColor != null) {
                text.fill(fontColor);
            }
            if (fontStroke != null) {
                text.stroke(fontStroke).strokeWidth(1);
            }
            if (fontBold != null) {
                text.fontWeight(fontBold? "bold" : "normal");
            }
            if (fontItalic != null) {
                text.fontStyle(fontItalic? "italic" : "normal");
            }
        };

        /**
         * 应用边框到指定图形
         * @param lineStyle
         * @param shape
         */
        this.applyBorderTo = function (lineStyle, shape) {
            var color = this.valueOf(lineStyle.color, lineStyle);
            var thickness = this.valueOf(lineStyle.thickness, lineStyle, 1);
            if (color != null) {
                shape.stroke(color).strokeWidth(thickness);
            }
        };

        // 应用背景到指定层
        this.applyBackgroundTo = function (background, layer, left, top, width, height) {
            var bgShape = null;
            var bgColor = this.valueOf(background.color, background);
            if (bgColor != null) {
                bgShape = new graph.Rect(left, top, width, height).fill(bgColor);
                var before = layer.shapes() && layer.shapes().length > 0? layer.shapes()[0] : null;
                layer.addShape(bgShape, before);
            }

            var bgImage = this.valueOf(background.image, background);
            if (bgImage) {
                // TODO:
            }

            return bgShape;
        };
    }


    /**
     * 设置准备就绪回调方法，可在此方法中执行创建图表等操作
     *
     * @param method    回调方法
     */
    function ready(method) {
        _ready = method;
    }

    _config = new UChartConfig();
    _util = new Util();


    return {
        UChartBase: UChartBase,
        Dataset: Dataset,
        Background: Background,
        Font: Font,
        Title: Title,
        LineStyle: LineStyle,
        Tooltip: Tooltip,
        DataPlot: DataPlot,
        Breadcrumb: Breadcrumb,

        config: _config,
        util: _util,

        ready: ready
    };
});