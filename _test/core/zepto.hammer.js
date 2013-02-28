module( 'zepto.hammer.js' );
test('zepto.hammer',function(){
    var tmp = $('<div></div>').appendTo(document.body).hammer('tap',function(e){
        equal(e.touches.length,1)
    });
    ta.touchstart(tmp[0]);
    ta.touchend(tmp[0]);
})

