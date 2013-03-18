(function($, ns){

    var maxWidth;
    ns.plugins['adjustimage'] = function(){
        var me = this;

        me.on('adjustimage', function(){
            $('img:not(.adjustimage-processed)', me.document)
                .addClass('adjustimage-processed')
                .css('maxWidth', '80%').on('load', function(){
                    me.trigger('contentchange');
                });
        });

    };

})(Zepto, ME);