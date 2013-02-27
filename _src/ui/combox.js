
(function ($) {
    baidu.meditor.ui.define('combox', {

        _options: {
            renderFn:       null,
            height:         150,
            width:          200,
            needIscroll:    true,
            _iscrollInited: false
        },
        _allShowedCombox:   [],
        _addEventInited:    false,
        _needCloseChildren: true,

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
                content = root.children().first(),
                highLightCls = 'meditor-ui-combox-highlight';
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
                proto._needCloseChildren = false;
                me.closeChildren();
                var li = $(e.target).closest('li');
                me.trigger('itemClick', [li.index(), li.children().attr('value'), li]);
            });
            if(!proto._addEventInited) {
                $(document).on('tap', function () {
                    proto._needCloseChildren && me.closeAll();
                    proto._needCloseChildren = true;
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
                rect = {left: opt.width + 20, top: 10, height: 30};  //如果不传入节点，可以传入一个这样的对象，用来定义组件位置，height控制箭头位置
            } else if(node[0] || node.nodeType === 1) {
                rect= (node[0] || node).getBoundingClientRect();
            } else rect = node;

            me.root().css({
                left:       rect.left - opt.width - 10,
                top:        rect.top
            }).children().last().css({top: rect.height / 2 - 10});
            return me;
        },

        closeChildren: function () {
            var me = this,
                allCombox = me._allShowedCombox,
                item;
            while(item = allCombox[allCombox.length - 1]){
                 if(item._options.stamp > me._options.stamp) {
                     item.hide();
                     allCombox.pop();
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
            var me = this;
            me.root().hide();
            return me;
        }
    });

})(Zepto);

