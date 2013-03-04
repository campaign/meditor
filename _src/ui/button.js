(function($, ui){
    ui.define('button', {
        _options: {
            name: '',
            title: '按钮',
            diabled: false,
            highlight: false
        },

        _create: function(){
            var opt = this._options, key = opt.name;
            this.root($('<div class="mui-button'+(key?' mui-button-'+key:'')+'" title="'+opt.title+'">' +
                '<span class="icon"></span>'+
                '</div>'));
        },

        name: function(val){
            var setter = !$.isUndefined(val),
                opt = this._options,
                key = opt.name;
            return setter?(this.root().removeClass('mui-button-'+key).addClass('mui-button-'+(opt.name = val)) , this):key;
        },

        _init: function(){
            var el = this.root(), opt = this._options, _eH = $.proxy(this._eventHandler, this);
            el.on('click', _eH);
            opt.click && this.on('click', opt.click);
            this.enable(!opt.disabled).highlight(opt.highlight);
        },

        _eventHandler: function(e){
            if(!this.isEnable()){
                e.preventDefault();
                e.stopImmediatePropagation();
            }
        },

        enable: function(flag){
            var el = this.root();
            el[flag?'removeClass':'addClass']('mui-state-disable')
                .highlight(flag?'mui-state-hover':null);
            return this;
        },

        isEnable: function(){
            var el = this.root();
            return !el.hasClass('mui-state-disable');
        },

        highlight: function(flag){
            var el = this.root();
            el[flag?'addClass':'removeClass']('mui-state-highlight');
            return this;
        },

        isHighlight: function(){
            var el = this.root();
            return !el.hasClass('mui-state-highlight');
        }
    });
})(Zepto, ME.ui);