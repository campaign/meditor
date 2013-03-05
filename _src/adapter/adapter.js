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
                var meditor = $(this).data('meditor');
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

                    ui.toolbar({items:traversal(meditor.options.toolbars)})
                        .render($(meditor.iframe.parentNode).css({
                        overflow:'visible'
                    }))
                        .zIndex(meditor.options.zIndex);
                }
            })
        }
    })

})(Zepto, ME)