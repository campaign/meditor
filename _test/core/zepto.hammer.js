module( 'zepto.hammer.js' );
test('zepto.hammer',function(){
    var tmp = $('<div></div>').appendTo(document.body).hammer('tap',function(e){
       debugger
    })
    ta.touchstart(tmp[0]);
    ta.touchend(tmp[0]);
})

