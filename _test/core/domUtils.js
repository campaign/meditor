module( 'core.domUtils' );
test( 'getPosition--A和B是同一个节点', function() {
	var div = te.dom[2];
    div.innerHTML = "<span>span</span><img  /><b>bbb</b>xxx";
    var span_text = div.firstChild.firstChild;
    var domUtils = te.obj[3];
    equal( domUtils.getPosition( span_text, span_text ), 0, 'identical node' );
} );