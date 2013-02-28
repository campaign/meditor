
(function ($, undefined) {
    ME.ui.define('combox', {

        _options: {
            renderFn:       null,
            prefix:         '',
            needIscroll:    true,
            _isShow:        false,
            _iscrollInited: false,
            _lastClicked:     null
        },
        _allShowedCombox:   [],
        _addEventInited:    false,
        _needCloseAll:      true,

        _create: function () {
            var me = this,
                opt = me._options,
                cls = opt.prefix ? opt.prefix + '-mui-popup' : '',
                root = me._el = $('<div class="mui-combox ' + cls + '"></div>').appendTo('body'),
                i = 0, j, html = '<div class="mui-combox-content ' + (cls ? cls + '-content' : '') + '"><ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.html(html + '</ul></div><div class="mui-combox-arrow ' + (cls ? cls + '-arrow' : '') + '"><b></b></div>');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                proto = me.__proto__,
                root = me.root(),
                content = root.children().first(),
                cls = (opt.prefix ? opt.prefix + '-' : '') + 'mui-combox-highlight';

            //highlight
            content.on('touchstart', function (e) {
                $(e.target).closest('li').addClass(cls);
            }).on('touchend touchcancel', function(e) {
                $(e.target).closest('li').removeClass(cls);
            });

            //autohide
            content.on('tap', function (e) {
                var li = opt._lastClick =  $(e.target).closest('li');
                me.closeChildren(li);
                proto._needCloseAll = false;
                me.trigger('itemClick', [li.index(), li.children().attr('value'), li]);
            });
            if(!proto._addEventInited) {
                $(document).on('tap', function () {
                    proto._needCloseAll && me.closeAll();
                    proto._needCloseAll = true;
                });
                proto._addEventInited = true;
            }

            //缓存查询
            var items = root.find('li'),
                children = items.children();
            me.option({
                items:      items,
                children:   children
            });
        },

        _fitSize: function (node) {
            var me = this,
                width = parseInt(me.root().css('width')),
                node = me._options._lastClicked = node[0] || node,
                rect= node.getBoundingClientRect();

            me.root().css({
                left:       rect.left - width - 15,
                top:        rect.top
            }).children().last().css({top: rect.height / 2 - 16});
            return me;
        },

        closeChildren: function (li) {
            var me = this,
                allCombox = me._allShowedCombox,
                item;
            while(item = allCombox[allCombox.length - 1]){
                 if(item._options.stamp > me._options.stamp) {
                     if(li && item._options._lastClicked === li[0]) break;
                     item.hide();
                 } else break;
            }
            return me;
        },

        closeAll: function() {
            var me = this,
                proto = me.__proto__,
                allCombox = proto._allShowedCombox;
            allCombox.forEach(function(item) {
                item.hide();
            });
            proto._allShowedCombox = [];
            return me;
        },

        select: function (index, _remove) {
            var me = this,
                opt = me._options,
                cls = (opt.prefix ? opt.prefix + '-' : '') + 'mui-combox-selected',
                action = _remove ? 'removeClass' : 'addClass';
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
            return this.select(index, true);
        },

        label: function (index, label) {
            var _lable = this._options.children.eq(index).html(label);
            return label === undefined ? _lable : this;
        },

        value: function (index, value) {
            var _value = this._options.children.eq(index).attr('value', value);
            return value === undefined ? _value : this;
        },

        zIndex: function (index) {
            var _index = this.root().css('z-index', index);
            return index === undefined ? _index : this;
        },

        show: function (node) {
            var me = this,
                opt = me._options;
            me._fitSize(node).root().show();
            opt._isShow = true;
            if(opt.needIscroll && !opt._iscrollInited) {
                me.root().children().first().iscroll();
                opt._iscrollInited  = true;
            }
            //公共索引
            me.option('stamp', Date.now());
            me._allShowedCombox.push(me);
            return me;
        },

        hide: function () {
            var me = this,
                opt = me._options,
                allCombox = me.__proto__._allShowedCombox;
            me.closeChildren();
            me.root().hide();
            if(me === allCombox[allCombox.length - 1]) {
                allCombox.pop();
            }
            opt._isShow = false;
            return me;
        },

        toggle: function (node) {
            var me = this,
                proto = me.__proto__;
            me._options._isShow ? me.hide() : me.show(node);
            proto._needCloseAll = false;
            return me;
        }
    });

})(Zepto);

