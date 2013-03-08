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


    //临时, 为了让按钮能正常显示.
    ns.registerUI(
        [ 'formatmatch',
            /*'fontfamily', *//*'fontsize'*/ 'fontcolor', 'bgcolor',
            'image', 'attach',
            'touppercase', 'tolowercase',
            'subscript', 'superscript', 'source', 'outdent',
            'blockquote', 'pasteplain', 'pagebreak',
            'selectall', 'print', 'preview', 'horizontal', 'time', 'date', 'unlink',
            'insertparagraphbeforetable', 'insertrow', 'insertcol', 'mergeright', 'mergedown', 'deleterow',
            'deletecol', 'splittorows', 'splittocols', 'splittocells', 'mergecells', 'deletetable'], function(editor,cmdName){
            var btn = ui.button({
                name : cmdName,
                click:function(){

                },
                title:cmdName
            });
            return btn;
        }
    );
})(Zepto, ME)