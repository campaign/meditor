/**
 * @file
 * @name ME.Editor
 * @short Editor
 * @import editor.js,core/utils.js,core/EventBase.js,core/browser.js,core/dom/dtd.js,core/dom/domUtils.js,core/dom/Range.js,core/dom/Selection.js,plugins/serialize.js
 * @desc 编辑器主类，包含编辑器提供的大部分公用接口
 */
(function ($) {
    var uid = 0, _selectionChangeTimer;


    /**
     * @private
     * @ignore
     * @param form  编辑器所在的form元素
     * @param editor  编辑器实例对象
     */
    function setValue(form, editor) {
        var textarea;
        if (editor.textarea) {
            if (utils.isString(editor.textarea)) {
                for (var i = 0, ti, tis = domUtils.getElementsByTagName(form, 'textarea'); ti = tis[i++];) {
                    if (ti.id == 'ueditor_textarea_' + editor.options.textarea) {
                        textarea = ti;
                        break;
                    }
                }
            } else {
                textarea = editor.textarea;
            }
        }
        if (!textarea) {
            form.appendChild(textarea = domUtils.createElement(document, 'textarea', {
                'name':editor.options.textarea,
                'id':'ueditor_textarea_' + editor.options.textarea,
                'style':"display:none"
            }));
            //不要产生多个textarea
            editor.textarea = textarea;
        }
        textarea.value = editor.hasContents() ?
            (editor.options.allHtmlEnabled ? editor.getAllHtml() : editor.getContent(null, null, true)) :
            ''
    }

    /**
     * UEditor编辑器类
     * @name Editor
     * @desc 创建一个跟编辑器实例
     * - ***container*** 编辑器容器对象
     * - ***iframe*** 编辑区域所在的iframe对象
     * - ***window*** 编辑区域所在的window
     * - ***document*** 编辑区域所在的document对象
     * - ***body*** 编辑区域所在的body对象
     * - ***selection*** 编辑区域的选区对象
     */
    var Editor = ME.Editor = function (options) {
        var me = this;
        me.uid = uid++;
        me.commands = {};
        me.options = utils.extend(utils.clone(options || {}), UEDITOR_CONFIG, true);
        me.shortcutkeys = {};
        me.inputRules = [];
        me.outputRules = [];
        //设置默认的常用属性
        me.setOpt({
            isShow:true,
            initialContent:'欢迎使用ueditor!',
            autoClearinitialContent:false,
            iframeCssUrl:me.options.UEDITOR_HOME_URL + 'themes/iframe.css',
            textarea:'editorValue',
            focus:false,
            focusInEnd:true,
            initialFrameWidth:1000,
            initialFrameHeight:me.options.minFrameHeight || 320, //兼容老版本配置项
            minFrameWidth:800,
            minFrameHeight:220,
            autoClearEmptyNode:true,
            fullscreen:false,
            readonly:false,
            zIndex:999,
            imagePopup:true,
            enterTag:'p',
            pageBreakTag:'_baidu_page_break_tag_',
            customDomain:false,
            lang:'zh-cn',
            langPath:me.options.UEDITOR_HOME_URL + 'lang/',
            theme:'default',
            themePath:me.options.UEDITOR_HOME_URL + 'themes/',
            allHtmlEnabled:false,
            scaleEnabled:false,
            tableNativeEditInFF:false
        });
        //初始化插件
        for (var pi in ME.plugins) {
            ME.plugins[pi].call(me);
        }
        me.langIsReady = true;

        me.trigger("langReady");
        ME.instants['ueditorInstant' + me.uid] = me;
    };
    Editor.prototype = {
        /**
         * 当编辑器ready后执行传入的fn,如果编辑器已经完成ready，就马上执行fn，fn的中的this是编辑器实例。
         * 大部分的实例接口都需要放在该方法内部执行，否则在IE下可能会报错。
         * @name ready
         * @grammar editor.ready(fn) fn是当编辑器渲染好后执行的function
         * @example
         * var editor = new ME.ui.Editor();
         * editor.render("myEditor");
         * editor.ready(function(){
         *     editor.setContent("欢迎使用UEditor！");
         * })
         */
        ready:function (fn) {
            var me = this;
            if (fn) {
                me.isReady ? fn.apply(me) : me.on('ready', fn);
            }
        },
        /**
         * 为编辑器设置默认参数值。若用户配置为空，则以默认配置为准
         * @grammar editor.setOpt(key,value);      //传入一个键、值对
         * @grammar editor.setOpt({ key:value});   //传入一个json对象
         */
        setOpt:function (key, val) {
            var obj = {};
            if (utils.isString(key)) {
                obj[key] = val
            } else {
                obj = key;
            }
            utils.extend(this.options, obj, true);
        },
        /**
         * 销毁编辑器实例对象
         * @name destroy
         * @grammar editor.destroy();
         */
        destroy:function () {

            var me = this;
            me.trigger('destroy');
            var container = me.container.parentNode;
            var textarea = me.textarea;
            if (!textarea) {
                textarea = document.createElement('textarea');
                container.parentNode.insertBefore(textarea, container);
            } else {
                textarea.style.display = ''
            }
            textarea.style.width = container.offsetWidth + 'px';
            textarea.style.height = container.offsetHeight + 'px';
            textarea.value = me.getContent();
            textarea.id = me.key;
            container.innerHTML = '';
            domUtils.remove(container);
            var key = me.key;
            //trace:2004
            for (var p in me) {
                if (me.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            ME.delEditor(key);

        },
        /**
         * 渲染编辑器的DOM到指定容器，必须且只能调用一次
         * @name render
         * @grammar editor.render(containerId);    //可以指定一个容器ID
         * @grammar editor.render(containerDom);   //也可以直接指定容器对象
         */
        render:function (container) {
            var me = this, options = me.options;
            if (utils.isString(container)) {
                container = document.getElementById(container);
            }
            if (container) {
                var html = '<!DOCTYPE html>' +
                        '<html><head>' +
                        ( options.iframeCssUrl ? '<link rel=\'stylesheet\' type=\'text/css\' href=\'' + utils.unhtml(options.iframeCssUrl) + '\'/>' : '' ) +
                        '<style type=\'text/css\'>' +
                        //设置四周的留边
                        '.view{padding:0;word-wrap:break-word;cursor:text;height:100%;}\n' +
                        //设置默认字体和字号
                        //font-family不能呢随便改，在safari下fillchar会有解析问题
                        'body{margin:8px;font-family:sans-serif;font-size:16px;}' +
                        //设置段落间距
                        'p{margin:5px 0;}'
                        + ( options.initialStyle || '' ) +
                        '</style></head><body class="view"  spellcheck="false" contentEditable="true" autocapitalize="none" autocorrect="off" autocomplete="off" ></body>';
                if (options.customDomain && document.domain != location.hostname) {
                    html += '<script>window.parent.ME.instants[\'ueditorInstant' + me.uid + '\']._setup(document);</script></html>';
                    container.appendChild(domUtils.createElement(document, 'iframe', {
                        id:'baidu_editor_' + me.uid,
                        width:"100%",
                        height:"100%",
                        frameborder:"0",
                        src:'javascript:void(function(){document.open();document.domain="' + document.domain + '";' +
                            'document.write("' + html + '");document.close();}())'
                    }));
                } else {
                    container.innerHTML = '<iframe width="100%" height="100%" scroll="no" frameborder="0" ></iframe>';
                    var doc = container.firstChild.contentWindow.document;
                    //去掉了原来的判断!browser.webkit，因为会导致onload注册的事件不触发
                    doc.open();
                    doc.write(html + '</html>');
                    doc.close();
                    me._setup(doc);
                }
                container.style.overflow = 'hidden';
            }
        },
        /**
         * 编辑器初始化
         * @private
         * @ignore
         * @param {Element} doc 编辑器Iframe中的文档对象
         */
        _setup:function (doc) {

            var me = this,
                options = me.options;


//            doc.body.contentEditable = true;
//            doc.body.spellcheck = false;
//            doc.body.autocorrect="off";
//            doc.body.autocapitalize="off";

            me.document = doc;
            me.window = doc.defaultView || doc.parentWindow;
            me.iframe = me.window.frameElement;
            me.body = doc.body;
            domUtils.on(me.body,'touchend',function(){me.selection.getRange().select()});
            //设置编辑器最小高度
            me.setHeight(options.height);
            me.selection = new ME.Selection(doc);

            this._initEvents();
            if (options.initialContent) {
                if (options.autoClearinitialContent) {
                    var oldExecCommand = me.execCommand;
                    me.execCommand = function () {
                        me.trigger('firstBeforeExecCommand');
                        return oldExecCommand.apply(me, arguments);
                    };
                    this._setDefaultContent(options.initialContent);
                } else
                    this.setContent(options.initialContent, false, true);
            }
            //为form提交提供一个隐藏的textarea
            for (var form = this.iframe.parentNode; !domUtils.isBody(form); form = form.parentNode) {
                if (form.tagName == 'FORM') {
                    domUtils.on(form, 'submit', function () {
                        setValue(this, me);
                    });
                    break;
                }
            }
            //编辑器不能为空内容
            if (domUtils.isEmptyNode(me.body)) {
                me.body.innerHTML = '<p><br/></p>';
            }
            //如果要求focus, 就把光标定位到内容开始
            if (options.focus) {
                setTimeout(function () {
                    me.focus(me.options.focusInEnd);
                    //如果自动清除开着，就不需要做selectionchange;
                    !me.options.autoClearinitialContent && me._selectionChange();
                }, 0);
            }
            if (!me.container) {
                me.container = this.iframe.parentNode;
            }
            me.isReady = 1;
            me.trigger('ready');
            options.onready && options.onready.call(me);
            domUtils.on(me.window, ['blur', 'focus'], function (e) {
                //chrome下会出现alt+tab切换时，导致选区位置不对
                if (e.type == 'blur') {
                    me._bakRange = me.selection.getRange();
                    try {
                        me.selection.getNative().removeAllRanges();
                    } catch (e) {
                    }

                } else {
                    try {
                        me._bakRange && me._bakRange.select();
                    } catch (e) {
                    }
                }
            });

        },
        /**
         * 同步编辑器的数据，为提交数据做准备，主要用于你是手动提交的情况
         * @name sync
         * @grammar editor.sync(); //从编辑器的容器向上查找，如果找到就同步数据
         * @grammar editor.sync(formID); //formID制定一个要同步数据的form的id,编辑器的数据会同步到你指定form下
         * @desc
         * 后台取得数据得键值使用你容器上得''name''属性，如果没有就使用参数传入的''textarea''
         * @example
         * editor.sync();
         * form.sumbit(); //form变量已经指向了form元素
         *
         */
        sync:function (formId) {
            var me = this,
                form = formId ? document.getElementById(formId) :
                    domUtils.findParent(me.iframe.parentNode, function (node) {
                        return node.tagName == 'FORM'
                    }, true);
            form && setValue(form, me);
        },
        /**
         * 设置编辑器高度
         * @name setHeight
         * @grammar editor.setHeight(number);  //纯数值，不带单位
         */
        setHeight:function (height) {
            if (height !== parseInt(this.iframe.parentNode.style.height)) {
                this.iframe.parentNode.style.height = height + 'px';
            }
            this.document.body.style.height = height - 20 + 'px';
        },


        /**
         * 获取编辑器内容
         * @name getContent
         * @grammar editor.getContent()  => String //若编辑器中只包含字符"&lt;p&gt;&lt;br /&gt;&lt;/p/&gt;"会返回空。
         * @grammar editor.getContent(fn)  => String
         * @example
         * getContent默认是会现调用hasContents来判断编辑器是否为空，如果是，就直接返回空字符串
         * 你也可以传入一个fn来接替hasContents的工作，定制判断的规则
         * editor.getContent(function(){
         *     return false //编辑器没有内容 ，getContent直接返回空
         * })
         */
        getContent:function (cmd,fn) {
            var me = this;
            if (cmd && utils.isFunction(cmd)) {
                fn = cmd;
                cmd = '';
            }
            if (fn ? !fn() : !this.hasContents()) {
                return '';
            }
            var range = me.selection.getRange(),
                address = range.createAddress();
//
//            me.trigger( 'beforegetcontent');
//            var root = UE.htmlparser(me.body.innerHTML);
//            me.filterOutputRule(root);
//            me.trigger( 'aftergetcontent', cmd );

            try{
                range.moveToAddress(address).select(true);
            }catch(e){}

            return  me.body.innerHTML
        },
        /**
         * 取得完整的html代码，可以直接显示成完整的html文档
         * @name getAllHtml
         * @grammar editor.getAllHtml()  => String
         */
        getAllHtml:function () {
            var me = this,
                headHtml = [],
                html = '';
            me.trigger('getAllHtml', headHtml);

            return '<html><head>' + (me.options.charset ? '<meta http-equiv="Content-Type" content="text/html; charset=' + me.options.charset + '"/>' : '')
                + (headHtmlForIE9 || me.document.getElementsByTagName('head')[0].innerHTML) + headHtml.join('\n') + '</head>'
                + '<body>' + me.getContent(null, null, true) + '</body></html>';
        },
        /**
         * 得到编辑器的纯文本内容，但会保留段落格式
         * @name getPlainTxt
         * @grammar editor.getPlainTxt()  => String
         */
        getPlainTxt:function () {
            var reg = new RegExp(domUtils.fillChar, 'g'),
                html = this.body.innerHTML.replace(/[\n\r]/g, '');//ie要先去了\n在处理
            html = html.replace(/<(p|div)[^>]*>(<br\/?>|&nbsp;)<\/\1>/gi, '\n')
                .replace(/<br\/?>/gi, '\n')
                .replace(/<[^>/]+>/g, '')
                .replace(/(\n)?<\/([^>]+)>/g, function (a, b, c) {
                    return dtd.$block[c] ? '\n' : b ? b : '';
                });
            //取出来的空格会有c2a0会变成乱码，处理这种情况\u00a0
            return html.replace(reg, '').replace(/\u00a0/g, ' ').replace(/&nbsp;/g, ' ');
        },

        /**
         * 获取编辑器中的纯文本内容,没有段落格式
         * @name getContentTxt
         * @grammar editor.getContentTxt()  => String
         */
        getContentTxt:function () {
            var reg = new RegExp(domUtils.fillChar, 'g');
            //取出来的空格会有c2a0会变成乱码，处理这种情况\u00a0
            return this.body.textContent.replace(reg, '').replace(/\u00a0/g, ' ');
        },

        /**
         * 将html设置到编辑器中, 如果是用于初始化时给编辑器赋初值，则必须放在ready方法内部执行
         * @name setContent
         * @grammar editor.setContent(html)
         * @example
         * var editor = new ME.ui.Editor()
         * editor.ready(function(){
         *     //需要ready后执行，否则可能报错
         *     editor.setContent("欢迎使用UEditor！");
         * })
         */
        setContent:function (html, isAppendTo, notFireSelectionchange) {
            var me = this;
//
//            me.trigger( 'beforesetcontent',html);
//            var root = UE.htmlparser(html);
//            me.filterInputRule(root);
//            html = root.toHtml();


            me.body.innerHTML = (isAppendTo ? this.getContent() : '') + html;

            //给文本或者inline节点套p标签
            if (me.options.enterTag == 'p') {

                var child = this.body.firstChild, tmpNode;
                if (!child || child.nodeType == 1 &&
                    (dtd.$cdata[child.tagName] ||
                        domUtils.isCustomeNode(child)
                        )
                    && child === this.body.lastChild) {
                    this.body.innerHTML = '<p><br/></p>' + this.body.innerHTML;

                } else {
                    var p = me.document.createElement('p');
                    while (child) {
                        while (child && (child.nodeType == 3 || child.nodeType == 1 && dtd.p[child.tagName] && !dtd.$cdata[child.tagName])) {
                            tmpNode = child.nextSibling;
                            p.appendChild(child);
                            child = tmpNode;
                        }
                        if (p.firstChild) {
                            if (!child) {
                                me.body.appendChild(p);
                                break;
                            } else {
                                child.parentNode.insertBefore(p, child);
                                p = me.document.createElement('p');
                            }
                        }
                        child = child.nextSibling;
                    }
                }
            }
            me.trigger( 'aftersetcontent' );
            me.trigger('contentchange');

            !notFireSelectionchange && me._selectionChange();
            //清除保存的选区
            me._bakRange = null;

        },

        /**
         * 让编辑器获得焦点，toEnd确定focus位置
         * @name focus
         * @grammar editor.focus([toEnd])   //默认focus到编辑器头部，toEnd为true时focus到内容尾部
         */
        focus:function (toEnd) {
            try {
                var me = this,
                    rng = me.selection.getRange();
                if (toEnd) {
                    rng.setStartAtLast(me.body.lastChild).setCursor(false, true);
                } else {
                    rng.select(true);
                }
            } catch (e) {
            }
        },

        /**
         * 初始化UE事件及部分事件代理
         * @private
         * @ignore
         */
        _initEvents:function () {
//            var me = this,
//                doc = me.document,
//                win = me.window;
//            me._proxyDomEvent = utils.bind(me._proxyDomEvent, me);
//            domUtils.on(doc, ['click', 'mousedown', 'keydown', 'keyup', 'keypress', 'mouseup', 'mouseover', 'mouseout', 'selectstart'], me._proxyDomEvent);
//            domUtils.on(win, ['focus', 'blur'], me._proxyDomEvent);
//            domUtils.on(doc, ['mouseup', 'keydown'], function (evt) {
//                //特殊键不触发selectionchange
//                if (evt.type == 'keydown' && (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)) {
//                    return;
//                }
//                if (evt.button == 2)return;
//                me._selectionChange(250, evt);
//            });


        },
        /**
         * 触发事件代理
         * @private
         * @ignore
         */
        _proxyDomEvent:function (evt) {
            return this.trigger(evt.type.replace(/^on/, ''), evt);
        },
        /**
         * 变化选区
         * @private
         * @ignore
         */
        _selectionChange:function (delay, evt) {
            var me = this;

            clearTimeout(_selectionChangeTimer);
            _selectionChangeTimer = setTimeout(function () {
                if (!me.selection.getNative()) {
                    return;
                }

                me.selection.cache();

                if (me.selection._cachedRange && me.selection._cachedStartElement) {
                    me.trigger('beforeselectionchange');
                    // 第二个参数causeByUi为true代表由用户交互造成的selectionchange.
                    me.trigger('selectionchange', !!evt);
                    me.trigger('afterselectionchange');
                    me.selection.clear();
                }
            }, delay || 50);
        },
        _callCmdFn:function (fnName, args) {
            var cmdName = args[0].toLowerCase(),
                cmd, cmdFn;
            cmd = this.commands[cmdName] || ME.commands[cmdName];
            cmdFn = cmd && cmd[fnName];
            //没有querycommandstate或者没有command的都默认返回0
            if ((!cmd || !cmdFn) && fnName == 'queryCommandState') {
                return 0;
            } else if (cmdFn) {
                return cmdFn.apply(this, args);
            }
        },

        /**
         * 执行编辑命令cmdName，完成富文本编辑效果
         * @name execCommand
         * @grammar editor.execCommand(cmdName)   => {*}
         */
        execCommand:function (cmdName) {
            cmdName = cmdName.toLowerCase();
            var me = this,
                result,
                cmd = me.commands[cmdName] || ME.commands[cmdName];
            if (!cmd || !cmd.execCommand) {
                return null;
            }
            if (!cmd.notNeedUndo && !me.__hasEnterExecCommand) {
                me.__hasEnterExecCommand = true;
                if (me.queryCommandState(cmdName) != -1) {
                    me.trigger('beforeexeccommand', cmdName);
                    result = this._callCmdFn('execCommand', arguments);
                    !me._ignoreContentChange && me.trigger('contentchange');
                    me.trigger('afterexeccommand', cmdName);
                }
                me.__hasEnterExecCommand = false;
            } else {
                result = this._callCmdFn('execCommand', arguments);
                !me._ignoreContentChange && me.trigger('contentchange')
            }
            !me._ignoreContentChange && me._selectionChange();
            return result;
        },
        /**
         * 根据传入的command命令，查选编辑器当前的选区，返回命令的状态
         * @name  queryCommandState
         * @grammar editor.queryCommandState(cmdName)  => (-1|0|1)
         * @desc
         * * ''-1'' 当前命令不可用
         * * ''0'' 当前命令可用
         * * ''1'' 当前命令已经执行过了
         */
        queryCommandState:function (cmdName) {
            return this._callCmdFn('queryCommandState', arguments);
        },

        /**
         * 根据传入的command命令，查选编辑器当前的选区，根据命令返回相关的值
         * @name  queryCommandValue
         * @grammar editor.queryCommandValue(cmdName)  =>  {*}
         */
        queryCommandValue:function (cmdName) {
            return this._callCmdFn('queryCommandValue', arguments);
        },
        /**
         * 检查编辑区域中是否有内容，若包含tags中的节点类型，直接返回true
         * @name  hasContents
         * @desc
         * 默认有文本内容，或者有以下节点都不认为是空
         * <code>{table:1,ul:1,ol:1,dl:1,iframe:1,area:1,base:1,col:1,hr:1,img:1,embed:1,input:1,link:1,meta:1,param:1}</code>
         * @grammar editor.hasContents()  => (true|false)
         * @grammar editor.hasContents(tags)  =>  (true|false)  //若文档中包含tags数组里对应的tag，直接返回true
         * @example
         * editor.hasContents(['span']) //如果编辑器里有这些，不认为是空
         */
        hasContents:function (tags) {
            if (tags) {
                for (var i = 0, ci; ci = tags[i++];) {
                    if (this.document.getElementsByTagName(ci).length > 0) {
                        return true;
                    }
                }
            }
            if (!domUtils.isEmptyBlock(this.body)) {
                return true
            }
            //随时添加,定义的特殊标签如果存在，不能认为是空
            tags = ['div'];
            for (i = 0; ci = tags[i++];) {
                var nodes = domUtils.getElementsByTagName(this.document, ci);
                for (var n = 0, cn; cn = nodes[n++];) {
                    if (domUtils.isCustomeNode(cn)) {
                        return true;
                    }
                }
            }
            return false;
        },
        /**
         * 重置编辑器，可用来做多个tab使用同一个编辑器实例
         * @name  reset
         * @desc
         * * 清空编辑器内容
         * * 清空回退列表
         * @grammar editor.reset()
         */
        reset:function () {
            this.trigger('reset');
        },

        /**
         * 设置默认内容
         * @ignore
         * @private
         * @param  {String} cont 要存入的内容
         */
        _setDefaultContent:function () {
            function clear() {
                var me = this;
                if (me.document.getElementById('initContent')) {
                    me.body.innerHTML = '<p><br/></p>';
                    me.off('firstBeforeExecCommand focus', clear);
                    setTimeout(function () {
                        me.focus();
                        me._selectionChange();
                    }, 0)
                }
            }

            return function (cont) {
                var me = this;
                me.body.innerHTML = '<p id="initContent">' + cont + '</p>';

                me.on('firstBeforeExecCommand focus', clear);
            }
        }(),

        /**
         * 计算编辑器当前内容的长度
         * @name  getContentLength
         * @grammar editor.getContentLength(ingoneHtml,tagNames)  =>
         * @example
         * editor.getLang(true)
         */
        getContentLength:function (ingoneHtml, tagNames) {
            var count = this.getContent().length;
            if (ingoneHtml) {
                tagNames = (tagNames || []).concat([ 'hr', 'img', 'iframe']);
                count = this.getContentTxt().replace(/[\t\r\n]+/g, '').length;
                for (var i = 0, ci; ci = tagNames[i++];) {
                    count += this.document.getElementsByTagName(ci).length;
                }
            }
            return count;
        },
        addInputRule:function (rule) {
            this.inputRules.push(rule);
        },
        filterInputRule:function (root) {
            for (var i = 0, ci; ci = this.inputRules[i++];) {
                ci.call(this, root)
            }
        },
        addOutputRule:function (rule) {
            this.outputRules.push(rule)
        },
        filterOutputRule:function (root) {
            for (var i = 0, ci; ci = this.outputRules[i++];) {
                ci.call(this, root)
            }
        },
        on:function (types, listener) {
            types = $.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                getListener(this, ti, true).push(listener);
            }
        },
        /**
         * 移除事件监听器
         * @name off
         * @grammar editor.off(types,fn)  //types为事件名称，多个可用空格分隔
         * @example
         * //changeCallback为方法体
         * editor.off("selectionchange",changeCallback);
         */
        off:function (types, listener) {
            types = $.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                utils.removeItem(getListener(this, ti) || [], listener);
            }
        },
        /**
         * 触发事件
         * @name trigger
         * @grammar editor.trigger(types)  //types为事件名称，多个可用空格分隔
         * @example
         * editor.trigger("selectionchange");
         */
        trigger:function (types) {
            types = $.trim(types).split(' ');
            for (var i = 0, ti; ti = types[i++];) {
                var listeners = getListener(this, ti),
                    r, t, k;
                if (listeners) {
                    k = listeners.length;
                    while (k--) {
                        if(!listeners[k])continue;
                        t = listeners[k].apply(this, arguments);
                        if(t === true){
                            return t;
                        }
                        if (t !== undefined) {
                            r = t;
                        }
                    }
                }
                if (t = this['on' + ti.toLowerCase()]) {
                    r = t.apply(this, arguments);
                }
            }
            return r;
        }
        /**
         * 得到dialog实例对象
         * @name getDialog
         * @grammar editor.getDialog(dialogName) => Object
         * @example
         * var dialog = editor.getDialog("insertimage");
         * dialog.open();   //打开dialog
         * dialog.close();  //关闭dialog
         */

    }
    function getListener(obj, type, force) {
        var allListeners;
        type = type.toLowerCase();
        return ( ( allListeners = ( obj.__allListeners || force && ( obj.__allListeners = {} ) ) )
            && ( allListeners[type] || force && ( allListeners[type] = [] ) ) );
    }
})(Zepto);

