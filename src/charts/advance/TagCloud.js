/**
 * Created by Jasion on 15/5/16.
 */

define(['require', '../../uve/graphics', '../../uve/animation', '../../uve/behavior',
    '../base', '../../../lib/d3/d3'], function (require, graph, anima, behav, base) {

    /**
     * 标签云实现类
     * 
     * @param container 容器，一般是一个HTML DIV元素
     *
     * @class
     * @extends UChartBase
     */
    function TagCloud(container) {

        var _width = 0, _height = 0;

        this.init = function () {
            TagCloud.prototype.init.call(this, container);

            // 初始化属性值
            this.dataPlot({font: {family: "Impact"}})
                .startFontSize(8)
                .endFontSize(36)
                .startAngle(-60)
                .endAngle(60)
                .orientations(5)
                .categoryColumn(0)
                .valueColumn(1);
        };


        // -----------------------------------------------
        // 图表属性

        /**
         * 标签起始字体大小
         */
        this.startFontSize = function (value) {
            return this.attr("startFontSize", value);
        };

        /**
         * 标签终止字体大小
         */
        this.endFontSize = function (value) {
            return this.attr("endFontSize", value);
        };

        /**
         * 标签方向起始角度
         */
        this.startAngle = function (value) {
            return this.attr("startAngle", value);
        };

        /**
         * 标签方向终止角度
         */
        this.endAngle = function (value) {
            return this.attr("endAngle", value);
        };

        /**
         * 标签方向数
         */
        this.orientations = function (value) {
            return this.attr("orientations", value);
        };

        // -----------------------------------------------
        

        this.render = function () {
            // 先调用父类的render，处理背景、标题等
            TagCloud.prototype.render.call(this);
            this.updateData();
        };

        this.updateData = function () {
            var chartLayer = this.chartLayer(true);
            chartLayer.clearAll();
            var dataset = this.dataset();
            if (!dataset || dataset.rowCount() == 0) {
                return this;
            }

            var palette = this.property("palette");
            var textColor = d3.scale.ordinal().range(palette);

            // 按频度排序数据
            var data = dataset.data();
            var categoryColumn = this.property("categoryColumn", 0);
            var valueColumn = this.property("valueColumn", 1);
            data.sort(function(d1, d2) {
                if (d2[valueColumn] == d1[valueColumn]) {
                    return (d2[categoryColumn] || "").length - (d1[categoryColumn] || "").length;
                }
                else {
                    return d2[valueColumn] - d1[valueColumn];
                }
            });

            var minValue = data[data.length - 1][this.valueColumn()] || 1;
            var maxValue = data[0][valueColumn];
            var startFontSize = this.property("startFontSize", 8);
            var endFontSize = this.property("endFontSize", 36);
            var fontSize = d3.scale.log()
                .range([startFontSize, endFontSize])
                .domain([minValue, maxValue]);

            _width = chartLayer.width();
            _height = chartLayer.height();
            var startAngle = this.property("startAngle", -60);
            var endAngle = this.property("endAngle", 60);
            var orientations = this.property("orientations", 5);
            var chart = this;

            data = data.map(function(d) {
                var text = d[categoryColumn];
                var freq = d[valueColumn];
                var size = fontSize(freq);
                var tickAngle = ~~((endAngle - startAngle) / (orientations-1));
                var textAngle = startAngle + tickAngle * ~~((orientations-1) * Math.random() + 0.5);
                var datum = {category: text, value: freq, size: size, rotation: textAngle};
                var font = chart.property("dataPlot.font", null, datum);
                var fontColor = font.color;

                // 创建文字对象
                var textShape = new graph.Text(0, 0, text)
                    .textAnchor("middle");
                if (font != null) {
                    font.size = size;
                    font.color = "none";
                    base.util.applyFontTo(font, textShape);
                    font.color = fontColor; // 恢复原始值
                }
                textShape.translate([_width/2, _height/2]);

                chartLayer.addShape(textShape);
                textShape.datum(datum);
                datum.shape = textShape;
                datum.textColor = fontColor? fontColor : textColor(datum.category.toLowerCase());

                // 绑定数据项到数据集，用于链接时获取自定义列的值等
                chart.bindDatumToDataset(datum, i);

                return datum;
            });

            // 通过碰撞检测重新排列文字标签
            var visibleTexts = [];
            var n = data.length, isLast = false;
            for (var i = 0; i < n; i ++) {
                var datum = data[i];
                if (!datum.obbox) {
                    var bbox = datum.bbox = datum.shape.bbox();
                    var obbox = obboxFromBbox(bbox, datum.rotation);

                    var canPlace = false;
                    var nextPos = nextPosFunc(datum);
                    var pos = null;
                    while (pos = nextPos()) {
                        obbox.moveTo(pos[0], pos[1]);
                        var result = collisionDetect(obbox, data);
                        if (!result) {
                            canPlace = true;
                            break;
                        }

                        //========================================================
                        // for debug
                        if (isLast) {
                            var d = -bbox.y - bbox.height/2;
                            // 中心点相对于基准点的坐标
                            var cx0 = d * Math.cos((datum.rotation-90)*Math.PI/180);
                            var cy0 = d * Math.sin((datum.rotation-90)*Math.PI/180);

                            // 文字中心点移到obbox.centerPoint
                            var x = obbox.centerPoint.x - cx0;
                            var y = obbox.centerPoint.y - cy0;
                            datum.shape.fill("red")
                                .rotate(datum.rotation)
                                .translate([x, y]);
                            alert("collision: " + datum.category + " <=> " + result.category);
                        }
                        //========================================================
                    }

                    if (!canPlace) {
                        //========================================================
                        // for debug
                        /*if (isLast) {
                            datum.shape.fill("red")
                                .rotate(datum.rotation)
                                .translate([200, 200]);
                            break;
                        }
                        else {
                            i --;
                            isLast = true;
                        }*/
                        //========================================================
                        break;
                    }
                    else {
                        datum.obbox = obbox;
                        visibleTexts.push(datum.shape);
                        datum.shape.fill(datum.textColor);
                    }
                }
            }

            // 通过动画将文字移到正确位置
            var animation = new anima.Animation("elastic", 2000,
                {
                    rotate: function(datum,i) {
                        return datum.rotation;
                    },
                    translate: function(datum,i) {
                        var bbox = datum.bbox;
                        var obbox = datum.obbox;
                        // 中心点到基准点的距离
                        var d = -bbox.y - bbox.height/2;
                        // 中心点相对于基准点的坐标
                        var cx0 = d * Math.cos((datum.rotation-90)*Math.PI/180);
                        var cy0 = d * Math.sin((datum.rotation-90)*Math.PI/180);

                        // 文字中心点移到obbox.centerPoint
                        var x = obbox.centerPoint.x - cx0;
                        var y = obbox.centerPoint.y - cy0;
                        return [x, y];
                    }
                },
                function (d, i) {
                    return ~~(i / (visibleTexts.length / 20)) * 50;
                });
            animation.toShapes(visibleTexts);

            this.handleBehaviors();
        };

        this.doLink = function (shape) {
            if (shape) {
                var x = shape.x(), y = shape.y();
                shape.x(x-10).y(y-10);
                var animation = new anima.Animation("elastic", 500, {x: x, y: y});
                var chart = this;
                animation.transitionEnd(function () {
                    TagCloud.prototype.doLink.call(chart, shape);
                })
                    .toShapes(shape);
            }
            else {
                TagCloud.prototype.doLink.call(this, shape);
            }
        };

        function collisionDetect(obbox, data) {
            if (isInsideObbox(obbox)) {
                var n = data.length;
                for (var i = 0; i < n; i++) {
                    if (data[i].obbox) {
                        if (isCollision(obbox, data[i].obbox)) {
                            return data[i];
                        }
                    }
                    else {
                        // 因为按顺序处理，后面的obbox一定为空，因此无需判断
                        break;
                    }
                }

                return null;
            }
            else {
                // 位置超出范围
                return true;
            }
        }

        function nextPosFunc(datum) {
            // Algorithm 1:
            // 按矩形，从专心螺旋往外查找位置, loops, loop
            /*var tw = loop * _width / loops, th = loop * _height / loops;
            var scaleX = d3.scale.linear()
                .domain([0.0, 0.25, 0.5, 0.75, 1.0])
                .range([_width/2-tw/2, _width/2+tw/2, _width/2+tw/2, _width/2-tw/2, _width/2-tw/2]);

            var scaleY = d3.scale.linear()
                .domain([0.0, 0.25, 0.5, 0.75, 1.0])
                .range([_height/2-th/2, _height/2-th/2, _height/2+th/2, _height/2+th/2, _height/2-th/2]);

            function nextPos(i) {
                var pos = [scaleX(i/nextPos.ticks), scaleY(i/nextPos.ticks)];
                return pos;
            }
            nextPos.ticks = loop * 4;*/

            // Algorithm 2:
            /*var pos = [x, y];
            var index = 0, max = 3; //如果循环一遍仍取不到可用位置，再随机取三次点循环

            return function() {
                pos[0] += x > _width/2? - this.startFontSize()/2 : this.startFontSize()/2;
                //pos[1] += y > _height/2? - this.startFontSize()/2 : this.startFontSize()/2;
                if (isInsidePos(pos)) {
                    return pos;
                }
                else {
                    pos[0] = x;
                    pos[1] += y > _height/2? - this.startFontSize()/2 : this.startFontSize()/2;
                    if (isInsidePos(pos)) {
                        return pos;
                    }
                }
                //else if (index < max) {
                //    index ++;
                //    x = ~~(_width * Math.random());
                //    y = ~~(_height * Math.random());
                //    pos = [x, y];
                //    return pos;
                //}

                return null;
            }*/

            // Algorithm 3: 从画布中心按圆环寻找
            var loop = 1, dr = datum.size;
            var rad = -1.0/loop;

            return function() {
                rad += 1.0/loop;
                if (rad >= 2 * Math.PI) {
                    rad = 0;
                    loop ++;

                    if (dr*loop > _width/2 && dr*loop > _height/2) {
                        return null;
                    }
                }

                var x = _width/2 + (dr*loop) * Math.cos(rad);
                var y = _height/2 + (dr*loop) * Math.sin(rad);
                return [x,y];
            }
        }
        
        function isInsidePos(pos) {
            if (pos[0] < 0 || pos[0] > _width || pos[1] < 0 || pos[1] > _height) {
                return false;
            }

            return true;
        }

        function isInsideObbox(obbox) {
            if (obbox.x1 < 0 || obbox.x2 > _width || obbox.y1 < 0 || obbox.y2 > _height) {
                return false;
            }

            return true;
        }

        function OBBox(centerPoint, width, height, rotation) {
            var k = (rotation || 0) * Math.PI / 180;
            this.centerPoint = new Vector(centerPoint.x, centerPoint.y);
            this.width = width;
            this.height = height;
            this.rotation = rotation;
            this.axes = [new Vector(Math.cos(k), Math.sin(k)), new Vector(-1 * Math.sin(k), Math.cos(k))];

            // 旋转后四个顶点坐标
            var p0 = centerPoint;
            var p1 = rotatePoint({x: p0.x - width/2, y: p0.y - height/2}, centerPoint, rotation);
            var p2 = rotatePoint({x: p0.x + width/2, y: p0.y - height/2}, centerPoint, rotation);
            var p3 = rotatePoint({x: p0.x + width/2, y: p0.y + height/2}, centerPoint, rotation);
            var p4 = rotatePoint({x: p0.x - width/2, y: p0.y + height/2}, centerPoint, rotation);

            // x1,y1,x2,y2为对应AABBox矩形坐标
            this.x1 = Math.min(p1.x, p2.x, p3.x, p4.x);
            this.y1 = Math.min(p1.y, p2.y, p3.y, p4.y);
            this.x2 = Math.max(p1.x, p2.x, p3.x, p4.x);
            this.y2 = Math.max(p1.y, p2.y, p3.y, p4.y);

            // 移动相对距离
            this.offset = function(dx, dy) {
                this.centerPoint.x += dx;
                this.centerPoint.y += dy;
                this.x1 += dx;
                this.y1 += dy;
                this.x2 += dx;
                this.y2 += dy;
            };

            // 移动绝对距离
            this.moveTo = function(cx, cy) {
                var dx = cx - this.centerPoint.x;
                var dy = cy - this.centerPoint.y;
                return this.offset(dx, dy);
            };

            // 计算在指定轴上的投影
            this.calcProjection = function (axis) {
                return this.width * Math.abs(axis.dot(this.axes[0])) + this.height * Math.abs(axis.dot(this.axes[1]));
            };
        }

        function obboxFromBbox(bbox, rotation) {
            return new OBBox({x: bbox.x + bbox.width/2, y: bbox.y + bbox.height/2}, bbox.width, bbox.height, rotation);
        }

        function Vector(x, y) {
            this.x = x || 0;
            this.y = y || 0;

            // 两个向量减
            this.sub = function(v) {
                return new Vector(this.x - v.x, this.y - v.y);
            };

            // 两个向量的点积（注：若b为单位矢量，则a与b的点积即为a在方向b的投影）
            this.dot = function(v) {
                return this.x * v.x + this.y * v.y;
            };
        }

        function rotatePoint(p, p0, a) {
            if (!a || a == 0) {
                return p;
            }
            else {
                var k = a * Math.PI / 180;
                return {
                    x: p0.x + (p.x - p0.x) * Math.cos(k) - (p.y - p0.y) * Math.sin(k),
                    y: p0.y + (p.x - p0.x) * Math.sin(k) + (p.y - p0.y) * Math.cos(k)
                };
            }
        }

        /**
         * 检测两个方向包围盒是否碰撞
         */
        function isCollision(obbox1, obbox2) {
            // 先通过AABB快速判断
            if (obbox1.x1 > obbox2.x2 || obbox1.x2 < obbox2.x1) {
                return false;
            }
            else if (obbox1.y1 > obbox2.y2 || obbox1.y2 < obbox2.y1) {
                return false;
            }
            else if (obbox1.width == 0 || obbox2.width == 0) {
                return false;
            }

            // 再通过轴投影判断是否真正碰撞（碰撞时，两OBB在任意轴上的投影均相交）
            var axis, proj, proj1, proj2;
            var nv = obbox1.centerPoint.sub(obbox2.centerPoint);    // 两OBB中心点向量

            axis = obbox1.axes[0];
            proj = Math.abs(nv.dot(axis) * 2);
            proj1 = obbox1.calcProjection(axis);
            proj2 = obbox2.calcProjection(axis);
            if (proj1 + proj2 < proj)
                return false;

            axis = obbox1.axes[1];
            proj = Math.abs(nv.dot(axis) * 2);
            proj1 = obbox1.calcProjection(axis);
            proj2 = obbox2.calcProjection(axis);
            if (proj1 + proj2 < proj)
                return false;

            axis = obbox2.axes[0];
            proj = Math.abs(nv.dot(axis) * 2);
            proj1 = obbox1.calcProjection(axis);
            proj2 = obbox2.calcProjection(axis);
            if (proj1 + proj2 < proj)
                return false;

            axis = obbox2.axes[1];
            proj = Math.abs(nv.dot(axis) * 2);
            proj1 = obbox1.calcProjection(axis);
            proj2 = obbox2.calcProjection(axis);
            if (proj1 + proj2 < proj)
                return false;

            return true;
        }

        this.init();
    }
    TagCloud.prototype = new base.UChartBase();
    TagCloud.prototype.constructor = TagCloud;

    return {
        Chart: TagCloud
    };
});
