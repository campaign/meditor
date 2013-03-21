module('plugins.autoheight');

test('自动长高',function(){
    var div = document.createElement("div");
    div.id="div";
    div.style = "border:1px solid #000;width:100%;float:left;-webkit-user-select: none;";
    document.body.appendChild(div);
    var editor = ME.getEditor("#div",{'topOffset':60,'autoHeightEnabled':true,'scaleEnabled':false,'toolbars':window.UEDITOR_CONFIG.toolbars});
    te.dom[0].parentNode.removeChild(te.dom[0]);
    stop();
    setTimeout(function(){
    var height=editor.body.style.height;
    editor.setContent('<br/>nmnmknmm,<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>');

    setTimeout(function(){
        ok(height!=editor.body.style.height,'自动长高');
        editor.disableAutoHeight();
        editor.body.style.height=height;
        editor.setContent('<br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/><br/>');
        stop();
        setTimeout(function(){
            ok(height==editor.body.style.height,'不长高');
            start();
        },200);
    },200);
    },200);
});