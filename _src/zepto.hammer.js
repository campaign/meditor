(function($){
    var events =  ['hold','tap','doubletap','transformstart','transform','transformend','dragstart','drag','dragend','swipe','release'];
    events.forEach(function(m){
        $.fn[m] = function(callback){
            return this.each(function(){
                var hammer = new Hammer(this), el = this;
                hammer['on' + m] = function(e,prop){
                    callback.call(el, $.Event(e.type,$.extend(prop||{},e)))
                }
            })
        }
    });
    var orgOn = $.fn.on;
    $.fn.on = function(event, selector, callback){
        if(events.indexOf(event)!=-1){
            $.fn[event].call(this,selector);
        }else{
            orgOn.call(this,event, selector, callback)
        }
    }
})(Zepto);