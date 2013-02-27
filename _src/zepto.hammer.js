(function($){
    $.fn.hammer = function(options){

        return this.each(function(){

            var hammer = new Hammer(this, options);

            var $el = $(this);

            $.each(['hold','tap','doubletap','transformstart','transform','transformend','dragstart','drag','dragend','swipe','release'],function(i,eventName){
                hammer['on'+ eventName] = function(ev) {
                    $el.trigger($.Event(eventName, ev));
                };
            })
        });
    };
})(Zepto);
