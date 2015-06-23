Ext.data.JsonP.Background({"tagname":"class","name":"Background","autodetected":{},"files":[{"filename":"base.js","href":"base.html#Background"}],"params":[{"tagname":"params","name":"color","doc":"<p>颜色值，可以是渐变色，如：#ff0000,#ffffff,0</p>\n"},{"tagname":"params","name":"image","doc":"<p>背景图</p>\n"},{"tagname":"params","name":"repeat","doc":"<p>背景图重复方式，包括：no-repeat, repeat, repeat-x, repeat-y, stretch</p>\n"}],"extends":"BaseObject","members":[{"name":"allAttrs","tagname":"method","owner":"BaseObject","id":"method-allAttrs","meta":{}},{"name":"attr","tagname":"method","owner":"BaseObject","id":"method-attr","meta":{}},{"name":"color","tagname":"method","owner":"Background","id":"method-color","meta":{}},{"name":"image","tagname":"method","owner":"Background","id":"method-image","meta":{}},{"name":"init","tagname":"method","owner":"BaseObject","id":"method-init","meta":{}},{"name":"repeat","tagname":"method","owner":"Background","id":"method-repeat","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-Background","short_doc":"背景类 ...","component":false,"superclasses":["BaseObject"],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/BaseObject' rel='BaseObject' class='docClass'>BaseObject</a><div class='subclass '><strong>Background</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/base.html#Background' target='_blank'>base.js</a></div></pre><div class='doc-contents'><p>背景类</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>color</span> : <div class='sub-desc'><p>颜色值，可以是渐变色，如：#ff0000,#ffffff,0</p>\n</div></li><li><span class='pre'>image</span> : <div class='sub-desc'><p>背景图</p>\n</div></li><li><span class='pre'>repeat</span> : <div class='sub-desc'><p>背景图重复方式，包括：no-repeat, repeat, repeat-x, repeat-y, stretch</p>\n</div></li></ul></div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-allAttrs' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/BaseObject' rel='BaseObject' class='defined-in docClass'>BaseObject</a><br/><a href='source/graphics.html#BaseObject-method-allAttrs' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BaseObject-method-allAttrs' class='name expandable'>allAttrs</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>返回对象的所有属性的名称（数组） ...</div><div class='long'><p>返回对象的所有属性的名称（数组）</p>\n</div></div></div><div id='method-attr' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/BaseObject' rel='BaseObject' class='defined-in docClass'>BaseObject</a><br/><a href='source/graphics.html#BaseObject-method-attr' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BaseObject-method-attr' class='name expandable'>attr</a>( <span class='pre'>name, value</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>设置/获取指定名称的属性 ...</div><div class='long'><p>设置/获取指定名称的属性</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>name</span> : Object<div class='sub-desc'></div></li><li><span class='pre'>value</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-color' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Background'>Background</span><br/><a href='source/base.html#Background-method-color' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Background-method-color' class='name expandable'>color</a>( <span class='pre'>value</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>设置/获取背景颜色，支持渐变色(起始颜色, 结束颜色, 渐变角度)\n\ne.g. ...</div><div class='long'><p>设置/获取背景颜色，支持渐变色(起始颜色, 结束颜色, 渐变角度)</p>\n\n<p>e.g. 单色：  red、#80ffee00\n     渐变色：#ffee00,#ffffff,90</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-image' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Background'>Background</span><br/><a href='source/base.html#Background-method-image' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Background-method-image' class='name expandable'>image</a>( <span class='pre'>value</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>设置/获取背景图像 ...</div><div class='long'><p>设置/获取背景图像</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : Object<div class='sub-desc'></div></li></ul></div></div></div><div id='method-init' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/BaseObject' rel='BaseObject' class='defined-in docClass'>BaseObject</a><br/><a href='source/graphics.html#BaseObject-method-init' target='_blank' class='view-source'>view source</a></div><a href='#!/api/BaseObject-method-init' class='name expandable'>init</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>初始化，在子类需要在构造函数中调用 ...</div><div class='long'><p>初始化，在子类需要在构造函数中调用</p>\n</div></div></div><div id='method-repeat' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Background'>Background</span><br/><a href='source/base.html#Background-method-repeat' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Background-method-repeat' class='name expandable'>repeat</a>( <span class='pre'>value</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>设置/获取背景图像的重复方式\n\n有效重复方式包括：\nno-repeat, repeat, repeat-x, repeat-y, stretch ...</div><div class='long'><p>设置/获取背景图像的重复方式</p>\n\n<p>有效重复方式包括：\nno-repeat, repeat, repeat-x, repeat-y, stretch</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : Object<div class='sub-desc'></div></li></ul></div></div></div></div></div></div></div>","meta":{}});