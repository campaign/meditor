

(function ($, undefined) {
    ME.ui.define('popup', {

        _options: {
            content:        null,
            prefix:         '',
            needIscroll:    false,
            _btn:           null,
            _isShow:        false,
            _iscrollInited: false
        },

        _create: function () {
            var me = this,
                opt = me._options,
                cls = opt.prefix ? 'mui-' +opt.prefix + '-popup' : '';
            me._el = $('<div class="mui-popup ' + cls + '"></div>').append($('<div class="mui-popup-content ' + (cls ? cls + '-content' : '') + '"></div>')
                .html(opt.content).append('<div class="mui-popup-arrow ' + (cls ? cls + '-arrow' : '') + '"><b></b></div>')).appendTo('body');
        },

        _init: function () {
            var me = this,
                root = me.root();
            //点击隐藏
            $(document).on('tap', function (e) {
                if ($.contains(root[0], e.target) || me._options._btn === e.target || $.contains(me._options._btn, e.target)) return;
                me.hide();
            });
        },

        _fitSize: function (node) {
            var me = this,
                root = me.root(),
                width = parseInt(root.css('width')) || root[0].getBoundingClientRect().width,
                node = me._options._btn = node[0] || node,
                rect = node.getBoundingClientRect();

            root.css({
                top:        rect.top,
                left:       rect.left - width - 15
            }).children().last().css({
                top:        rect.height / 2 - 16
            });
            return me;
        },

        zIndex: function (index) {
            var _index = this.root().css('z-index', index);
            return index === undefined ? _index : this;
        },

        show: function (node) {
            var me = this,
                opt = me._options;
            me.root().show();
            me._fitSize(node);
            opt._isShow = true;
            if(opt.needIscroll && !opt._iscrollInited) {
                me.root().children().first().iscroll();
                opt._iscrollInited  = true;
            }
            return me;
        },

        hide: function () {
            var me = this,
                opt = me._options;
            me.root().hide();
            opt._isShow = false;
            return me;
        },
        toggle: function (node) {
            return this._options._isShow ? this.hide() : this.show(node);
        }

    });

})(Zepto);

