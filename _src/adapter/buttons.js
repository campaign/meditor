;(function($,ui){
    ME.registerUI(
        'bold italic underline', function(editor,cmdName){
            var btn = ui.button({
                name : cmdName,
                buttonclick:function(){
                    editor.execCommand(cmdName)
                },
                title:cmdName
            });
            editor.on('selectionchange',function(cmdName){
                var state = editor.queryCommandState(cmdName);
                btn.highlight(state == 1).enable(state == -1);
            });
            return btn;
        }
    )
})(Zepto,ME.ui)