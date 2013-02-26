(function($, ui){
    ui.define('dialog', {
        _options: {
            title: '',
            content: '',
            mask: false,
            buttonType: 3// 第一位表示是否现实确认，第二位表示是否显示取消。
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
            opt.buttonType & 1 && header.append('<div class="mui-dialog-btnOk">确认</div>');
            opt.buttonType & 2 && header.prepend('<div class="mui-dialog-btnCancel">取消</div>');
        },

        _init: function(){
            var opt = this._options, eventHandler = $.proxy(this._eventHandler, this);
            this.title(opt.title)
                .content(opt.content)
                .root()
                .on('click', eventHandler)
                .find('.mui-dialog-btnOk, .mui-dialog-btnCancel')
                .highlight('mui-state-hover');
            $(window).on('ortchange', eventHandler);
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
                    return this.refresh();
                default:
                    if((match = $(e.target).closest('.mui-dialog-btnOk, .mui-dialog-btnCancel')) && match.length){
                        e.preventDefault();
                        evt = $.Event(match.is('.mui-dialog-btnOk')?'confirm':'cancel');
                        this.trigger(evt);
                        evt.defaultPrevented || this.close();
                    }
            }
        },

        open: function(){
            this._rendered || this.render();
            this._opened = true;
            this.root().show();
            this._mask && this._mask.show();
            this.refresh();
            return this.trigger('open');
        },

        close: function(){
            var evtData = $.Event('beforeClose');
            this.trigger(evtData);
            if(evtData.defaultPrevented)return this;
            this.root().hide();
            this._mask && this._mask.hide();
            this._opened = false;
            return this.trigger('close');
        },

        refresh: function(){
            var body, round, $win, size, el;
            if(this._opened){
                body = document.body;
                this._mask && this._mask.css({
                    width:  body.clientWidth,
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
            this._mask.remove();
            return this.$super('destroy');
        }
    });

    var btnOk = ui.dialog.BUTTON_OK = 1,
        btnCancel = ui.dialog.BUTTON_CANCEL = 2;
})(Zepto, baidu.meditor.ui);