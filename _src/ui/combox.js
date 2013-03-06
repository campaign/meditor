
(function ($, undefined) {
    ME.ui.define('combox', {

        _options: {
            container:      '',
            renderFn:       null,
            prefix:         '',
            needIscroll:    true,
            _isShow:        false,
            _iscrollInited: false,
            _lastClicked:   null
        },
        _allShowedCombox:   [],
        _addEventInited:    false,
        _needCloseAll:      true,

        _create: function () {
            var me = this,
                opt = me._options,
                cls = opt.prefix ? 'mui-' + opt.prefix + '-popup' : '',
                root = me._el = $('<div class="mui-combox ' + cls + '"></div>').appendTo(opt.container),
                i = 0, j, html = '<div class="mui-combox-content ' + (cls ? cls + '-content' : '') + '"><ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.html(html + '</ul></div><div class="mui-combox-arrow ' + (cls ? cls + '-arrow' : '') + '"></div>');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                proto = me.__proto__,
                root = me.root(),
                content = root.children().first(),
                cls = 'mui-' + (opt.prefix ? opt.prefix + '-' : '') + 'combox-highlight';

            //highlight
            content.on('touchstart', function (e) {
                $(e.target).closest('li').addClass(cls);
            }).on('touchend touchcancel', function(e) {
                $(e.target).closest('li').removeClass(cls);
            });

            //autohide
            content.hammer('tap', function (e) {
                var li = opt._lastClick =  $(e.originalEvent.target).closest('li');
                me.closeChildren(li);
                proto._needCloseAll = false;
                me.trigger('click', [li.index(), li.children().attr('value'), li]);
            });
            if(!proto._addEventInited) {
                $('body').hammer('tap', function () {
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
                root = me.root(),
                width = (parseInt(root.css('width')) || root[0].getBoundingClientRect().width) + 2 * parseInt(root.css('border-width')),
                node = me._options._btn = node[0] || node,
                rect = node.getBoundingClientRect(),
                top = rect.height + 10,
                popLeft = rect.left - (width - rect.width)/2,
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
                cls = 'mui-' + (opt.prefix ? opt.prefix + '-' : '') + 'combox-selected',
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

        singleSelect: function (index) {
            var me = this,
                opt = me._options;
            for(var i = 0, l = opt.items.length; i < l; i++) {
                me.unSelect(i);
            }
            me.select(index);
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
            me.root().show();
            me._fitSize(node);
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

