
(function ($) {
    baidu.meditor.ui.define('combox', {

        _options: {
            node:       null,
            renderFn:   null,
            height:     150,
            width:      200,
            unCount:    false,
            _isShow:    false,
            _isClicked: false
        },
        _allCombox: [],
        _inited: false,
        _needCloseAll: true,

        _create: function () {
            var me = this,
                opt = me._options,
                root = me._el = $('<div class="meditor-ui-combox"></div>').appendTo('body'),
                i = 0, j, html = '<ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.html(html + '</ul><div class="meditor-ui-combox-arrow"></div>');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                proto = me.__proto__,
                root = me.root(),
                highLightCls = 'meditor-ui-combox-highlight';

            //highlight
            root.on('touchstart', function (e) {
                $(e.target).closest('li').addClass(highLightCls);
            }).on('touchend touchcancel', function(e) {
                $(e.target).closest('li').removeClass(highLightCls);
            });

            //autohide
            root.on('tap', function (e) {
                proto._needCloseAll = false;
                me._closeOthers();
                var li = $(e.target).closest('li');
                me.trigger('itemClick', [li.index(), li.children().attr('value')]);

            });
            if(!proto._inited) {
                $(document).on('tap', function () {
                    proto._needCloseAll && me.closeAll();
                    proto._needCloseAll = true;
                });
                proto._inited = true;
            }
            //缓存查询
            var items = root.find('li'),
                children = items.children();
            me.option({
                items: items,
                children: children
            });
        },

        _fitSize: function () {
            var me = this,
                opt = me._options,
                rect = opt.node.getBoundingClientRect();
            me.root().css({
                position:   'absolute',
                top:        rect.top,
                left:       rect.left - opt.width,
                height:     opt.height,
                width:      opt.width
            });
            return me;
        },

        _closeOthers: function () {
            var me = this,
                allCombox = me._allCombox,
                item;
            while(item = allCombox[allCombox.length - 1]){
                 if(item._options.showTime > me._options.showTime) {
                     item.hide();
                     allCombox.pop();
                 } else break;
            }
        },

        closeAll: function() {
            var me = this,
                proto = me.__proto__,
                allCombox = proto._allCombox;
            allCombox.forEach(function(item) {
                item.hide();
            });
            proto._allCombox = [];
            return me;
        },

        select: function (index, _needed) {
            var me = this,
                opt = me._options,
                cls = 'selected',
                action = _needed ? 'removeClass' : 'addClass';
            if(typeof index === 'number') {
                opt.items.eq(index)[action](cls);
            } else {
                opt.children.each(function(i, item) {
                    if(item.getAttribute('value') === index) {
                        $(item).closest('li')[action](cls);
                    }
                });
            }
            return me;
        },

        unSelect: function (index) {
            var me = this;
            me.select(index, false);
            return me;
        },

        label: function (index, label) {
            return this._options.items.eq(index).html(label);
        },

        value: function (index, value) {
            return this._options.children.eq(index).attr('value', value);
        },

        show: function () {
            var me = this,
                opt = me._options;
            me._fitSize().root().show().iscroll();
            //公共索引
            me.option('showTime', Date.now());
            opt.unCount || me._allCombox.push(me);
            return me;
        },

        hide: function () {
            var me = this;
            me.root().hide();
            return me;
        },

        toggle: function () {
            var me = this;
            me._options._isShow ? me.hide() : me.show();
            return me;
        }

    });

})(Zepto);

