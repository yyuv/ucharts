/**
 * Created by Jasion on 15/1/10.
 */

/**
 * 图形库模块
 */
define(['../../lib/d3/d3'], function () {

    var _util = null;
    var _domAttrMap = null;

    /**
     * 基础对象类，这是绝大部分类的基类，提供属性支持及枚举接口
     *
     * @class
     */
    function BaseObject() {

        /**
         * 初始化，在子类需要在构造函数中调用
         */
        this.init = function () {
            this.__attrs__ = new Object();
        };

        /**
         * 设置/获取指定名称的属性
         */
        this.attr = function (name, value) {
            //if (!arguments.length)
            if (value === undefined) {
                return this.__attrs__[name];
            }
            else {
                this.__attrs__[name] = value;
                return this;
            }
        };

        /**
         * 返回对象的所有属性的名称（数组）
         */
        this.allAttrs = function () {
            return Object.keys(this.__attrs__);
        };
    }

    /**
     * 全局公共方法类
     *
     * @class
     */
    function Util() {

        /**
         * 解析颜色值，支持透明度
         */
        this.parseColor = function (value) {
            var color = null;
            if (typeof(value) == "string" && value.length == 9 && value.charAt(0) == '#') {
                // 含透明度，d3不支持
                var alpha = parseInt(value.substr(1, 2), 16);
                var color = d3.rgb("#" + value.substr(3, 6));
                color.a = alpha;
            }
            else {
                color = d3.rgb(value);
            }

            return color;
        };

        /**
         * 选择传入的一个或多个图形对象，返回D3js选择集对象
         *
         * @param shapes    一个(Shape)或多个(Shape Array)图形对象
         */
        this.d3select = function (shapes) {
            var result = null;
            if (shapes instanceof Array) {
                var nodes = [];
                shapes.forEach(function (shape) {
                    nodes.push(shape.node());
                });
                result = d3.selectAll(nodes);
            }
            else {
                result = d3.select(shapes.node());
            }

            return result;
        };

        /**
         * 设置图形对象属性与相应HTML DOM属性的名称映射
         *
         * @param name      图形对象属性名称
         * @param mapName   对应的DOM属性名称
         */
        this.domAttrName = function (name, mapName) {
            if (mapName === undefined) {
                var domAttr = _domAttrMap.get(name);
                if (domAttr) {
                    return domAttr;
                }
                else {
                    return name;
                }
            }
            else if (_domAttrMap.get(name) == null) {
                _domAttrMap.set(name, mapName);
            }
        };
    }


    /**
     * 绘图Context类，目前先实现支持SVG，日后看需要可扩展支持HTML5 Canvas
     *
     * @param container 图形画布所在的容器（一般是HTML的一个DIV）
     * @param width     画布宽
     * @param height    画布高
     *
     * @class
     */
    function GraphicsContext(container, width, height) {

        var _width = width;
        var _height = height;
        var _root = null;
        var _container = null;

        // Initialize
        if (container instanceof Array) {
            // is d3 selection
            _container = container.node();
        }
        else {
            _container = container;
        }


        // Public Attributes getter / setter

        /**
         * 画布宽
         */
        this.width = function (value) {
            if (!arguments.length) {
                return _width;
            }
            else {
                _width = value;
                return this;
            }
        };

        /**
         * 画布高
         */
        this.height = function (value) {
            if (!arguments.length) {
                return _height;
            }
            else {
                _height = value;
                return this;
            }
        };

        /**
         * 根组，是所有图形和其它组的根，调用GraphicsContext.addShape添加的图形都是添加到该组
         */
        this.root = function () {
            if (_root == null) {
                _root = new Group();
                _root.__gc__ = this;
            }

            return _root;
        };

        /**
         * 返回所在的容器(DOM节点)
         */
        this.container = function () {
            return _container;
        };


        // Public Methods

        /**
         * 添加图形，将添加到root组
         *
         * @param shape     图形对象, 包括图形组对象(Group)
         */
        this.addShape = function (shape) {
            var root = this.root();
            root.addShape(shape);
            return this;
        };

        /**
         * 返回直属（根组下）全部图形对象（数组）
         */
        this.shapes = function () {
            return this.root().shapes();
        };

        /**
         * 清除全部内容（包括所有图形）
         */
        this.clearAll = function () {
            this.root().clearAll();
        };
    }

    /**
     * 图形基础类，是Rect、Circle等所有图形的基类
     *
     * @class
     * @extends BaseObject
     */
    function Shape() {

        /**
         * 初始化，在子类需要在构造函数中调用
         *
         * @override
         */
        this.init = function () {
            Shape.prototype.init.call(this);
            this.__node__ = null;
            this.__group__ = null;
        };

        //==================================================================
        // 所有图形的通用属性

        /**
         * 填充颜色
         */
        this.fill = function (value) {
            var color = _util.parseColor(value);
            if (color.a) {
                this.fillOpacity(color.a / 255);
                value = color.toString();
            }

            return this.attr("fill", value);
        };

        /**
         * 填充透明度（0-1）
         */
        this.fillOpacity = function (value) {
            _util.domAttrName("fillOpacity", "fill-opacity");
            return this.attr("fillOpacity", value);
        };

        /**
         * 图形描边颜色
         */
        this.stroke = function (value) {
            return this.attr("stroke", value);
        };

        /**
         * 图形描边宽度
         */
        this.strokeWidth = function (value) {
            _util.domAttrName("strokeWidth", "stroke-width");
            return this.attr("strokeWidth", value);
        };

        /**
         * 图形透明度（0-1）
         */
        this.opacity = function (value) {
            return this.attr("opacity", value);
        };
        //==================================================================

        /**
         * 设置/获取属性值
         *
         * @param name      属性名
         * @param value     属性值
         * @param keepDOM   是否保持DOM属性值不改变
         *
         * @override
         */
        this.attr = function (name, value, keepDOM) {
            var result = Shape.prototype.attr.call(this, name, value);
            if (!keepDOM && value !== undefined) {
                var node = this.node();
                if (node) {
                    this.domAttr(name, value);
                }
            }

            return result;
        };

        /**
         * 获取指定名称的属性，支持默认值
         *
         * @param name          属性名称
         * @param defaultValue  默认值
         */
        this.getAttr = function (name, defaultValue) {
            var result = this.attr(name);
            if (result === undefined) {
                return defaultValue;
            }
            else {
                return result;
            }
        };

        /**
         * 设置/获取Shape的ID
         */
        this.id = function (value) {
            return this.attr("id", value);
        };

        /**
         * 返回图形对象内部的DOM节点
         */
        this.node = function () {
            return this.__node__;
        };

        /**
         * 返回图形对象所在的组
         */
        this.group = function () {
            return this.__group__;
        };

        /**
         * 将指定数据绑定到图形
         *
         * @param datum     数据项
         */
        this.datum = function (datum) {
            var d3obj = d3.select(this.node());
            return d3obj.datum.apply(d3obj, arguments);
        };

        /**
         * 移除当前图形
         */
        this.remove = function () {
            var group = this.group();
            if (group) {
                group.removeShape(this);
            }
            else {
                // is root
                d3.select(this.node()).remove();
            }
        };

        /**
         * 缩放倍数
         */
        this.scale = function (value) {
            return this.attr("scale", value);
        };

        /**
         * 平移坐标
         *
         * @param value     平移值，如：-100,50，将向左移动100同时向下移动50
         */
        this.translate = function (value) {
            var result = this.attr("translate", value);
            if (value == undefined && result && result instanceof Array) {
                // 避免外部意外修改值（因为数组是byRef）
                result = [result[0], result[1]];
            }
            return result;
        };

        /**
         * 旋转角度，以弧度为单位
         */
        this.rotate = function (value) {
            return this.attr("rotate", value);
        };

        /**
         * 沿X轴倾斜
         */
        this.skewX = function (value) {
            return this.attr("skewX", value);
        };

        /**
         * 沿Y轴倾斜
         */
        this.skewY = function (value) {
            return this.attr("skewY", value);
        };

        /**
         * 禁用鼠标事件
         *
         * @param value
         */
        this.pointerEvents = function (value) {
            _util.domAttrName("pointerEvents", "pointer-events");
            return this.attr("pointerEvents", value);
        };

        /**
         * 图形上的光标类型，支持手型（值为hand）等
         */
        this.cursor = function (value) {
            return this.attr("cursor", value);
        };

        this.mergeTransform = function (value) {
            var scale = value == null ? this.scale() : value.scale;
            var translate = value == null ? this.translate() : value.translate;
            var rotate = value == null ? this.rotate() : value.rotate;
            var skewX = value == null ? this.skewX() : value.skewX;
            var skewY = value == null ? this.skewY() : value.skewY;

            var transform = null;
            if (translate) {
                if (transform == null) {
                    transform = "translate(" + translate + ")";
                }
                else {
                    transform += " translate(" + translate + ")";
                }
            }
            if (scale) {
                if (transform == null) {
                    transform = "scale(" + scale + ")";
                }
                else {
                    transform += " scale(" + scale + ")";
                }
            }
            if (rotate) {
                if (transform == null) {
                    transform = "rotate(" + rotate + ")";
                }
                else {
                    transform += " rotate(" + rotate + ")";
                }
            }
            if (skewX) {
                if (transform == null) {
                    transform = "skewX(" + skewX + ")";
                }
                else {
                    transform += " skewX(" + skewX + ")";
                }
            }
            if (skewY) {
                if (transform == null) {
                    transform = "skewY(" + skewY + ")";
                }
                else {
                    transform += " skewY(" + skewY + ")";
                }
            }

            return transform;
        };

        /**
         * 测试传入的位置坐标所在的图形
         */
        this.hitTestShape = function (x, y) {
            var node = document.elementFromPoint(x, y);
            if (node != null) {
                return node.shape;
            }

            return null;
        };

        /**
         * 返回图形边界盒
         */
        this.bbox = function () {
            return this.node().getBBox();
        };

        this.domAttr = function (name, value) {
            if (value !== undefined && this.node()) {
                if (name === "text") {
                    d3.select(this.node()).text(value);
                }
                else if (name == "pointerEvents") {
                    if (typeof value !== "string") {
                        value = value ? "auto" : "none";
                    }
                    d3.select(this.node()).style("pointer-events", value);
                }
                else if (name == "cursor") {
                    if (value == "hand") {
                        // 手型光标，FF等浏览器中需要设为pointer
                        value = "pointer";
                    }
                    d3.select(this.node()).style("cursor", value);
                }
                else if (name == "scale" || name == "translate" || name == "rotate" ||
                    name == "skewX" || name == "skewY") {
                    var transform = this.mergeTransform();
                    d3.select(this.node()).attr("transform", transform);
                }
                else {
                    var domAttrName = _util.domAttrName(name);
                    d3.select(this.node()).attr(domAttrName, value);
                }
            }
        };
    }

    Shape.prototype = new BaseObject();
    Shape.prototype.constructor = Shape;

    /**
     * 图形组类，将若干图形组合形成一个，方便整体移动、动画、以及设置颜色等属性
     *
     * @class
     * @extends Shape
     */
    function Group() {

        this.init = function () {
            Group.prototype.init.call(this);
            this.__shapes__ = [];
        };


         /**
         * 返回组中的全部图形对象（数组）
         */
        this.shapes = function () {
            return this.__shapes__;
        };

        /**
         * 返回图形Context
         */
        this.graphicsContext = function () {
            return this.__gc__;
        };

        // @override，自动创建根组
        this.node = function () {
            if (this.__node__ == null) {
                var gc = this.graphicsContext();
                if (gc != null && gc.container() != null) {
                    // is root group
                    var svg = d3.select(gc.container()).select("svg");
                    if (svg.empty()) {
                        svg = d3.select(gc.container()).append("svg");
                        svg.attr("width", gc.width())
                            .attr("height", gc.height())
                            .attr("xmlns", "http://www.w3.org/2000/svg");
                        //.attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
                        //.attr("version", "1.1");
                    }

                    var root = svg.select("g#root");
                    if (root.empty()) {
                        root = svg.append("g").attr("id", "root");
                    }
                    this.__node__ = root.node();
                }
            }

            return this.__node__;
        };

        /**
         * 更新现有数据项时触发的事件
         *
         * @param method    事件方法，支持三个参数：datum（数据项）、index（数据项序号）、shape（绑定此数据项的图形对象）
         */
        this.dataUpdate = function (method) {
            if (method === undefined) {
                return this.onDataUpdate;
            }
            else {
                this.onDataUpdate = method;
                return this;
            }
        };

        /**
         * 新数据项进入时触发的事件
         *
         * @param method     事件方法，支持两个参数：datum（新数据项）、index（新数据项序号）
         */
        this.dataEnter = function (method) {
            if (method === undefined) {
                return this.onDataEnter;
            }
            else {
                this.onDataEnter = method;
                return this;
            }
        };

        /**
         * 旧数据项退出时触发的事件（旧数据项即更新数据时对比现有数据不再存在的数据项）
         *
         * @param method    事件方法，支持三个参数：datum（旧数据项）、index（旧数据项原序号）、shape（旧数据项绑定的图形对象）
         */
        this.dataExit = function (method) {
            if (method === undefined) {
                return this.onDataExit;
            }
            else {
                this.onDataExit = method;
                return this;
            }
        };

        /**
         * 添加指定的图形对象到当前组
         *
         * @param shape     要添加的图形对象
         * @param before    添加到那个对象前，为空将添加到末尾
         */
        this.addShape = function (shape, before) {
            var parent = d3.select(this.node());
            var obj = null;
            if (shape instanceof Group) {
                if (before == null) {
                    obj = parent.append("g");
                }
                else {
                    var beforeSelector = function () {
                        return before.node();
                    };
                    obj = parent.insert("g", beforeSelector);
                }
            }
            else if (shape instanceof Text) {
                obj = parent.append("text")
                    .text(shape.text());
            }
            else if (shape instanceof Image) {
                obj = parent.append("image");
            }
            else if (shape instanceof Rect) {
                obj = parent.append("rect");
            }
            else if (shape instanceof Circle) {
                obj = parent.append("circle")
            }
            else if (shape instanceof Path || shape instanceof Arc) {
                obj = parent.append("path");
            }
            else {
                alert("Not support shape type!");
            }

            // 属性设置
            if (obj) {
                obj.node().shape = shape;
                shape.__group__ = this;
                shape.__node__ = obj.node();
                this.__shapes__.push(shape);

                var attrs = shape.allAttrs();
                if (attrs) {
                    attrs.forEach(function (name) {
                        var value = shape.attr(name);
                        if (value !== undefined) {
                            shape.domAttr(name, value);
                        }
                    });
                }
            }

            return this;
        };

        /**
         * 将当前组下的对象shape调整到对象toShape的后面
         */
        this.sendToBack = function (shape, toShape) {
            if (shape.group() == toShape.group()) {
                var node = shape.node();
                var toNode = toShape.node();
                this.node().insertBefore(node, toNode);
            }

            return this;
        };

        /**
         * 根据指定查找规则查找图形，返回匹配的第一个图形
         *
         * @param pattern   查找规则，有效查找规则如：Rect(按类型), #id1(按ID), Rect#id1（指定类型指定ID）
         */
        this.selectShape = function (pattern) {
            // valid pattern: rect, rect#id1, #id1
            if (pattern) {
                var fields = pattern.split("#");
                var type = fields[0];
                var id = fields.length > 1 ? fields[1] : null;
                var count = this.__shapes__.length;
                for (var i = 0; i < count; i++) {
                    var shape = this.__shapes__[i];
                    var shapeType = shape.constructor.name;
                    if (type == null || type == "" || type == shapeType) {
                        if (id == null || id == shape.id()) {
                            return shape;
                        }
                    }
                }
            }

            return null;
        };

        /**
         * 根据指定查找规则查找所有符合条件的图形
         *
         * @param pattern   查找规则，有效查找规则如：Rect(按类型), #id1(按ID), Rect#id1（指定类型指定ID）
         */
        this.selectShapes = function (pattern) {
            // valid pattern: rect, rect#id1, #id1
            if (pattern) {
                var fields = pattern.split("#");
                var type = fields[0];
                var id = fields.length > 1 ? fields[1] : null;
                var count = this.__shapes__.length;
                var result = [];
                for (var i = 0; i < count; i++) {
                    var shape = this.__shapes__[i];
                    var shapeType = shape.constructor.name;
                    if (type == null || type == "" || type == shapeType) {
                        if (id == null || id == shape.id()) {
                            result.push(shape);
                        }
                    }
                }

                return result;
            }
            else {
                return this.__shapes__;
            }
        };

        /**
         * 移除指定的图形对象
         */
        this.removeShape = function (shape) {
            var index = this.__shapes__.indexOf(shape);
            if (index >= 0) {
                this.__shapes__.splice(index, 1);
                d3.select(shape.node()).remove();
            }
        };

        /**
         * 清除组下全部图形
         */
        this.clearAll = function () {
            d3.selectAll(this.node().childNodes).remove();
            this.__shapes__ = [];
        };

        /**
         * 更新数据
         *
         * @param data      数据（数组形式，数组元素即为数据项）
         * @param key       数据项的标识, 有效值包括：
         *                  1. 函数：  自定义函数返回数据项ID
         *                  2. 数字：  每个数据项也是一个数组，以数据项数组的此序号元素作为数据项标识
         *                  3. 字符串：每个数据项是一个对象，以数据项对象的此名称属性值作为数据项标识
         */
        this.updateData = function (data, key) {
            var updateSelection = null;
            if (key != null) {
                if (typeof key === "function") {
                    updateSelection = d3.selectAll(this.node().childNodes).data(data, key);
                }
                else {
                    updateSelection = d3.selectAll(this.node().childNodes).data(data, function (d) {
                        return d[key];    //datum ID
                    });
                }
            }
            else {
                updateSelection = d3.selectAll(this.node().childNodes).data(data);
            }

            var enterSelection = updateSelection.enter();
            var exitSelection = updateSelection.exit();
            var group = this;

            if (!updateSelection.empty()) {
                updateSelection.each(function (d, i) {
                    var node = this;
                    if (node.shape != null) {
                        group.onDataUpdate(d, i, node.shape);
                    }
                });
            }

            if (!enterSelection.empty()) {
                var count = enterSelection[0].length;
                for (var i = 0; i < count; i++) {
                    var node = enterSelection[0][i];
                    if (node != null) {
                        group.onDataEnter(node.__data__, i);
                    }
                }
            }

            if (!exitSelection.empty()) {
                var count = exitSelection[0].length;
                for (var i = 0; i < count; i++) {
                    var node = exitSelection[0][i];
                    if (node != null && node.shape != null) {
                        group.onDataExit(node.__data__, i, node.shape);
                    }
                }
            }

            return this;
        };


        // initialize
        this.init();
    }

    Group.prototype = new Shape();
    Group.prototype.constructor = Group;

    /**
     * 文本类（也按一种图形处理）
     *
     * @class
     * @extends Shape
     */
    function Text(x, y, text) {

        /**
         * x坐标
         */
        this.x = function (value) {
            return this.attr("x", value);
        };

        /**
         * y坐标
         */
        this.y = function (value) {
            return this.attr("y", value);
        };

        /**
         * 文本
         */
        this.text = function (value) {
            return this.attr("text", value);
        };

        /**
         * 字体族
         */
        this.fontFamily = function (value) {
            // "Verdana, Arial, Serif";
            _util.domAttrName("fontFamily", "font-family");
            return this.attr("fontFamily", value);
        };

        /**
         * 字体大小
         */
        this.fontSize = function (value) {
            _util.domAttrName("fontSize", "font-size");
            return this.attr("fontSize", value);
        };

        /**
         * 字体粗细，有效值包括：bold,normal
         */
        this.fontWeight = function (value) {
            _util.domAttrName("fontWeight", "font-weight");
            return this.attr("fontWeight", value);
        };

        /**
         * 字体样式，有效值包括: italic, normal
         */
        this.fontStyle = function (value) {
            _util.domAttrName("fontStyle", "font-style");
            return this.attr("fontStyle", value);
        };

        /**
         * 文字水平对齐位置，有效值包括：start, middle, end
         */
        this.textAnchor = function (value) {
            _util.domAttrName("textAnchor", "text-anchor");
            return this.attr("textAnchor", value);
        };

        /**
         * 文字垂直对齐位置，有效值包括：start, middle, end
         */
        this.dominantBaseline = function (value) {
            _util.domAttrName("dominantBaseline", "dominant-baseline");
            return this.attr("dominantBaseline", value);
        };

        /**
         * 文字宽度
         */
        this.textLength = function (value) {
            return this.attr("textLength", value);
        };

        /**
         * 文字宽度对齐方式，有效值包括：spacingAndGlyphs, spacing
         */
        this.lengthAdjust = function (value) {
            return this.attr("lengthAdjust", value);
        };

        this.dx = function (value) {
            return this.attr("dx", value);
        };

        this.dy = function (value) {
            return this.attr("dy", value);
        };

        // initialize
        this.init();

        this.x(x);
        this.y(y);
        this.text(text);
    }

    Text.prototype = new Shape();
    Text.prototype.constructor = Text;

    /**
     * 图像类
     *
     * @class
     * @extends Shape
     */
    function Image(x, y, width, height, src) {

        /**
         * x坐标
         */
        this.x = function (value) {
            return this.attr("x", value);
        };

        this.y = function (value) {
            return this.attr("y", value);
        };

        this.width = function (value) {
            return this.attr("width", value);
        };

        this.height = function (value) {
            return this.attr("height", value);
        };

        this.src = function (value) {
            _util.domAttrName("src", "xlink:href");
            return this.attr("src", value);
        };


        // initialize
        this.init();

        this.x(x);
        this.y(y);
        this.width(width);
        this.height(height);
        this.src(src);
    }

    Image.prototype = new Shape();
    Image.prototype.constructor = Image;

    /**
     * 矩形类
     *
     * @class
     * @extends Shape
     */
    function Rect(x, y, width, height, rx, ry) {

        /**
         * x坐标
         */
        this.x = function (value) {
            return this.attr("x", value);
        };

        /**
         * y坐标
         */
        this.y = function (value) {
            return this.attr("y", value);
        };

        /**
         * 宽带
         */
        this.width = function (value) {
            return this.attr("width", value);
        };

        /**
         * 高度
         */
        this.height = function (value) {
            return this.attr("height", value);
        };

        /**
         * 圆角rx
         */
        this.rx = function (value) {
            return this.attr("rx", value);
        };

        /**
         * 圆角ry
         */
        this.ry = function (value) {
            return this.attr("ry", value);
        };


        // initialize
        this.init();

        this.x(x);
        this.y(y);
        this.width(width);
        this.height(height);
        this.rx(rx);
        this.ry(ry);
    }

    Rect.prototype = new Shape();
    Rect.prototype.constructor = Rect;

    /**
     * 圆形
     *
     * @class
     * @extends Shape
     */
    function Circle(cx, cy, r) {

        /**
         * 圆心x坐标
         */
        this.cx = function (value) {
            return this.attr("cx", value);
        };

        /**
         * 圆心y坐标
         */
        this.cy = function (value) {
            return this.attr("cy", value);
        };

        /**
         * 圆半径
         */
        this.r = function (value) {
            return this.attr("r", value);
        };


        // initialize
        this.init();

        this.cx(cx);
        this.cy(cy);
        this.r(r);
    }

    Circle.prototype = new Shape();
    Circle.prototype.constructor = Circle;

    /**
     * 扇形
     *
     * @class
     * @extends Shape
     */
    function Arc(cx, cy, r, startAngle, endAngle) {

        /**
         * 扇形圆心x坐标
         */
        this.cx = function (value) {
            return this.attr("cx", value);
        };

        /**
         * 扇形圆心y坐标
         */
        this.cy = function (value) {
            return this.attr("cy", value);
        };

        /**
         * 扇形半径
         */
        this.r = function (value) {
            return this.attr("r", value);
        };

        /**
         * 扇形起始角度
         */
        this.startAngle = function (value) {
            return this.attr("startAngle", value);
        };

        /**
         * 扇形终止角度
         */
        this.endAngle = function (value) {
            return this.attr("endAngle", value);
        };

        /**
         * 扇形的路径数据
         */
        this.path = function (value) {
            _util.domAttrName("path", "d");
            if (value === undefined) {
                var arc = d3.svg.arc().outerRadius(this.r());
                var result = arc({startAngle: this.startAngle(), endAngle: this.endAngle()});
                return result;
            }
            else {
                return this.attr("path", value);
            }
        };


        // initialize
        this.init();

        this.cx(cx);
        this.cy(cy);
        this.r(r);
        this.startAngle(startAngle);
        this.endAngle(endAngle);
    }

    Arc.prototype = new Shape();
    Arc.prototype.constructor = Arc;

    /**
     * 路径
     *
     * @class
     * @extends Shape
     */
    function Path(pathData) {

        var _pathData = null;

        /**
         * 路径数据
         */
        this.path = function (value) {
            _util.domAttrName("path", "d");
            return this.attr("path", value);
        };

        /**
         * 开始记录路径
         */
        this.beginPath = function () {
            _pathData = "";
            return this;
        };

        /**
         * 移动到指定位置
         */
        this.moveTo = function (x, y) {
            _pathData += "M" + [x, y];
            return this;
        };

        /**
         * 划线到指定位置
         */
        this.lineTo = function (x, y) {
            _pathData += "L" + [x, y];
            return this;
        };

        /**
         * 水平划线到指定位置
         */
        this.lineToH = function (x) {
            _pathData += "H" + x;
            return this;
        };

        /**
         * 垂直划线到指定位置
         */
        this.lineToV = function (y) {
            _pathData += "V" + y;
            return this;
        };

        /**
         * 封闭路径
         */
        this.close = function () {
            _pathData += "Z";
            return this;
        };

        /**
         * 终止记录路径，返回所记录的路径数据
         *
         * @param discard   是否丢弃所记录的路径数据（不应用到当前路径图形）
         */
        this.endPath = function (discard) {
            if (_pathData && !discard) {
                this.path(_pathData);
            }
            return this;
        };

        /**
         * 返回刚刚记录的路径数据
         */
        this.lastPath = function () {
            return _pathData;
        };

        // initialize
        this.init();
        if (pathData != null) {
            this.path(pathData);
        }
    }

    Path.prototype = new Shape();
    Path.prototype.constructor = Path;

    // initialize
    _util = new Util();
    _domAttrMap = new d3.map();

    return {
        GraphicsContext: GraphicsContext,
        BaseObject: BaseObject,
        Shape: Shape,
        Group: Group,
        Text: Text,
        Image: Image,
        Rect: Rect,
        Circle: Circle,
        Arc: Arc,
        Path: Path,

        util: _util
    };
});