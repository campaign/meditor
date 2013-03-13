(function($, ui){
    ui.define('dialog', {
        _options: {
            title: '',
            content: '',
            mask: true,
            buttonType: 3,// 第一位表示是否现实确认，第二位表示是否显示取消。
            watchRender:true
        },

        _create: function(){
            var opt = this._options, el, header;
            if(opt.mask) {
                this._mask = $('<div class="mui-mask"></div>').hide();
            }
            this.root(el = $('<div class="mui-dialog">' +
                '<div class="mui-dialog-header"><h3></h3></div>' +
                '<div class="mui-dialog-body"></div></div>').hide());

            header = this._header = el.find('.mui-dialog-header');
            this._body = el.find('.mui-dialog-body');
            opt.buttonType & 1 && header.append('<div class="mui-btnOk">确认</div>');
            opt.buttonType & 2 && header.prepend('<div class="mui-btnCancel">取消</div>');
        },

        _init: function(){
            var opt = this._options, eH = $.proxy(this._eventHandler, this);
            this.title(opt.title)
                .content(opt.content)
                .root()
                .on('click', eH)
                .on('widgetrender', eH)
                .find('.mui-dialog-btnOk, .mui-dialog-btnCancel')
                .highlight('mui-state-hover');
            $(window).on('ortchange', eH);
        },

        title: function(val){
            var setter = !$.isUndefined(val), h3;
            if(setter){
                h3 = $('h3', this._header);
                h3.empty().append(this._title = val);
            }
            return setter ? this : this._title;
        },

        content: function(val){
            var setter = !$.isUndefined(val);
            if(setter){
                this._body.empty().append(this._content = val);
            }
            return setter ? this : this._content;
        },

        _eventHandler: function(e){
            var match, evt;
            switch(e.type){
                case 'ortchange':
                case 'widgetrender':
                    return this.refresh();
                default:
                    if((match = $(e.target).closest('.mui-btnOk, .mui-btnCancel')) && match.length){
                        e.preventDefault();
                        evt = $.Event(match.is('.mui-btnOk')?'confirm':'cancel');
                        this.trigger(evt);
                        evt.defaultPrevented || this.close();
                    }
            }
        },

        open: function(){
            this._opened = true;
            this._rendered || this.render();
            this.root().show();
            this._mask && this._mask.show();
            $(document).on('touchmove.'+this.id(), function(e){e.preventDefault()});
            return this.trigger('open');
        },

        close: function(){
            var evtData = $.Event('beforeClose');
            this.trigger(evtData);
            if(evtData.defaultPrevented)return this;
            this.root().hide();
            this._mask && this._mask.hide();
            this._opened = false;
            $(document).off('touchmove.'+this.id());
            return this.trigger('close');
        },

        toggle: function(){
            return this[this._opened?'close':'open'].call(this);
        },

        refresh: function(){
            var body, round, $win, size, el, now = Date.now();
            if(this._opened && now - (this._lastExecTime || 0)>100){
                body = document.body;
                this._mask && this._mask.css({
                    width:  '100%',
                    height: Math.max(body.scrollHeight, body.clientHeight)-1
                });

                round = Math.round;
                $win = $(window);
                size = (el = this.root()).offset();
                el.css({
                    left: '50%',
                    marginLeft: -round(size.width/2) +'px',
                    top: round($win.height() / 2) + window.pageYOffset,
                    marginTop: -round(size.height/2) +'px'
                });
                this._lastExecTime = now;
            }
            return this;
        },

        render: function(el){
            var container = el || document.body;
            this._mask && this._mask.appendTo(container);
            this.root().appendTo(container);
            this._rendered = true;
        },

        destroy: function(){
            var eventHandler = this._eventHandler;
            this._mask.remove();
            $(window).off('ortchange', eventHandler);
            $(document).off('touchmove.'+this.id());
            return this.$super('destroy');
        },

        show: function(){
            this.open.apply(this, arguments);
        },

        hide: function(){
            this.close.apply(this, arguments);
        }
    });

    var btnOk = ui.dialog.BUTTON_OK = 1,
        btnCancel = ui.dialog.BUTTON_CANCEL = 2;
})(Zepto, ME.ui);