

(function ($, undefined) {
    ME.ui.define('popup', {

        _options: {
            container:      '',
            title:          '',
            content:        null,
            prefix:         '',
            needIscroll:    false,
            _btn:           null,
            _isShow:        false,
            _iscrollInited: false
        },
        _allShowedPopup:   [],

        _create: function () {
            var me = this,
                opt = me._options,
                cls = opt.prefix ? 'mui-' +opt.prefix + '-popup' : '';
            me._el = $('<div class="mui-popup ' + cls + '"></div>').append($('<div class="mui-popup-title ' + (cls ? cls + '-title' : '') + '">' + opt.title + '</div>')).append($('<div class="mui-popup-content ' + (cls ? cls + '-content' : '') + '"></div>')
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
                width = parseInt(root.css('width')) || root[0].getBoundingClientRect().width,
                node = me._options._btn = node[0] || node,
                rect = node.getBoundingClientRect(),
                top = rect.height + 14,
                popLeft = rect.left - (width - rect.width)/ 2,
                arrLeft = width/2 - 10;
            if(popLeft < 0) {
                popLeft = 0;
                arrLeft = rect.left + rect.width/2 - 20;
            } else if (popLeft + width > window.innerWidth) {
                popLeft -= popLeft + width - window.innerWidth + 18;
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
        closeAll: function() {
            var me = this,
                proto = me.__proto__,
                allCombox = proto._allShowedPopup;
            $.each(allCombox, function(i, item) {
                item.hide();
            });
            proto._allShowedPopup = [];
            return me;
        },

        show: function (node) {
            var me = this,
                opt = me._options;
            me.closeAll();
            me.root().show();
            me._fitSize(node);
            opt._isShow = true;
            if(opt.needIscroll && !opt._iscrollInited) {
                me.root().children().first().next().iscroll();
                opt._iscrollInited  = true;
            }
            //公共索引
            me.option('stamp', Date.now());
            me._allShowedPopup.push(me);
            me.trigger('show');
            return me;
        },


        hide: function () {
            var me = this,
                opt = me._options;
            me.root().hide();
            opt._isShow = false;
            me.trigger('hide');
            return me;
        },

        toggle: function (node) {
            return this._options._isShow ? this.hide() : this.show(node);
        }

    });

})(Zepto);

