/**
 * Created by Jasion on 15/2/2.
 */

define(['../../src/uve/graphics', '../../src/uve/animation', '../../src/charts/base'],
    function (graph, anima, base) {
        function PageExecutor() {
            /*require(['cute-slider/js/modernizr.min.js',
                'cute-slider/js/cute.slider.js',
                'cute-slider/js/cute.transitions.all.js'], function () {*/

            require(['cute-slider/js/modernizr.min'], function() {
                require(['cute-slider/js/cute.slider'], function() {
                    require(['cute-slider/js/cute.transitions.all'], function() {
                        var imgNames = [1,2,3,4,5];
                        var imgul = d3.select("body>div>div>ul");
                        imgul.selectAll("li")
                            .data(imgNames)
                            .enter()
                            .append("li")
                            .attr("data-delay", 999999)
                            .attr("data-src", 5)
                            .attr("data-trans3d", "tr6,tr17,tr22,tr23,tr26,tr27,tr29,tr32,tr34,tr35,tr53,tr54,tr62,tr63,tr4,tr13")
                            .attr("data-trans2d", "tr3,tr8,tr12,tr19,tr22,tr25,tr27,tr29,tr31,tr34,tr35,tr38,tr39,tr41")
                            .append("img")
                            .attr("src", function(d, i) {
                                if (i == 0) {
                                    return "cute-slider/002/1.jpg";
                                }
                                else {
                                    return  "cute-slider/bg/blank.png";
                                }
                            })
                            .attr("data-src", function(d, i) {
                                return "cute-slider/002/" + (i+1) + ".jpg";
                            });

                        var cuteslider3 = new Cute.Slider();
                        cuteslider3.setup("cuteslider_3" , "cuteslider_3_wrapper", "cute-slider/css/slider-style.css");

                        d3.select("#cmdTest").on("click", function () {
                            cuteslider3.api.next();
                        });
                    });
                });
            });
        }

        return {
            PageExecutor: PageExecutor
        };
    });
