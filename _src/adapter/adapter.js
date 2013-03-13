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

                    //当iframe获得焦点时，如果把toolbar给盖住了，就向下移动合适的距离让toolbar不被光标盖住
                    $(meditor.window).on('focus', function(){
                        var h = _toolbar.root().height(), gap = 5;
                        setTimeout(function(){
                            var selection = meditor.selection.getNative(),
                                rng, offset;

                           if(selection.rangeCount){
                               rng = selection.getRangeAt(0);
                               offset = rng.getClientRects()[0];
                               console.log(offset);
                               offset = offset.top - offset.height/2 - gap;
                           }

                           if(offset< h) {
                               window.scrollTo(0, Math.max(1, window.pageYOffset + offset - h));
                           }
                        }, 0);
                    });

                    //禁用掉click，改成tap
                    _toolbar.root().hammer({tap: true}).on('touchstart', function(e){
                        e.preventDefault();
                    }).on('h_tap', function(e){
                            $(e.target).trigger('click');
                        });
                }
            })
        }
    })

})(Zepto, ME)