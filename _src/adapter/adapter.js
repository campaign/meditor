;(function ($, ns) {
    var ui = ns.ui,
        _uis = {};

    $.extend(ns, {

        registerUI:function (cmdName, fn) {
            cmdName = typeof cmdName == 'string' ? cmdName.split(/\s/) : cmdName;
            $.each(cmdName, function () {
                _uis[this.toLowerCase()] = fn;
            });
        },

        getUI:function (editor, cmdName) {
            var fn = _uis[cmdName];
            if (fn) {
                return fn(editor, cmdName)
            }
        },

        getEditor:function (selector, options) {
            $(selector).each(function () {
                var meditor = $(this).data('meditor'), _toolbar;
                if (meditor) {

                } else {
                    meditor = new ns.Editor(options);
                    meditor.render(this);
                    $(this).data('meditor', meditor);
                    function traversal(toolbars, toolbarItems) {
                        toolbarItems = toolbarItems || [];
                        $.each(toolbars, function (i, n) {
                            if ($.isString(n)) {
                                toolbarItems.push(ns.getUI(meditor, n.toLowerCase()))
                            } else {
                                toolbarItems.push(ui[n.type.toLowerCase()]({
                                    name:(n.name || '').toLowerCase(),
                                    items:traversal(n.items)
                                }))
                            }
                        });
                        return toolbarItems
                    }

                    _toolbar = ui.toolbar({items:traversal(meditor.options.toolbars)})
                        .render($(meditor.iframe.parentNode).css({
                        overflow:'visible'
                    }))
                        .zIndex(meditor.options.zIndex);

                    $(meditor.window).on('focus', function(){
                        var h = _toolbar.root().height();
                        setTimeout(function(){
                            var rng = meditor.selection.getRange().cloneRange(),
                                span, offset;

                            if(rng.collapsed){
                                span = meditor.document.createElement('span');
                                span.innerHTML = '&nbsp;';

                                rng.insertNode(span);
                                offset = span.getBoundingClientRect();
                                span.parentNode.removeChild(span);

                                window.scrollTo(0, Math.max(1, offset.top-h));
                            }
                        }, 0);
                    });
                }
            })
        }
    })

})(Zepto, ME)