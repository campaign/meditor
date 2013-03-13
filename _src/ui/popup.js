

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
                cls = opt.prefix ? 'mui-' + opt.prefix + '-popup' : '';
            me._el = $('<div class="mui-popup ' + cls + '"></div>').append(opt.title ? ('<div class="mui-popup-title ' + (cls ? cls + '-title' : '') + '">' + opt.title + '</div>') : '').append($('<div class="mui-popup-content ' + (cls ? cls + '-content' : '') + '"></div>')
                .html(opt.content)).append('<div class="mui-popup-arrow ' + (cls ? cls + '-arrow' : '') + '"></div>').appendTo(opt.container);
        },

        _init: function () {
            var me = this,
                root = me.root();
            //点击隐藏
            $(document).click(function (e) {
                debugger;
                if(me._options._isShow) {
                    var target = e.target;
                    if ($.contains(root[0], target) || me._options._btn === target || $.contains(me._options._btn, target)) return;
                    me.hide();
                }
            });
            $(window).on('ortchange', function() {
                me._ortChange.call(me);
            });
        },

        _ortChange: function() {
            var me = this,
                root = me.root();
            if(me._options._isShow) {
                root.hide();
                $.later(function () {
                    root.show();
                    me._fitSize.call(me, me._options._btn);
                }, 20);
            }
            return me;
        },

        _fitSize: function (node) {
            var me = this,
                root = me.root(),
                width = (parseInt(root.css('width')) || root[0].getBoundingClientRect().width) + 8,
                node = me._options._btn = node[0] || node,
                rect = node.getBoundingClientRect(),
                top = rect.height + 18,
                popLeft = rect.left - (width - rect.width)/ 2,
                arrLeft = width/2 - 18;
            if(popLeft < 0) {
                popLeft = 0;
                arrLeft = rect.left + rect.width/2 - 18;
            } else if (popLeft + width > window.innerWidth) {
                popLeft -= popLeft + width - window.innerWidth + 8;
                arrLeft = rect.left - popLeft + rect.width/2 - 18;
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
                allPopup = me._allShowedPopup,
                item;
            while(item = allPopup[0]) {
                item.hide();
                allPopup.shift();
            }
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
                me.root().children().last().prev().iscroll();
                opt._iscrollInited  = true;
            }
            //公共索引
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

