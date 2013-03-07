
(function ($, undefined) {
    ME.ui.define('combox', {

        _options: {
            container:      '',
            title:          '',
            renderFn:       null,
            prefix:         '',
            needIscroll:    true,
            _btn:           null,
            _isShow:        false,
            _iscrollInited: false
        },

        _create: function () {
            var me = this,
                opt = me._options,
                cls = opt.prefix ? 'mui-' + opt.prefix + '-popup' : '',
                root = me._el = $('<div class="mui-combox ' + cls + '"></div>').append(opt.title ? ('<div class="mui-combox-title ' + (cls ? cls + '-title' : '') + '">' + opt.title + '</div>') : '').appendTo(opt.container),
                i = 0, j, html = '<div class="mui-combox-content ' + (cls ? cls + '-content' : '') + '"><ul>';
            while(true) {
                j = opt.renderFn(i++);
                if(!j) break;
                html += '<li>' + j + '</li>';
            }
            root.append(html + '</ul></div><div class="mui-combox-arrow ' + (cls ? cls + '-arrow' : '') + '"></div>');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                root = me.root(),
                content = root.find('.mui-combox-content'),
                cls = 'mui-' + (opt.prefix ? opt.prefix + '-' : '') + 'combox-highlight';

            //highlight
            content.on('touchstart', function (e) {
                $(e.target).closest('li').addClass(cls);
            }).on('touchend touchcancel', function(e) {
                $(e.target).closest('li').removeClass(cls);
            });

            //autohide
            content.hammer('tap', function (e) {
                var li = $(e.originalEvent.target).closest('li');
                me.trigger('select', [li.index(), li.children().attr('value'), li]);
            });
            //点击隐藏
            $('body').click(function (e) {
                var target = e.target;
                if ($.contains(root[0], target) || me._options._btn === target || $.contains(me._options._btn, target)) return;
                me.hide();
            });

            //缓存查询
            var items = root.find('li'),
                children = items.children();
            me.option({
                items:      items,
                children:   children
            });
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
                me.select(i, true);
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
        }

    }, 'popup');

})(Zepto);

