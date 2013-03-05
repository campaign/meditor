(function ($, ui) {
    ui.define('group', {
        _options: {
            name: 'group',
            items: []
        },
        _init: function () {
            var me = this,
                opts = me._options;

            me.root('<div class="mui-group mui-group-' + opts.name + '"></div>');
            $.each(opts.items, function (i, item) {
                me.addItem(item);
            });
            return this;
        },
        _isInstance: function (instance) {
            return instance instanceof ui.button || instance instanceof ui.group || instance instanceof ui.scrollbox;
        },
        addItem: function (item) {
            this._isInstance(item) && item.render(this.root());
            return this;
        }
    });

    ui.define('scrollbox', {
        _options: {
            showCount: 4,
            items: []
        },
        _create: function () {
            var me = this,
                opts = me._options, $scroller;

            me.root($('<div class="mui-scrollbox"></div>').append($scroller = $('<div class="mui-scrollBox-scroller"></div>')));
            $.each(opts.items, function (key, item) {
                me._isInstance(item) && item.render($scroller);
            });
            me._$scroller = $scroller;
            return me;
        },
        _init: function () {
            $(window).on('ortchange', $.proxy(this._eventHandler, this));
        },
        _eventHandler: function () {
            var me = this;
            $.later(function () {
                me.iScroll.iScroll('refresh');
            }, 100);
        },
        _getWidth: function () {
            var me = this,
                opts = me._options,
                width = 0;

            $.each(opts.items.slice(0, Math.min(opts.showCount, opts.items.length)), function (i, item) {
                var $item = item.root();
                width += ($item.width() + parseInt($item.css('margin-left')) + parseInt($item.css('margin-right')))/(i == opts.showCount - 1 ? 2 : 1);
            });
            return width;
        },
        _initIscroll: function () {
            var me = this;
            me.iScroll = me.root().css('width', me._getWidth()).iScroll({
                vScroll: false
            });
            $.later(function () {
                me.iScroll.iScroll('refresh');
            }, 100);
            return me;
        },
        addItem: function (item) {
            var me = this;
            if (me._isInstance(item)) {
                item.render(me._$scroller);
                me.iScroll.iScroll('refresh');
            }
            return me;
        },
        _isInstance: function (instance) {
            return instance instanceof ui.button || instance instanceof ui.group;
        },
        render: function (container) {
            this.$super('render', container);
            return this._initIscroll();
        }
    });

    ui.define('toolbar', {
        _options: {
            closeBtn: true,    //'swipe' || 'static',
            items: []
        },
        _isShow: true,
        _initDone: false,
        _isAnim: false,
        _win: window,

        _create: function () {
            var me = this,
                opts = me._options;

            me.root($('<div class="mui-toolbar"></div>').append(me._$boxWrap = $('<div class="mui-toolbar-boxwrap"></div>').append(me._$toolBox = $('<div class="mui-toolbar-toolBox"></div>'))));
            opts.closeBtn && (me._$closeBtn = ui.button({
                name: 'collapse',
                click: function () {
                    me.toggle();
                }
            }));
            return this;
        },
        _init: function () {
            var me = this;
            me._winH = me._win.innerHeight;

            $(document).on('scrollStop', $.proxy(me._eventHandler, me));
            $(me._win).on('ortchange', $.proxy(me._eventHandler, me));
            return this;
        },
        _initRender: function () {
            var me = this,
                items = me._options.items;

            $.each(items, function (i,item) {
                me.addItem(item);
            });
            me._$closeBtn.render(me._$boxWrap);
            return me.setFix();
        },
        _eventHandler: function (e) {
            var me = this,
                $el = me.root(), width;

            switch (e.type) {
                case 'scrollStop':
                    me.setFix();
                    break;
                case 'ortchange':
                    if (me._isShow) {
                        $el.width('100%');     //覆盖设置的宽度
                    } else {
                        $.later(function () {
                            width = $el.width();
                            me._toolbarW = width < 700 ? me._win.innerWidth : width;
                        }, 100);
                    }
                    me.setFix();
                    break;
                case 'webkitTransitionEnd':
                    !me._isShow && me._$toolBox.hide();
                    break;
                case 'default':
                    break;
            }
        },
        _isInstance: function (instance) {
            return instance instanceof ui.button || instance instanceof ui.group || instance instanceof ui.scrollbox;
        },
        _setVisible: function (fn, isShow) {
            $.isFunction(fn) ? fn.call(this) : this.root()[isShow ? 'show' : 'hide']();
            this._isShow = isShow;
            return this;
        },
        show: function (fn) {
            return this._setVisible(fn, true);
        },
        hide: function (fn) {
            return this._setVisible(fn, false);
        },
        toggle: function () {
            var me = this,
                $el = me.root(), $closeBtn = me._$closeBtn.root();
            me._isShow ? me.hide(function () {
                me._toolbarW = $el.width();
                me._$toolBox.css('visibility', 'hidden');
                $closeBtn.addClass('mui-button-expand');
                $el.on('webkitTransitionEnd', $.proxy(me._eventHandler, me)).width($closeBtn.width() + parseInt($closeBtn.css('margin-left')) + parseInt($closeBtn.css('margin-right')) + 10);
            }) : me.show(function () {
                    $closeBtn.removeClass('mui-button-expand');
                    $el.width(me._toolbarW);
                    me._$toolBox.css('visibility', 'visible').show();
                }
            );
            return this;
        },
        addItem: function (item) {
            this._isInstance(item) && item.render(this._$toolBox);
            return this;
        },
        render: function (container) {
            this.$super('render', container || document.body);
            return this._initRender();
        },
        zIndex: function (zindex) {
            return $.isUndefined(zindex) ? this.root().css('z-index') : (this.root().css('z-index', zindex), this);
        },
        setFix: function (pos, offset) {
            var me = this,
                $el = me.root();

            if (pos) {
                $el.css('top', pos.y );
            } else {
                pos = offset || {x:0,y:0};
                $el.css('top', $(me._win).scrollTop() + pos.y);
            }
            return me;
        }
    });
})(Zepto, ME.ui);
