/**
 * Created by Jasion on 15/1/21.
 */

/**
 * 动画库模块
 */
define(['../../lib/d3/d3'], function () {

    /**
     * 动画接口类
     *
     * @param ease              缓动方式，有效值包括：linear,circle,elastic,bounce
     * @param duration          动画时长，单位为毫秒
     * @param transAttributes   动画终止状态属性值，e.g. {x:100, y:300}，表示以动画方式将位置移动到(100,300)
     * @param delay             动画延迟执行时间
     *
     * @class
     */
    function Animation(ease, duration, transAttributes, delay) {
        // Public Attributes
        var _ease = ease == null ? "linear" : ease;   //linear,circle,elastic,bounce
        var _duration = duration == null ? 500 : duration;
        var _delay = delay;
        var _transAttributes = transAttributes;
        var _nextAnimation = null;

        //========================================================
        // Public Attributes setter / getter

        /**
         * 属性：缓动方式(线性、弹性等)，有效值：linear,circle,elastic,bounce
         */
        this.ease = function (value) {
            if (!arguments.length) {
                return _ease;
            }
            else {
                _ease = value;
                return this;
            }
        };

        /**
         * 属性：动画时长
         */
        this.duration = function (value) {
            if (!arguments.length) {
                return _duration;
            }
            else {
                _duration = value;
                return this;
            }
        };

        /**
         * 属性：动画延迟时间
         */
        this.delay = function (value) {
            if (!arguments.length) {
                return _delay;
            }
            else {
                _delay = value;
                return this;
            }
        };

        /**
         * 动画终止状态属性值集，e.g. {x:100, y:300}
         */
        this.transAttributes = function (value) {
            if (!arguments.length) {
                return _transAttributes;
            }
            else {
                _transAttributes = value;
                return this;
            }
        };
        //=======================================================

        /**
         * 下一动画对象，在当前动画执行完毕后开始
         *
         * @param value     {Animation}动画对象
         */
        this.nextAnimation = function (value) {
            if (!arguments.length) {
                return _nextAnimation;
            }
            else {
                _nextAnimation = value;
                return this;
            }
        };

        /**
         * 将动画应用到指定的一个或多个图形（数组）
         *
         * @param shapes    图形对象或图形对象数组
         */
        this.toShapes = function (shapes) {
            var transition = null;
            if (shapes instanceof Array) {
                var nodes = new Array();
                var count = shapes.length;
                for (var i = 0; i < count; i++) {
                    nodes[i] = shapes[i].node();
                }
                transition = d3.selectAll(nodes).transition();
            }
            else {
                transition = d3.select(shapes.node()).transition();
            }

            doTransition(transition, this, shapes);
        };

        /**
         * 针对每个图形对象动画停止时触发的事件
         *
         * value    事件方法
         */
        this.transitionEnd = function (method) {
            // 动画结束触发的事件
            if (method === undefined) {
                return this.onTransitionEnd;
            }
            else {
                this.onTransitionEnd = method;
                return this;
            }
        };

        function doTransition(transition, animation, shapes) {
            if (!transition.empty() && animation.transAttributes != null) {
                if (animation.ease() != null) {
                    transition.ease(animation.ease());
                }
                if (animation.duration() != null) {
                    transition.duration(animation.duration());
                }
                if (animation.delay() != null) {
                    transition.delay(animation.delay());
                }

                var transAttributes = animation.transAttributes();
                var needTransform = false;
                for (var attrName in transAttributes) {
                    var domAttrName = attrName;
                    if (attrName == "path") {
                        domAttrName = "d";
                    }

                    var attrValue = transAttributes[attrName];
                    if (attrName == "scale" || attrName == "translate" || attrName == "rotate" ||
                        attrName == "skewX" || attrName == "skewY") {
                        needTransform = true;
                    }
                    else if (typeof attrValue === "function") {
                        var shape = (shapes instanceof Array) ? shapes[0] : shapes;
                        var datumn = shape.datum();
                        var value = attrValue(datumn, 0);
                        if (value && typeof value === "function") {
                            transition.attrTween(domAttrName, attrValue);
                        }
                        else {
                            transition.attr(domAttrName, attrValue);
                        }
                    }
                    else {
                        transition.attr(domAttrName, attrValue);
                    }

                    if (shapes instanceof Array) {
                        var count = shapes.length;
                        for (var i = 0; i < count; i++) {
                            if (typeof attrValue === "function") {
                                // 值是函数，计算函数的值
                                var realAttrValue = attrValue(shapes[i].datum());
                                if (typeof realAttrValue === "function") {
                                    // 是插值函数, 计算其最终(1.0)的值
                                    realAttrValue = realAttrValue(1.0);
                                }
                                shapes[i].attr(attrName, realAttrValue, true);
                            }
                            else {
                                shapes[i].attr(attrName, attrValue, true);
                            }
                        }
                    }
                    else {
                        if (typeof attrValue === "function") {
                            // 值是函数，计算函数的值
                            attrValue = attrValue(shapes.datum())(1.0);
                            if (typeof attrValue === "function") {
                                // 是插值函数, 计算其最终(1.0)的值
                                attrValue = attrValue(1.0);
                            }
                        }
                        shapes.attr(attrName, attrValue, true);
                    }
                }

                if (needTransform) {
                    transition.attr("transform", function (d, i) {
                        var shape = this.shape;
                        var transform = shape.mergeTransform();
                        return transform;
                    });
                }

                transition.each("end.transition", function () {
                    if (animation.onTransitionEnd != null) {
                        var shape = this.shape;
                        if (shape != null) {
                            animation.onTransitionEnd.call(shape);
                        }
                    }
                });
            }

            if (animation.nextAnimation) {
                transition = transition.transition();
                doTransition(transition, animation.nextAnimation, shapes);
            }
        }
    }

    return {
        Animation: Animation
    };
});