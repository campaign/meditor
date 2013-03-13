(function($, ui){
    var _id = 1,
        uid = function(){
            return _id ++;
        },
        endEvent = $.fx.animationEnd + '.tabs';

    ui.define('tabs', {
        _options: {
            watchRender: true,
            active: 0,
            swipe: true,
            items:null//[{key: content}]
        },

        _create: function(){
            var opt = this._options,
                id, el, nav, content, active, actClass, index = 0,
                items = this._items = [];

            this.root(el = $('<div class="mui-tabs"></div>'));
            content = this._content = $('<div class="mui-viewport mui-tabs-content"></div>').appendTo(el);
            nav = this._nav = $('<ul class="mui-tabs-nav"></ul>').appendTo(el);
            active = opt.active = Math.max(0, Math.min(items.length-1, opt.active));
            opt.items && $.each(opt.items, function(key, val){
                id = 'tabs_'+uid();
                actClass = index==active?' mui-state-active':'';
                nav.append('<li class="'+actClass+'"><a href="javascript:void(0);">'+key+'</a></li>');
                content.append($('<div id="'+id+'" class="mui-panel mui-tabs-panel slide'+actClass+'"></div>').append(val));
                items[index++] = {
                    id: id,
                    title: key,
                    content: val
                }
            });
            $.isArray(opt.items) && el.addClass('mui-tabs-notitle');
            this._titles = this._nav.children();
            this._panels = this._content.children();
        },

        _init: function(){
            var me = this,
                eventHandler = $.proxy(me._eventHandler, me),
                opt = me._options;
            me._nav.on('click', eventHandler);
            me._el.on('widgetrender', eventHandler);
            opt.swipe && me._el.hammer({
                swipe: true
            }).on('h_swipeleft h_swiperight', function(e){
                var index;
                switch(e.type){
                    case 'h_swipeleft':
                        index = opt.active + 1;
                        break;
                    case 'h_swiperight':
                        index = opt.active - 1;
                        break;
                }
                index !== undefined && me.switchTo(index);
            });
            me._titles.highlight('mui-state-hover');
            $(window).on('ortchange', eventHandler);
        },

        _eventHandler: function(e){
            var match;
            switch(e.type) {
                case 'ortchange':
                case 'widgetrender':
                    return this.refresh();
                default:
                    if((match = $(e.target).closest('li', this._nav.get(0))) && match.length) {
                        e.preventDefault();
                        this.switchTo(match.index());
                    }
            }
        },

        switchTo: function(index) {
            var me = this,
                opt = me._options,
                items = this._items,
                eventData,
                to,
                from,
                reverse;
            if( !this._buzy &&
                opt.active != (index = Math.max(0, Math.min(items.length-1, index)))) {
                to = $.extend({}, items[index]);//copy it.
                to.div = me._getPanel(index);
                to.index = index;

                from = $.extend({}, items[opt.active]);//copy it.
                from.div = me._getPanel();
                from.index = opt.active;

                eventData = $.Event('beforeActivate');
                me.trigger(eventData, [to, from]);
                if(eventData.defaultPrevented) return me;

                this._panels.removeClass('mui-state-active')
                    .eq(index).addClass('mui-state-active');
                this._titles.removeClass('mui-state-active')
                    .eq(index).addClass('mui-state-active');

                this._buzy = true;
                reverse = index>opt.active?'':' reverse';
                this._content.addClass('mui-viewport-transitioning');
                from.div.addClass('out'+reverse);
                to.div.addClass('in'+reverse).on(endEvent, function(e){
                    if (e.target != e.currentTarget) return //如果是冒泡上来的，则不操作
                    to.div.off(endEvent, arguments.callee);//解除绑定
                    me._buzy = false;
                    from.div.removeClass('out reverse');
                    to.div.removeClass('in reverse');
                    me._content.removeClass('mui-viewport-transitioning');
                    me._fitToContent(to.div);
                    me.trigger('animateComplete', [to, from]);
                });
                opt.active = index;
                me.trigger('activate', [to, from]);
            }
            return me;
        },

        _getPanel: function(index){
            return this._panels.eq($.isUndefined(index)?this._options.active:index);
        },

        _fitToContent: function(div) {
            var $content = this._content;
            this._plus === undefined && (
                this._plus = parseFloat($content.css('border-top-width')) +
                    parseFloat($content.css('border-bottom-width'))
            );
            $content.height( div.height() + this._plus);
            return this;
        },

        refresh: function(){
            return this._fitToContent(this._getPanel());
        },

        destroy:function () {
            var eventHandler = this._eventHandler, idx;

            this._nav.off('tap', eventHandler);
            this._titles.highlight();
            return this.$super('destroy');
        }

    });
})(Zepto, ME.ui);