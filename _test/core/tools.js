(function() {
    function mySetup() {
        for (var config in window.UEDITOR_CONFIG) {
            if (typeof(window.UEDITOR_CONFIG[config]) == 'string')
                window.UEDITOR_CONFIG[config] = window.UEDITOR_CONFIG[config].replace('_test/tools/br/', '');
        }
        var div = document.body.appendChild( document.createElement( 'div' ) );
        div.id = 'test1';
        div.style.cssText += 'border:1px solid #000;width:400px;float:left';
        var utils = ME.utils;
        var editor = new ME.Editor({
            height:300
        });
        editor.render('test1');
        var iframe = document.createElement( 'iframe' );
        document.body.appendChild( iframe );
        iframe.id = 'iframe';
        
        var range = new ME.Range( document );
        var domUtils = ME.domUtils;
        var div_dom = document.body.appendChild( document.createElement( 'div' ) );
        div_dom.id = 'test';
        stop();
        setTimeout(function(){
            te.dom.push( div );
            te.dom.push( iframe );
            te.dom.push( div_dom);
            te.obj.push( utils );
            te.obj.push( editor );
            te.obj.push( range );
            te.obj.push( domUtils );
        },50);
    }

    var s = QUnit.testStart;
    QUnit.testStart = function() {
        s.apply( this, arguments );
        mySetup();
    };
})()