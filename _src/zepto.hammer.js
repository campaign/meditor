(function($){
    $.fn.hammer = function(eventNames,fn){

        return this.each(function(){

            var hammer = $(this).data('hammer');
            if(!hammer){
                hammer = new Hammer(this);
                $(this).data('hammer',hammer)
            }

            $.each(eventNames.split(/\s+/),function(i,eventName){
                hammer['on'+eventName] = fn ? function(ev){
                    fn.call(this,$.Event(eventName, ev))
                } : null;
            });

        });
    };
})(Zepto);
