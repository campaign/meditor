
(function ($) {
    ME.ui.define('combox', {

        _options: {
            renderFn:       null,
            height:         150,
            width:          200,
            needIscroll:    true,
            _isShow:        false,
            _iscrollInited: false
        },
        _allShowedCombox:   [],
        _addEventInited:    false,
        _needCloseAll:      true,
        _sibling:           null,

        _create: function () {
            var me = this,
                opt = me._options,
                root = me._el = $('<div class="mui-combox"></div>').appendTo('body'),
                i = 0, j, html = '<div class="mui-combox-content"><ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.html(html + '</ul></div><div class="mui-combox-arrow"><b></b></div>');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                proto = me.__proto__,
                root = me.root(),
                content = root.children().first(),
                highLightCls = 'mui-combox-highlight';
            //设置宽高
            root.css({
                height:     opt.height,
                width:      opt.width
            });
            //highlight
            content.on('touchstart', function (e) {
                $(e.target).closest('li').addClass(highLightCls);
            }).on('touchend touchcancel', function(e) {
                $(e.target).closest('li').removeClass(highLightCls);
            });

            //autohide
            content.on('tap', function (e) {
                me.closeChildren();
                proto._needCloseAll = false;
                var li = $(e.target).closest('li');
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
                opt = me._options,
                rect;
            if(!node) {
                rect = {left: opt.width + 15, top: 10, height: 30};  //如果不传入节点，可以传入一个这样的对象，用来定义组件位置，height控制箭头位置
            } else if(node[0] || node.nodeType === 1) {
                rect= (node[0] || node).getBoundingClientRect();
            } else rect = node;

            me.root().css({
                left:       rect.left - opt.width - 15,
                top:        rect.top
            }).children().last().css({top: rect.height / 2 - 16});
            return me;
        },

        closeChildren: function () {
            var me = this,
                allCombox = me._allShowedCombox,
                proto = me.__proto__,
                item;
            while(item = allCombox[allCombox.length - 1]){
                 if(item._options.stamp > me._options.stamp) {
                     item.hide();
                     proto._sibling = item;
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
                cls = 'selected',
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
            if(me === proto._sibling) {
                proto._sibling = null;
                return me;
            }
            me._options._isShow ? me.hide() : me.show(node);
            proto._needCloseAll = false;
            return me;
        }
    });

})(Zepto);

