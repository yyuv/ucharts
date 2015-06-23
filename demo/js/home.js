/**
 * Created by Jasion on 15/2/8.
 */

define(['../../lib/d3/d3'],
    function () {
        function PageExecutor() {
            this.execute = function () {
                var focusElm = document.activeElement;

                d3.select("body")
                    .on("keydown", function(key) {
                        var code = d3.event.keyCode;
                        console.info(code);
                    });
            }
        }

        return {
            PageExecutor: PageExecutor
        };
    });