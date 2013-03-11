///import core
///import plugins\removeformat.js
///commands 字体颜色,背景色,字号,字体,下划线,删除线
///commandsName  ForeColor,BackColor,FontSize,FontFamily,Underline,StrikeThrough
///commandsTitle  字体颜色,背景色,字号,字体,下划线,删除线
/**
 * @description 字体
 * @name baidu.editor.execCommand
 * @param {String}     cmdName    执行的功能名称
 * @param {String}    value             传入的值
 */
(function ($, ns) {
    var domUtils = ns.domUtils;

    ns.plugins['font'] = function () {
        var me = this,
            fonts = {
                'forecolor':'color',
                'backcolor':'background-color',
                'fontsize':'font-size',
                'fontfamily':'font-family',
                'underline':'text-decoration',
                'strikethrough':'text-decoration'
            };
        me.setOpt({
            'fontfamily':[
                { name:'arial', val:'arial, helvetica,sans-serif'},
                { name:'arialHebrew', val:'Arial Hebrew'},
                { name:'courier', val:'Courier'},
                { name:'courierNew', val:'Courier New'},
                { name:'georgia', val:'Georgia'},
                { name:'heitiJ', val:'Heiti J'},
                { name:'helvetica', val:'Helvetica'},
                { name:'georgia', val:'Georgia'},
                { name:'timesNewRoman', val:'Times New Roman'},
                { name:'rebuchetMS', val:'Trebuchet MS'},
                { name:'verdana', val:'Verdana'},
                { name:'zapfino', val:'Zapfino'}
            ],
            'fontsize':[10, 11, 12, 14, 16, 18, 20, 24, 36]
        });

        for (var p in fonts) {
            (function (cmd, style) {
                ns.commands[cmd] = {
                    execCommand:function (cmdName, value) {
                        value = value || (this.queryCommandState(cmdName) ? 'none' : cmdName == 'underline' ? 'underline' : 'line-through');
                        var me = this,
                            range = this.selection.getRange(),
                            text;

                        if (value == 'default') {

                            if (range.collapsed) {
                                text = me.document.createTextNode('font');
                                range.insertNode(text).select();

                            }
                            me.execCommand('removeFormat', 'span,a', style);
                            if (text) {
                                range.setStartBefore(text).setCursor();
                                domUtils.remove(text);
                            }


                        } else {
                            if (me.currentSelectedArr && me.currentSelectedArr.length > 0) {
                                for (var i = 0, ci; ci = me.currentSelectedArr[i++];) {
                                    range.selectNodeContents(ci);
                                    range.applyInlineStyle('span', {'style':style + ':' + value});

                                }
                                range.selectNodeContents(this.currentSelectedArr[0]).select();
                            } else {
                                if (!range.collapsed) {
                                    if ((cmd == 'underline' || cmd == 'strikethrough') && me.queryCommandValue(cmd)) {
                                        me.execCommand('removeFormat', 'span,a', style);
                                    }
                                    range = me.selection.getRange();

                                    range.applyInlineStyle('span', {'style':style + ':' + value}).select();
                                } else {

                                    var span = domUtils.findParentByTagName(range.startContainer, 'span', true);
                                    text = me.document.createTextNode('font');
                                    if (span && !span.children.length && !span['textContent'].replace(fillCharReg, '').length) {
                                        //for ie hack when enter
                                        range.insertNode(text);
                                        if (cmd == 'underline' || cmd == 'strikethrough') {
                                            range.selectNode(text).select();
                                            me.execCommand('removeFormat', 'span,a', style, null);

                                            span = domUtils.findParentByTagName(text, 'span', true);
                                            range.setStartBefore(text);

                                        }
                                        span.style.cssText += ';' + style + ':' + value;
                                        range.collapse(true).select();


                                    } else {
                                        range.insertNode(text);
                                        range.selectNode(text).select();
                                        span = range.document.createElement('span');

                                        if (cmd == 'underline' || cmd == 'strikethrough') {
                                            //a标签内的不处理跳过
                                            if (domUtils.findParentByTagName(text, 'a', true)) {
                                                range.setStartBefore(text).setCursor();
                                                domUtils.remove(text);
                                                return;
                                            }
                                            me.execCommand('removeFormat', 'span,a', style);
                                        }

                                        span.style.cssText = style + ':' + value;


                                        text.parentNode.insertBefore(span, text);
                                        //修复，span套span 但样式不继承的问题
                                        var spanParent = span.parentNode;
                                        while (!domUtils.isBlockElm(spanParent)) {
                                            if (spanParent.tagName == 'SPAN') {
                                                //opera合并style不会加入";"
                                                span.style.cssText = spanParent.style.cssText + ";" + span.style.cssText;
                                            }
                                            spanParent = spanParent.parentNode;
                                        }


                                        range.setStart(span, 0).setCursor();

                                    }
                                    domUtils.remove(text);
                                }
                            }

                        }
                        return true;
                    },
                    queryCommandValue:function (cmdName) {
                        var startNode = this.selection.getStart();

                        //trace:946
                        if (cmdName == 'underline' || cmdName == 'strikethrough') {
                            var tmpNode = startNode, value;
                            while (tmpNode && !domUtils.isBlockElm(tmpNode) && !domUtils.isBody(tmpNode)) {
                                if (tmpNode.nodeType == 1) {
                                    value = domUtils.getComputedStyle(tmpNode, style);

                                    if (value != 'none') {
                                        return value;
                                    }
                                }

                                tmpNode = tmpNode.parentNode;
                            }
                            return 'none';
                        }
                        return  domUtils.getComputedStyle(startNode, style);
                    },
                    queryCommandState:function (cmdName) {
                        if (this.highlight) {
                            return -1;
                        }
                        if (!(cmdName == 'underline' || cmdName == 'strikethrough')) {
                            return 0;
                        }
                        return this.queryCommandValue(cmdName) == (cmdName == 'underline' ? 'underline' : 'line-through');
                    }
                };
            })(p, fonts[p]);
        }


    };
})(Zepto, ME);