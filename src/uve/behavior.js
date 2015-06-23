/**
 * Created by Jasion on 15/2/7.
 */

/**
 * 交互行为库
 */
define(['../uve/graphics', '../../lib/d3/d3'], function (graph) {

    /**
     * 基础行为类，是所有行为的基类
     *
     * @class
     */
    function Behavior() {
        var _id = 1;

        /**
         * 获取当前行为对象的唯一ID，用于支持多重监听
         */
        this.id = function () {
            if (this.__id__ == null) {
                this.__id__ = _id ++;
            }

            return this.__id__;
        };

        /**
         * 行为应用到一个或多个图形对象
         *
         * @param shapes     一个(Shape)或多个(Shape Array)图形对象
         */
        this.toShapes = function (shapes) {
            // 由各子类实现
        };
    }

    /**
     * 点击行为类
     *
     * @class
     * @extends Behavior
     */
    function Touch() {
        var _click = null;
        var _dbclick = null;
        var _movein = null;
        var _moveout = null;
        var _moving = null;

        /**
         * 点击事件，包括鼠标单击及手指触控点击
         *
         * @param value     事件方法
         */
        this.click = function (value) {
            if (value === undefined) {
                return _click;
            }
            else {
                _click = value;
                return this;
            }
        };

        /**
         * 双击事件，包括鼠标单击及手指触控点击
         *
         * @param value     事件方法
         */
        this.dbclick = function (value) {
            if (value === undefined) {
                return _dbclick;
            }
            else {
                _dbclick = value;
                return this;
            }
        };

        /**
         * 移入事件（鼠标移入对象等）
         *
         * @param value     事件方法
         */
        this.moveIn = function (value) {
            if (value === undefined) {
                return _movein;
            }
            else {
                _movein = value;
                return this;
            }
        };

        /**
         * 移出事件（鼠标移出对象位置等）
         *
         * @param value     事件方法
         */
        this.moveOut = function (value) {
            if (value === undefined) {
                return _moveout;
            }
            else {
                _moveout = value;
                return this;
            }
        };

        /**
         * 移动事件（鼠标在对象上移动等）
         *
         * @param value     事件方法
         */
        this.moving = function (value) {
            if (value === undefined) {
                return _moving;
            }
            else {
                _moving = value;
                return this;
            }
        };

        // @override
        this.toShapes = function (shapes) {
            var selection = graph.util.d3select(shapes);
            if (_click != null) {
                selection.on("click.ID" + this.id(), function () {
                    if (!d3.event.defaultPrevented) {
                        _click.call(this.shape, d3.event.clientX, d3.event.clientY);
                    }
                });
            }

            if (_dbclick != null) {
                selection.on("dblclick.ID" + this.id(), function () {
                    if (!d3.event.defaultPrevented) {
                        _dbclick.call(this.shape, d3.event.clientX, d3.event.clientY);
                    }
                });
            }

            if (_movein != null) {
                selection.on("mouseover.ID" + this.id(), function () {
                    if (!d3.event.defaultPrevented) {
                        _movein.call(this.shape, d3.event.clientX, d3.event.clientY);
                    }
                });
            }

            if (_moveout != null) {
                selection.on("mouseout.ID" + this.id(), function () {
                    if (!d3.event.defaultPrevented) {
                        _moveout.call(this.shape, d3.event.clientX, d3.event.clientY);
                    }
                });
            }

            if (_moving != null) {
                selection.on("mousemove.ID" + this.id(), function () {
                    if (!d3.event.defaultPrevented) {
                        _moving.call(this.shape, d3.event.clientX, d3.event.clientY);
                    }
                });
            }
        };
    }

    Touch.prototype = new Behavior();
    Touch.prototype.constructor = Touch;


    /**
     * 拖放行为类
     *
     * @class
     * @extends Behavior
     */
    function Drag() {
        var _dragBehavior = null;
        var _dragStart = null;
        var _dragMove = null;
        var _dragEnd = null;

        /**
         * 拖放开始事件
         *
         * @param value     事件方法
         */
        this.dragStart = function (value) {
            if (value === undefined) {
                return _dragStart;
            }
            else {
                _dragStart = value;
                return this;
            }
        };

        /**
         * 拖放过程移动事件
         *
         * @param value     事件方法
         */
        this.dragMove = function (value) {
            if (value === undefined) {
                return _dragMove;
            }
            else {
                _dragMove = value;
                return this;
            }
        };

        /**
         * 拖放结束事件
         *
         * @param value     事件方法
         */
        this.dragEnd = function (value) {
            if (value === undefined) {
                return _dragEnd;
            }
            else {
                _dragEnd = value;
                return this;
            }
        };

        // @override
        this.toShapes = function (shapes) {
            if (_dragBehavior == null) {
                _dragBehavior = d3.behavior.drag();
            }

            if (_dragStart != null) {
                _dragBehavior.on("dragstart.ID" + this.id(), function () {
                    var event = d3.event.sourceEvent;
                    _dragStart.call(this.shape, event.clientX, event.clientY);
                });
            }
            if (_dragMove != null) {
                _dragBehavior.on("drag.ID" + this.id(), function () {
                    var event = d3.event.sourceEvent;
                    _dragMove.call(this.shape, event.clientX, event.clientY);
                });
            }
            if (_dragEnd != null) {
                _dragBehavior.on("dragend.ID" + this.id(), function () {
                    var event = d3.event.sourceEvent;
                    _dragEnd.call(this.shape, event.clientX, event.clientY);
                });
            }

            var selection = graph.util.d3select(shapes);
            selection.call(_dragBehavior);
            return this;
        };
    }

    Drag.prototype = new Behavior();
    Drag.prototype.constructor = Drag;


    /**
     * 缩放行为类
     *
     * @class
     * @extends Behavior
     */
    function Zoom() {

        /**
         * 缩放中事件
         *
         * @param value     事件方法
         */
        this.zooming = function (value) {

        };
    }

    Zoom.prototype = new Behavior();
    Zoom.prototype.constructor = Zoom;


    /**
     * 旋转行为类
     *
     * @class
     * @extends Behavior
     */
    function Rotate() {

        /**
         * 旋转中事件
         *
         * @param value     事件方法
         */
        this.rotating = function (value) {

        };
    }

    Rotate.prototype = new Behavior();
    Rotate.prototype.constructor = Rotate;


    return {
        Touch: Touch,
        Drag: Drag,
        Zoom: Zoom,
        Rotate: Rotate
    };
});