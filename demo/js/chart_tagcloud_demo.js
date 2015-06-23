/**
 * Created by Jasion on 15/2/2.
 */

define(['require', '../../src/uve/graphics', '../../src/uve/animation', '../../src/charts/base'],
    function (require, graph, anima, base) {
        function PageExecutor() {
            var _chart = null;

            this.execute = function () {
                var actionButtons = d3.select(this).selectAll("#action_ctrl>a");
                actionButtons.on("click", function () {
                    var text = (this.text || this.innerText).trim();
                    if (text.indexOf("创建图表") >= 0) {
                        render();
                    }
                    else if (text.indexOf("条件颜色") >= 0) {
                        conditionColor();
                    }
                    else if (text.indexOf("减少方向") >= 0) {
                        decOrientations();
                    }
                    else if (text.indexOf("动态链接") >= 0) {
                        dynaLink();
                    }
                });

                var uchart = null;
                require(['../../src/charts/advance/TagCloud'], function (mod) {
                    uchart = mod;
                });

                var container = d3.select("div#container");

                var meta = {
                    columns: [
                        {name: "Tag", title: "标签", datatype: "String"},
                        {name: "Freq", title: "频度", datatype: "Number"}
                    ]
                };
                var data = "互联网+,54\nWord,17\nsprite,9\nnone,9\nwords,9\nlayout,7\nJavaScript,7\ncloud,6\n" +
                    "placed,5\nUse,5\nHTML,5\nWordle,5\nbounding,5\ncolor,5\noperation,4\nJonathan,4\n" +
                    "Feinberg,4\nTag,4\nhierarchical,4\nflex,4\ncollision,4\narea,4\npossible,4\nbbtree,4\n" +
                    "masks,3\nimplementation,3\nthink,3\nAlgorithm,3\ntime,3\ndraw,3\nretrieve,3\ndata,3\n" +
                    "Generator,3\nfont,3\nstep,3\nfonts,3\ncandidate,3\nbox,3\nstarting,3\nreturn,3\n" +
                    "fired,2\nplacement,2\n0,2\nrect,2\nstroke,2\nsimple,2\n32,2\nmove,2\n" +
                    "previouslyplaced,2\nWorks,2\nmakes,2\ncss,2\nnumber,2\nwithout,2\nBoxes,2\nglyphs,2\n" +
                    "always,2\nvia,2\nSVG,2\ninstead,2\npixel,2\nattribute,2\nseparately,2\nexpensive,2\n" +
                    "pixels,2\neven,2\nvar,2\ndetection,2\nusing,2\nfontSize,2\nlarger,2\nwhole,2\n=,2\n" +
                    "comparing,2\ntext,2\n32bit,2\nTimes,2\ncode,2\nlarge,2\nSizes,2\nD3,2\nversion,2\n" +
                    "single,2\ntest,2\nslightly,2\ntree,2\nsee,2\nbit,2\nPerformance,2\nimplement,2\n" +
                    "CSS3,2\nclouds,2\nVisualization,2\nperform,2\nkhtmluserselect,1\nstuttering,1\n" +
                    "recommended,1\nmozuserselect,1\nmsuserselect,1\nouserselect,1\nanimations,1\n" +
                    "prevents,1\nbrowsers,1\nevent,1\nloop,1\nblocking,1\nplacing,1\nconfigured,1\n" +
                    "userselect,1\npre,1\n30,1\nd3scalelogrange10,1\nsize960,1\ntimeInterval10,1\n" +
                    "textfunctiond,1\nfontfamily,1\ndkey,1\nfontImpact,1\nfontSizefunctiond,1\n" +
                    "fontSize+dvalue,1\nrotatefunctiond,1\n~~Mathrandom,1\npadding1,1\nonword,1\n" +
                    "progress,1\nrather,1\nMenlo,1\nstart,1\nmonospace,1\nrotate,1\npadding,1\noptions,1\n" +
                    "take,1\neither,1\nconstant,1\nvalues,1\naccessor,1\nfunctions,1\ncalled,1\ndatum,1\n" +
                    "two,1\nevents,1\nsuggestions,1\nsuccessfully,1\nend,1\nstop,1\nrunning,1\nsimply,1\n" +
                    "call,1\nlayoutstop,1\nsynchronous,1\nvalue,1\ntimeIntervalInfinity,1\nWeb,1\n60,1\n" +
                    "Yes,1\nalthough,1\nneed,1\nwait,1\nloaded,1\nstring,1\nregexp,1\nNotes,1\nincredibly,1\n" +
                    "urlstylecss,1\nimportant,1\nAttempt,1\nplace,1\npoint,1\nusually,1\nnear,1\nmiddle,1\n" +
                    "somewhere,1\ncentral,1\nhorizontal,1\nline,1\nintersects,1\n756bb1,1\n100,1\none,1\n" +
                    "along,1\nincreasing,1\nspiral,1\nRepeat,1\nintersections,1\nfound,1\nhard,1\npart,1\n" +
                    "making,1\n600,1\nefficiently,1\nAccording,1\nkeyword,1\n3182bd,1\ncomment,1\nuses,1\n" +
                    "combination,1\ndoctype,1\n636363,1\n31a354,1\n1,1\nachieve,1\nreasonable,1\nspeeds,1\n" +
                    "f00,1\nisnt,1\nway,1\nclass,1\nprecise,1\nglyph,1\nshapes,1\nspecial,1\nDOM,1\n" +
                    "except,1\nperhaps,1\ne6550d,1\ncontainer,1\nhidden,1\ncanvas,1\nelement,1\ndisplay,1\n" +
                    "fill,1\nRetrieving,1\nflexdirection,1\nrow,1\nmany,1\nbreadcrumbs,1\nbatch,1\n" +
                    "Sprites,1\ncontent,1\ninitial,1\nperformed,1\nads,1\n12em,1\nJason,1\nDavies,1\n" +
                    "doesnt,1\ncopy,1\nappropriate,1\nposition,1\n→,1\nrepresenting,1\n3,1\navailable,1\n" +
                    "advantage,1\ninvolves,1\nGitHub,1\nd3cloud,1\nrelevant,1\nonend,1\n用友网络,7";
                var dataset = new base.Dataset(meta).parseCSV(data);

                function render() {
                    if (_chart) {
                        _chart.destroy();
                    }
                    _chart = new uchart.Chart(container);

                    _chart.dataset(dataset)
                        .title(new base.Title("标签云演示"))
                        .background(new base.Background("#a02da7e1"))   //半透明背景
                        .border(new base.LineStyle("cyan", 2))
                        .render();
                }

                function conditionColor() {
                    if (_chart) {
                        _chart.destroy();
                    }
                    _chart = new uchart.Chart(container);

                    // 利用属性值支持表达式的特性，很方便地实现了条件格式等
                    var fontExpr = "{!" +
                        "if ({$VALUE} > 8) ({family: 'Impact', color: 'red'});" +
                        "else if ({$VALUE} > 3) ({family: 'Impact', color: 'yellow'});" +
                        "else ({family: 'Impact', color: 'green'});" +
                        "}";
                    _chart.dataset(dataset)
                        .title({text: "标签云演示"})
                        .background({color: "#a02da7e1"})   //半透明背景
                        .border({color: "cyan", thickness: 2})
                        // 当主题设置了font属性，将优先主题而导致组件自身属性无效，改用forceProperty可强制生效
                        //.dataPlog({font: fontExpr})
                        .forceProperty("dataPlot.font", fontExpr)
                        .render();
                }

                function decOrientations() {
                    if (_chart) {
                        _chart.destroy();
                    }
                    _chart = new uchart.Chart(container);

                    _chart.dataset(dataset)
                        .title(new base.Title("标签云演示"))
                        .background(new base.Background("#a02da7e1"))   //半透明背景
                        .border(new base.LineStyle("cyan", 2))
                        .orientations(2)
                        .startAngle(-30)
                        .endAngle(30)
                        .render();
                }

                function dynaLink() {
                    alert("点击标签，可链接到此标签相关的页面，或执行相关代码。此处设置为弹出数据提示信息窗口。");

                    if (_chart) {
                        _chart.destroy();
                    }
                    _chart = new uchart.Chart(container);

                    _chart.dataset(dataset)
                        .title(new base.Title("标签云演示"))
                        .background(new base.Background("#a02da7e1"))   //半透明背景
                        .border(new base.LineStyle("cyan", 2))
                        .link("javascript:alert('标签:{$CATEGORY}，频度:{$VALUE}')")
                        .render();
                }
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });
