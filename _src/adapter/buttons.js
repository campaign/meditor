;(function($,ui){
    ME.registerUI(
        'bold italic underline', function(editor,cmdName){
            var btn = ui.button({
                name : cmdName,
                click:function(){
                    editor.execCommand(cmdName)
                },
                title:cmdName
            });

            editor.on('selectionchange',function(){
                var state = editor.queryCommandState(cmdName);
                btn.highlight(state == 1).enable(state != -1);
            });
            return btn;
        }
    );

    //零时
    ME.registerUI(
        'font image bullet numbered alignleft' +
            ' aligncenter alignright alignjustify' +
            ' undo redo table delete color'+
            '', function(editor,cmdName){
            var btn = ui.button({
                name : cmdName,
                click:function(){

                },
                title:cmdName
            });
            return btn;
        }
    );
})(Zepto,ME.ui)