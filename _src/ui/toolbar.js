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
    ui.define('group', {
        _options: {
            items: []
        },
        _init: function () {
            this.$super('_init');
            this.on('click', this._showPopup);
        },
        _showPopup: function () {
            (this._subBar || this._createPopup()).toggle(this.root());
        },
        _createPopup: function () {
            var me = this,
                opts = this._options,
                $subBarWrap = $('<div class="mui-group-wrap"></div> ');

            me._$subBarWrap = $subBarWrap;
            $.each(opts.items, function (i, item) {
                me.addItem(item);
            });
            return me._subBar = ui.popup({
                content: $subBarWrap,
                width: 'auto',
                prefix: opts.name || 'group'
            });
        },
        _isInstance: function (instance) {
            return instance instanceof ui.button || instance instanceof ui.group || instance instanceof ui.scrollbox;
        },
        addItem: function (item) {
            this._isInstance(item) && item.render(this._$subBarWrap);
            return this;
        }
    }, ui.button);

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
        _getHeight: function () {
            var me = this,
                opts = me._options,
                height = 0;

            $.each(opts.items.slice(0, Math.min(opts.showCount, opts.items.length)), function (i, item) {
                var $item = item.root();
                height += ($item.height() + parseInt($item.css('margin-top')) + parseInt($item.css('margin-bottom')))/(i == opts.showCount - 1 ? 2 : 1);
            });
            return height;
        },
        _initIscroll: function () {
            this.iscroll = this.root().css('height', this._getHeight()).iscroll().iscroll('_refresh');
            return this;
        },
        addItem: function (item) {
            var me = this;
            me._isInstance(item) && item.render(me._$scroller).iscroll().iscroll('_refresh');
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
            mode: 'swipe',    //'swipe' || 'static',
            items: [],
            useFix: false
        },
        _isShow: false,
        _initDone: false,
        _isAnim: false,
        _win: window,
        _body: document.body,

        _create: function () {
            var me = this,
                opts = me._options, $el;

            me.root($el = $('<div class="mui-toolbar"></div>').append(me._$toolBox = $('<div class="mui-toolbar-toolBox"></div>')));
            opts.mode == 'swipe' && $el.prepend(me._$arrow = $('<span class="mui-toolbar-showArrow"></span>'));
        },
        _init: function () {
            var me = this;
            me._options.mode == 'swipe' ? me.root().hammer('swipe', $.proxy(me._eventHandler, me)) : me.show();
            $(document).on('scrollStop touchmove', $.proxy(me._eventHandler, me));
            return this;
        },
        _initRender: function (container) {
            var me = this,
                opts = me._options,
                $el = me.root()

            $.each(opts.items, function (key, item) {       //渲染子元素，可能有些子元素需要取高度等属性
                me.addItem(item);
            });
            if (opts.mode == 'swipe' && !me._initDone) {
                me._setPosition('hide');
                me._initDone = true;
                me._$arrow && me._$arrow.css('top', ($el.height() - me._$arrow.height()) / 2);
            }
            $el.css('top', ($(container).height() - $el.height()) / 2);
            return me;
        },
        _eventHandler: function (e) {
            var me = this,
                target = e.originalEvent ? e.originalEvent.target: e.target,
                el = me.root().get(0),
                isRoot = $.contains(el, target) || el == target,
                type = e.type == 'swipe' ? e.direction : e.type;

            switch (type) {
                case 'right':
                    isRoot && me.hide(function () {
                        me.root().removeClass('mui-toolbar-shadow');
                        me._setPosition('hide');
                    });
                    break;
                case 'left':
                    isRoot && me.show(function () {
                        if (!me._isAnim) {
                            me._animFn = function () {
                                me.root()[me._isShow ? 'addClass': 'removeClass']('mui-toolbar-shadow');   //添加外层阴影边框
                            };
                            me._$toolBox.on('webkitTransitionEnd', me._animFn).addClass('mui-toolbar-anim');
                            me._isAnim = true;
                        }
                        me._setPosition('show');
                    })
                    break;
                case 'touchmove':
                    //!isRoot && me.hide();
                    break;
                case 'scrollStop':
                    !isRoot && me.show().setFix();
                    break;
                case 'default':
                    break;
            }
        },
        _setPosition: function (type) {
            this._$toolBox.css('-webkit-transform', 'translateX(' + (type == 'show' ? '0' : this._$toolBox.width()) + 'px)');
        },
        _isInstance: function (instance) {
            return instance instanceof ui.button || instance instanceof ui.group || instance instanceof ui.scrollbox;
        },
        _setVisible: function (fn, isShow) {
            $.isFunction(fn) ? fn.call(this) : this._$toolBox[isShow ? 'show' : 'hide']();
            this._isShow = isShow;
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
        },
        render: function (container) {
            this.$super('render', this.container = container || this._body);
            this._cOffset = $(this.container).offset();
            return this._initRender(container);
        },
        zIndex: function (zindex) {
            return $.isUndefined(zindex) ? this.root().css('z-index') : (this.root().css('z-index', zindex), this);
        },
        setFix: function (pos, offset) {
            var me = this,
                $el = me.root(), parentTop;

            if (pos) {
                $el.css('top', pos.y );
            } else {
                pos = offset || {x:10,y:10};
                parentTop = ($el.offsetParent().get(0) == $(me.container).get(0) ? me._cOffset.top : 0);
                $el.css('top', Math.max($(me._win).scrollTop() - parentTop, 0) + pos.y);
            }
            return me;
        }
    });
})(Zepto, ME.ui);
