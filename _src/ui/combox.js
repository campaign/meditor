
(function ($) {
    baidu.meditor.ui.define('combox', {

        _options: {
            node:       null,
            renderFn:   null,
            height:     300,
            width:      200,
            zIndex:     0,
            unCount:    false,
            _isShow:    false,
            _isClicked: false
        },

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
                opt._isClicked = true;
                var li = $(e.target).closest('li');
                me.trigger('itemClick', [li.index(), li.children().attr('value')]);
            });
            $(document).on('tap', function () {
                if (!opt._isClicked) {
                    me.hide();
                }
                opt._isClicked = false;
            });

            //公共索引
            opt.unCount || (me.__proto__._allCombox = me.__proto__._allCombox || []).push(me);
            //console.log(this.__proto__);

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
                allCombox = me.__proto__._allCombox;
            allCombox.forEach(function() {
                me._options.zIndex > this._options.zindex || this.hide();
            });
        },

        closeAll: function() {
            var me = this,
                allCombox = me.__proto__._allCombox;
            allCombox.forEach(function() {
                this.hide();
            });
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
            var me = this;
            me._fitSize().root().show().iscroll();
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

