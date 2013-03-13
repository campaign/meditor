;(function($, ns, undefined){
    var ui = ns.ui;

    //translate
    function _t(cmd){
        return {
            align: 'justify',
            orderedlist: 'insertorderedlist',
            unorderedlist: 'insertunorderedlist'
        }[cmd] || cmd;
    }

    ns.registerUI(
        'undo redo bold italic underline strikethrough ' +
        'alignleft aligncenter alignright alignjustify ' +
        'orderedlist unorderedlist indent ' +
        'removeformat',

        function(editor,cmdName){
            var btn,
                cmd = cmdName,
                flag = undefined;

            if(/^(align)(.*)$/.test(cmdName)){
                cmd = RegExp.$1;
                flag = RegExp.$2;
            }

            cmd = _t(cmd);

            btn = ui.button({
                name : cmdName,
                click:function(){
                    editor.execCommand(cmd, flag);
                },
                title:cmdName
            });

            editor.on('selectionchange',function(){
                var state = editor.queryCommandState(cmd);

                if(flag && -1 !== state) {
                    state = editor.queryCommandValue(cmd) === flag ? 1 : 0;
                }

                btn.highlight(state == 1).enable(state != -1);
            });
            return btn;
        }
    );
})(Zepto, ME);

(function($, ns){
    var ui = ns.ui;

    ns.registerUI('mcursor', function(editor, cmdName){
        return ui.button({
            name : cmdName,
            title:cmdName
        });
    });

    ns.registerUI('lcursorbackward lcursorforward rcursorbackward rcursorforward',
    function(editor, cmdName){
        var dir = /backward$/.test(cmdName)?'left':'right',
            cmd = 'moverange',
            end = /^rcursor/.test(cmdName),
            btn = ui.button({
                name : cmdName,
                click:function(){
                    editor.execCommand(cmd, dir, end);
                },
                title:cmdName
            });

        editor.on('selectionchange',function(){
            var state = editor.queryCommandState(cmd, dir, end);
            btn.highlight(state == 1).enable(state != -1);
        });
        return btn;
    });
})(Zepto, ME);