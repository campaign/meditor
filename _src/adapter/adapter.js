;
(function ($, ui) {
    var _registerUIs = {};
    $.extend(ME, {
        registerUI:function (cmdName, fn) {
            $.each(cmdName.split(/\s+/), function (i, c) {
                _registerUIs[c.toLowerCase()] = fn;
            });
        },
        getUI:function (editor, cmdName) {
            var fn = _registerUIs[cmdName];
            if (fn) {
                return fn(editor, cmdName)
            }
        },
        getEditor:function (selector, options) {
            $(selector).each(function () {
                var meditor = $(this).data('meditor');
                if (meditor) {

                } else {
                    meditor = new ME.Editor(options);
                    meditor.render(this);
                    $(this).data('meditor', meditor);
                    function traversal(toolbars, toolbarItems) {
                        toolbarItems = toolbarItems || [];
                        $.each(toolbars, function (i, n) {
                            if ($.isString(n)) {
                                toolbarItems.push(ME.getUI(meditor, n.toLowerCase()))
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
                        position:'relative',
                        overflow:'visible'
                    }))
                        .zIndex(meditor.options.zIndex);
                }
            })
        }
    })

})(Zepto, ME.ui)