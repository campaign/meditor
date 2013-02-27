/*(function (){
    var utils = baidu.editor.utils,
        uiUtils = baidu.editor.ui.uiUtils,
        UIBase = baidu.editor.ui.UIBase,
        Toolbar = baidu.editor.ui.Toolbar = function (options){
            this.initOptions(options);
            this.initToolbar();
        };
    Toolbar.prototype = {
        items: null,
        initToolbar: function (){
            this.items = this.items || [];
            this.initUIBase();
        },
        add: function (item){
            this.items.push(item);
        },
        getHtmlTpl: function (){
            var buff = [];
            for (var i=0; i<this.items.length; i++) {
                buff[i] = this.items[i].renderHtml();
            }
            return '<div id="##" class="edui-toolbar %%" onselectstart="return false;" onmousedown="return $$._onMouseDown(event, this);">' +
                buff.join('') +
                '</div>'
        },
        postRender: function (){
            var box = this.getDom();
            for (var i=0; i<this.items.length; i++) {
                this.items[i].postRender();
            }
            uiUtils.makeUnselectable(box);
        },
        _onMouseDown: function (){
            return false;
        }
    };
    utils.inherits(Toolbar, UIBase);

})();*/


(function ($, ui) {
    ui.define('scrollbox', {
        _options: {
            showCount: 4,
            items: []
        },
        _create: function () {
            var me = this,
                opts = me._options, $scroller;

            me.root($('<div class="mui-scrollbox"></div>').append($scroller = $('<div class="mui-scrollBox-scroller"></div>'))),
            $.each(opts.items, function (key, item) {
                me._isInstance(item) && item.render($scroller);
            });
            me._$scroller = $scroller;

            return me;
        },
        _getSize: function () {
            var me = this,
                widths = [],
                opts = me._options,
                height = 0, width;

            $.each(opts.items, function (i, item) {
                var $item = item.root();
                widths.push($item.width());
                i < opts.showCount && (height += $item.height() + parseInt($item.css('margin-top')) + parseInt($item.css('margin-bottom')));
            });
            return [Math.max.apply(Math, widths), height];
        },
        _enableScroll: function () {
            var me = this,
                size = me._getSize();

            me.iscroll = me.root().css({
                width: size[0],
                height: size[1]
            }).iscroll().iscroll('_refresh');
            return me;
        },
        addItem: function (item) {
            var me = this;
            me._isInstance(item) && item.render(me.root()).iscroll._refresh();
            return me;
        },
        _isInstance: function (instance) {
            return instance instanceof ui.Button || instance instanceof ui.Group;
        },
        render: function (container) {
            var me = this;
            me.root().appendTo(container || document.body);
            return me._enableScroll();
        }
    });

    ui.define('group', {
        _options: {
            name: '',
            items: []
        },
        _init: function () {
            var me = this;

            me.$super('_init');
            me.root().on('buttonClick', $.proxy(me._showPopup, me));
        },

        _showPopup: function () {
            var me = this,
                items = this._options.items,
                $subBarWrap = $('<div class="mui-group-wrap"></div> ');

            me._$subBarWrap = $subBarWrap;
            $.each(items, function (i, item) {
                me.addItem(item);
            });
            me._subBar = ui.Popup({
                content: $subBarWrap
            });
        },
        _isInstance: function (instance) {
            return instance instanceof ui.Button || instance instanceof ui.Group || instance instanceof ui.ScrollBox;
        },
        addItem: function (item) {
            this._isInstance(item) && item.render(this._$subBarWrap);
            return this;
        }
    }, ui.button);

    ui.define('toolbar', {
        _options: {
            mode: 'swipe',    //'swipe' || 'static',
            items: [],
            useFix: false
        },
        _create: function () {
            var me = this,
                opts = me._options;

            me.root($('<div class="mui-toolbar"></div>').append(me._$boxWrap = $('<div class="mui-toolbar-wrap"></div>').append(me._$toolBox = $('<div class="mui-toolbar-toolBox"></div>'))));
            opts.mode == 'swipe' && me._$boxWrap.prepend(me._$mask = $('<div class="mui-toolbar-mask"><span class="mui-toolbar-showArrow"></span></div>'));
            $.each(opts.items, function (key, item) {
                me.addItem(item);
            });
        },
        _init: function () {
            var me = this;
            me._options.mode == 'swipe' ? me.root().on('swipe', $.proxy(me._eventHandler, me)) : me.show();
            return this;
        },
        _eventHandler: function (e) {
            var me = this;
            switch (e.type) {
                case 'swipe':
                    console.log(e);
                    e.direction == 'right' ? me.hide(function () {
                        me._$boxWrap.css('-webkit-transform', 'translateX(0px)');
                    }) : me.show(function () {
                        me._$boxWrap.css('-webkit-transform', 'translateX(-' + me._$toolBox.width() + 'px)');
                    })
                    break;
            }
        },
        _isInstance: function (instance) {
            return instance instanceof ui.Button || instance instanceof ui.Group || instance instanceof ui.ScrollBox;
        },
        _setVisible: function (fn, isShow) {
            $.isFunction(fn) ? fn.call(this) : this.root()[isShow ? 'show' : 'hide']();
            if ($.isFunction(fn)) {
                fn.call(this);
            } else {
                this._$mask[isShow ? 'hide' : 'show']();
                this._$toolBox[isShow ? 'hide' : 'show']();
            }
            return this;
        },
        show: function (fn) {
            return this._setVisible(fn, true);
        },
        hide: function (fn) {
            return this._setVisible(fn, false);
        },
        addItem: function (item) {
            this._isInstance(item) && item.render(this._$toolBox);
            return this;
        }
    });
})(Zepto, baidu.meditor.ui);
