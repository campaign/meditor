(function($, ui){
    ui.define('button', {
        _options: {
            key: '',
            title: '按钮',
            diabled: false,
            highlight: false
        },

        _create: function(){
            var opt = this._options, key = opt.key;
            this.root($('<div class="mui-button'+(key?' mui-button-'+key:'')+'" title="'+opt.title+'">' +
                '<span class="icon"></span>'+
                '</div>'));
        },

        _init: function(){
            var el = this.root(), opt = this._options, _eH = $.proxy(this._eventHandler, this);
            el.on('click', _eH);
            this.enable(!opt.disabled).highlight(opt.highlight);
        },

        _eventHandler: function(e){
            if(this.isEnable()){
                this.trigger('buttonclick', $.extend({}, this.option()));
            }
        },

        enable: function(flag){
            var el = this.root();
            el[flag?'removeClass':'addClass']('mui-state-disable').highlight(flag?'mui-state-hover':null);
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
})(Zepto, baidu.meditor.ui);