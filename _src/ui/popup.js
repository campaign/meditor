

(function ($, undefined) {
    ME.ui.define('popup', {

        _options: {
            container:      '',
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
                .html(opt.content)).append('<div class="mui-popup-arrow ' + (cls ? cls + '-arrow' : '') + '"></div>').appendTo(opt.container);
        },

        _init: function () {
            var me = this,
                root = me.root();
            //点击隐藏
            $('body').hammer('tap', function (e) {
                var target = e.originalEvent.target;
                if ($.contains(root[0], target) || me._options._btn === target || $.contains(me._options._btn, target)) return;
                me.hide();
            });
        },

        _fitSize: function (node) {
            var me = this,
                root = me.root(),
                width = (parseInt(root.css('width')) || root[0].getBoundingClientRect().width) + 2 * parseInt(root.css('border-width')),
                node = me._options._btn = node[0] || node,
                rect = node.getBoundingClientRect(),
                top = rect.height + 14,
                popLeft = rect.left - (width - rect.width)/ 2,
                arrLeft = width/2 - 20;
            if(popLeft < 0) {
                popLeft = 0;
                arrLeft = rect.left + rect.width/2 - 20;
            } else if (popLeft + width > window.innerWidth) {
                popLeft -= popLeft + width - window.innerWidth;
                arrLeft = rect.left - popLeft + rect.width/2 - 20;
            }
            root.css({
                top:        top,
                left:       popLeft
            }).children().last().css({
                left:       arrLeft
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

