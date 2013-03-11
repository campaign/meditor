(function($, ns){
    var wrap, maxWidth;
    ns.plugins['adjustimage'] = function(){
        var me = this;

        me.on('ready', function(){
            wrap = $(me.iframe.parentNode);
            maxWidth = wrap.width()*0.8;
        });

        me.on('adjustimage', function(){
            $('img:not(.adjustimage-processed)', me.document).each(function(){
                adjustimage(this, me);
            });
        });

        $(window).on('ortchange', function(){
            maxWidth = wrap.width()*0.8;

            $('img.adjustimage-processed', me.document).each(function(){
                adjustimage(this, me);
            });
        });

    };

    function adjustimage(image, editor){
        var $img = $(image);
        getImageSize(image, function(width, height){
            var ratio;
            if(width > maxWidth){
                ratio = maxWidth / width;
                $img.css({
                    width: Math.round(width * ratio) + 'px',
                    height: Math.round(height * ratio) + 'px'
                });
                editor.trigger('contentchange');
            }
        });
        $img.addClass('adjustimage-processed');
    }

    function getImageSize(img, cb){
        var image = new Image();
        image.onload = function(){
            image.onload = function(){};
            cb && cb.call(null, image.width, image.height);
        }
        image.src = img.getAttribute('src');
    }

})(Zepto, ME);