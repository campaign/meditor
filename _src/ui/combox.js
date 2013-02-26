
(function ($) {
    baidu.meditor.ui.define('combox', {

        _options: {
            renderFn:       null,
            height:         150,
            width:          200,
            _iscrollInited:  false
        },
        _allCombox:         [],
        _inited:            false,
        _needCloseAll:      true,

        _create: function () {
            var me = this,
                opt = me._options,
                root = me._el = $('<div class="meditor-ui-combox"></div>').appendTo('body'),
                i = 0, j, html = '<div class="meditor-ui-combox-content"><ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.html(html + '</ul></div><div class="meditor-ui-combox-arrow"></div>');
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
                me.trigger('itemClick', [li.index(), li.children().attr('value'), li]);

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

        _closeOthers: function () {
            var me = this,
                allCombox = me._allCombox,
                item;
            while(item = allCombox[allCombox.length - 1]){
                 if(item._options.stamp > me._options.stamp) {
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

        show: function (node) {
            var me = this,
                opt = me._options;
            me._fitSize(node).root().show();
            if(!opt._iscrollInited) {
                me.root().children().first().iscroll();
                opt._iscrollInited  = true;
            }
            //公共索引
            me.option('stamp', Date.now());
            me._allCombox.push(me);
            return me;
        },

        hide: function () {
            var me = this;
            me.root().hide();
            return me;
        }

    });

})(Zepto);

