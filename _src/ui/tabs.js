(function($, ui){
    var _id = 1,
        uid = function(){
            return _id ++;
        },
        endEvent = $.fx.animationEnd + '.tabs',

        durationThreshold = 1000, // 时间大于1s就不算。
        horizontalDistanceThreshold = 30, // x方向必须大于30
        verticalDistanceThreshold = 70, // y方向上只要大于70就不算
        scrollSupressionThreshold = 30, //如果x方向移动大于这个直就禁掉滚动
        tabs = [],
        eventBinded = false,
        isFromTabs = function (target) {
            for (var i = tabs.length; i--;) {
                if ($.contains(tabs[i], target)) return true;
            }
            return false;
        }

    function tabsSwipeEvents() {
        $(document).on('touchstart.tabs', function (e) {
            var point = e.touches ? e.touches[0] : e, start, stop;

            start = {
                x:point.clientX,
                y:point.clientY,
                time:Date.now(),
                el:$(e.target)
            }

            $(document).on('touchmove.tabs',function (e) {
                var point = e.touches ? e.touches[0] : e, xDelta;
                if (!start)return;
                stop = {
                    x:point.clientX,
                    y:point.clientY,
                    time:Date.now()
                }
                if ((xDelta = Math.abs(start.x - stop.x)) > scrollSupressionThreshold ||
                    xDelta > Math.abs(start.y - stop.y)) {
                    isFromTabs(e.target) && e.preventDefault();
                } else {//如果系统滚动开始了，就不触发swipe事件
                    $(document).off('touchmove.tabs touchend.tabs');
                }
            }).one('touchend.tabs', function () {
                    $(document).off('touchmove.tabs');
                    if (start && stop) {
                        if (stop.time - start.time < durationThreshold &&
                            Math.abs(start.x - stop.x) > horizontalDistanceThreshold &&
                            Math.abs(start.y - stop.y) < verticalDistanceThreshold) {
                            start.el.trigger(start.x > stop.x ? "tabsSwipeLeft" : "tabsSwipeRight");
                        }
                    }
                    start = stop = undefined;
                });
        });
    }

    ui.define('tabs', {
        _options: {
            active: 0,
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
            var eventHandler = $.proxy(this._eventHandler, this);
            this._nav.on('tap', eventHandler);
            this._titles.highlight('mui-state-hover');
            $(window).on('ortchange', eventHandler);
            tabs.push(this._content.get(0));
            eventBinded =  eventBinded || (tabsSwipeEvents(), true);
            this._el.on('tabsSwipeLeft tabsSwipeRight', eventHandler)
                .one('DOMNodeInserted', eventHandler);
        },

        _eventHandler: function(e){
            var match, items, active = this._options.active, index, me = this;
            switch(e.type) {
                case 'tabsSwipeLeft':
                case 'tabsSwipeRight':
                    items = this._items;
                    if (e.type == 'tabsSwipeLeft' && active < items.length - 1) {
                        index = active + 1;
                    } else if (e.type == 'tabsSwipeRight' && active > 0) {
                        index = active - 1;
                    }
                    index !== undefined && (e.stopPropagation(), this.switchTo(index));
                    break;
                case 'ortchange':
                    return this.refresh();
                case 'DOMNodeInserted':
                    return $.later(function(){me.refresh();});
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
                    me.trigger('animateComplete', [to, from]);
                    me._fitToContent(to.div);
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

            ~(idx = $.inArray(this._content.get(0), tabs)) && tabs.splice(idx, 1);
            this._el.off('tabsSwipeLeft tabsSwipeRight', eventHandler);
            tabs.length || ($(document).off('touchstart.tabs'), eventBinded = false);

            this._nav.off('tap', eventHandler);
            this._titles.highlight();
            return this.$super('destroy');
        }

    });
})(Zepto, ME.ui);