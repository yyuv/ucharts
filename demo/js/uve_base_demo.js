/**
 * Created by Jasion on 15/1/29.
 */

define(['../../src/uve/graphics', '../../src/uve/animation', '../../src/charts/base'],
    function (graph, anima, base) {

        var gc = null;

        function PageExecutor() {
            this.execute = function () {
                if (gc != null)
                    return;

                var container = d3.select("div#container");
                var width = container.node().clientWidth;
                var height = container.node().clientHeight;
                gc = new graph.GraphicsContext(container.node(), width, height);

                var itemsPerRow = 0;

                //gc.getSVG();
                //d3.select("svg").style({border: "2px solid red"});

                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text == "创建图形") {
                        createShape();
                    }
                    else if (text == "动画") {
                        animateShape();
                    }
                    else if (text == "组合") {
                        groupShapes();
                    }
                    else if (text == "数据") {
                        bindData();
                    }
                    else if (text == "更新数据") {
                        updateData();
                    }
                });

                function createShape() {
                    gc.clearAll();

                    // 创建矩形
                    var shape = new graph.Rect(55, 55, 30, 30)
                        .fill("blue")
                        .stroke("red");
                    gc.addShape(shape);

                    // 创建圆角矩形
                    shape = new graph.Rect(105, 55, 30, 30, 8, 8)
                        .fill("red")
                        .stroke("blue");
                    gc.addShape(shape);

                    // 创建圆形
                    shape = new graph.Circle(90, 130, 30)
                        .fill(d3.rgb(0, 255, 255))
                        .stroke("red");
                    gc.addShape(shape);
                }

                function animateShape() {
                    if (gc != null && anima != null) {
                        var shapes = gc.shapes();
                        if (shapes != null && shapes.length > 0) {
                            var shape = shapes[0];

                            // 对图形应用动画
                            var animation = new anima.Animation("bounce", 2000, {x: 100, y: shape.y() + 150});
                            animation.toShapes(shape);
                        }

                        if (d3.select("#amount").empty()) {
                            var text = new graph.Text(150, 100, "金额：￥3590.65")
                                .id("amount")
                                .fill("yellow");
                            gc.addShape(text);

                            var animation = new anima.Animation("bounce", 2000,
                                {value: function() {
                                    // 通过自定义插值函数实现不规则的d值动画
                                    var interpolate = d3.interpolate(0, 3590.65);
                                    return function (t) {
                                        var result = interpolate(t);
                                        text.text("金额：￥" + result.toFixed(2));
                                        //audio.play();
                                        //var audio = new Audio('images/tick.mp3');
                                        //audio.play()
                                        d3.select("#audio").node().play();
                                        return result;
                                    };
                                }});
                            animation.toShapes(text);
                        }
                    }
                }

                function groupShapes() {
                    gc.clearAll();

                    // 创建组
                    var group = new graph.Group()
                        .fill("red")
                        .stroke("blue");
                    gc.addShape(group);

                    // 在组下创建图形
                    var shape = new graph.Rect(100, 50, 80, 30);
                    group.addShape(shape);
                    shape = new graph.Circle(140, 35, 30);
                    group.addShape(shape);

                    // 改变组的属性
                    setTimeout(function () {
                        // 通过setTimer操作，否则在iPhone Safari下无法马上刷新
                        alert("确定后改变组背景为绿色");
                        group.fill("green");
                    }, 100);


                    // 对组应用动画
                    setTimeout(function () {
                        alert("确定后对组应用动画");
                        var animation = new anima.Animation("bounce", 2000, {translate: "0,100", rotate: "90,140,35"});
                        animation.toShapes(group);
                    }, 200);
                }

                function bindData() {
                    var root = gc.root();
                    root.clearAll();
                    root.dataEnter(onDataEnter);
                    root.dataUpdate(onDataUpdate);
                    root.dataExit(onDataExit);

                    var text = "华北,32886.65\n华东,28966.33\n华南,18665.66";
                    var data = new base.Dataset().parseCSV(text).data();
                    root.updateData(data, 0);
                }

                function updateData() {
                    var text = "华北,12886.65\n华南,53122.98\n西北,18995.22\n华中,8918.56\n东北,23561.92";
                    var data = new base.Dataset().parseCSV(text).data();
                    gc.root().updateData(data, 0);
                }

                function onDataEnter(datum, index) {
                    var dx = 50 + 80 * index;
                    var dy = 50 + (index % 2) * 50;
                    if (dx > width - 80) {
                        if (itemsPerRow == 0) {
                            itemsPerRow = index;
                        }

                        var row = index / itemsPerRow;
                        var col = index % itemsPerRow;
                        dx = 50 + 80 * col;
                        dy = 50 + (col % 2) * 50 + 100 * row;
                    }

                    var group = new graph.Group()
                        .translate(dx * 5 + "," + dy * 5)
                        .scale(0.2)
                        .opacity(1.0);
                    gc.addShape(group);
                    group.datum(datum); // 绑定数据到组

                    var r = 50 * datum[1] / 50000;
                    var circle = new graph.Circle(0, 0, r)
                        .fill("none")
                        .stroke("yellow");
                    group.addShape(circle);

                    var text = new graph.Text(0, 0, datum[0])
                        .id("t1")
                        .fill("orange")
                        .textAnchor("middle")
                        .fontSize(12);
                    group.addShape(text);
                    text = new graph.Text(0, 13, datum[1])
                        .id("t2")
                        .fill("cyan")
                        .textAnchor("middle")
                        .fontSize(12);
                    group.addShape(text);

                    // 以动画方式放大到原始大小
                    var animation = new anima.Animation("bounce", 2000,
                        {scale: 1.0, translate: dx + "," + dy});
                    animation.nextAnimation = new anima.Animation("elastic", 1000,
                        //{rotate: "60,0,0"});
                        {skewY: "30"});
                    animation.toShapes(group);
                }

                function onDataUpdate(datum, index, shape) {
                    if (shape instanceof graph.Group) {
                        var dx = 50 + 80 * index;
                        var dy = 50 + (index % 2) * 50;
                        if (dx > width - 80) {
                            if (itemsPerRow == 0) {
                                itemsPerRow = index;
                            }

                            var row = index / itemsPerRow;
                            var col = index % itemsPerRow;
                            dx = 50 + 80 * col;
                            dy = 50 + (col % 2) * 50 + 100 * row;
                        }

                        var r = 50 * datum[1] / 50000;

                        var animation = new anima.Animation("bounce", 2000,
                            {translate: dx + "," + dy});
                        animation.toShapes(shape);

                        var circle = shape.selectShape("Circle");
                        animation = new anima.Animation("bounce", 2000, {r: r})
                            .transitionEnd(function () {
                                var text = shape.selectShape("Text#t2");
                                if (text != null) {
                                    text.text(datum[1]);
                                }
                            });
                        animation.toShapes(circle);
                    }
                }

                function onDataExit(datum, index, shape) {
                    var animation = new anima.Animation("linear", 1000, {opacity: 0})
                        .transitionEnd (function () {
                            // 动画结束后，删除shape
                            this.remove();
                        });
                    animation.toShapes(shape);
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });