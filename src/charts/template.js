/**
 * Created by Jasion on 15/5/16.
 */

define(['require', '../uve/graphics', '../uve/animation', '../uve/behavior',
    './base', '../../lib/d3/d3'], function (require, graph, anima, behav, base) {

    function MyChart() {

        this.render = function (container) {
            // 先调用父类的render，处理背景、标题等
            MyChart.prototype.render.call(this);

            // 获取当前数据集
            var dataset = this.dataset();

            // TODO: 获取图表的各项属性
            var color = this.property("color");

            // 获取图表层及有效渲染区大小
            var chartLayer = this.chartLayer();
            var width = chartLayer.width();
            var height = chartLayer.height();

            // TODO: 利用数据并根据各项属性，在图表层渲染你的组件

            // 处理交互操作，父类此方法已实现超链接、提示框的处理
            this.handleBehaviors();
        };

        this.updateData = function () {
            var dataset = this.dataset();

            // TODO: 利用数据集的新数据重新渲染你的组件
        };

        this.handleBehaviors = function () {
            // 调用父类方法，实现超链接、提示框的处理
            MyChart.prototype.handleBehaviors.call(this);

            // TODO: 处理你的组件的交互操作
            var shapes = this.chartLayer().shapes();
            new behav.Touch()
                .click(function (x, y) {
                    // 处理点击
                })
                .toShapes(shapes);
        }
    }

    MyChart.prototype = new base.UChartBase();
    MyChart.prototype.constructor = MyChart;

    return {
        Chart: MyChart
    };
});
