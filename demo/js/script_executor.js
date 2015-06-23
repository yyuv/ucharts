/*$(document).ready(function () {

    $(document).bind("pagebeforecreate pagecreate", function (e) {
        alert("pagebeforecreate");
    });
});*/

var pageModules = new Object();
pageModules["home"] = "js/home";
pageModules["uve_base_demo"] = "js/uve_base_demo";
pageModules["chart_pie_demo"] = "js/chart_pie_demo";
pageModules["chart_bar_demo"] = "js/chart_bar_demo";
pageModules["region_sales"] = "js/region_sales";
pageModules["rich_transition"] = "js/rich_transition";
pageModules["chart_tagcloud_demo"] = "js/chart_tagcloud_demo";
pageModules["chart_treemap_demo"] = "js/chart_treemap_demo";

var CSSettings = {"pluginPath":"cute-slider"};

// 在页面创建后执行页面代码
$(document).bind("pagecreate", function (e) {
    var target = e.target;
    var pageModule = pageModules[target.id];
    if (pageModule != null && target.pe == null) {
        // 解决JS在浏览器中的缓存问题
        var body = d3.select("body");
        var ver = body.attr("code-ver");
        if (ver) {
            require.config({
                urlArgs: "ver=" + ver
            });
        }

        require([pageModule], function (pm) {
            target.pe = new pm.PageExecutor();
            target.pe.execute.call(target);
        });
    }
});


