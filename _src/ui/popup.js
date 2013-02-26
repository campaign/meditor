

(function ($) {
    baidu.meditor.ui.define('popup', {

        _options: {
            content:        null,
            height:         150,
            width:          200,
            needIscroll:    true,
            _iscrollInited:  false
        },

        _create: function () {
            var me = this,
                opt = me._options;
            me._el = $('<div class="meditor-ui-popup"></div>').append($('<div class="meditor-ui-popup-content"></div>').html(opt.content).append('<div class="meditor-ui-popup-arrow"></div>')).appendTo('body');
        },

        _init: function () {
            var me = this;
            $(document).on('tap', function () {
                me.hide();
            });
        },

        _fitSize: function (node) {
            var me = this,
                opt = me._options,
                rect = (node.nodeType === 1 ? node : node[0]).getBoundingClientRect();
            me.root().css({
                position:   'absolute',
                top:        rect.top,
                left:       rect.left - opt.width - 10,
                height:     opt.height,
                width:      opt.width + 10
            }).children().first().css({
                height:     opt.height,
                width:      opt.width
            }).siblings().last().css({
                top:rect.height / 2 - 10
            });
            return me;
        },

        show: function (node) {
            var me = this,
                opt = me._options;
            me._fitSize(node).root().show();
            if(opt.needIscroll && !opt._iscrollInited) {
                me.root().children().first().iscroll();
                opt._iscrollInited  = true;
            }
            return me;
        },

        hide: function () {
            var me = this;
            me.root().hide();
            return me;
        }

    });

})(Zepto);

