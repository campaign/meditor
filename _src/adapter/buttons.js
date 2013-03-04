;(function($, ns){
    var ui = ns.ui;

    ns.registerUI(
        'undo redo bold italic underline strikethrough '+
        'removeformat',

        function(editor,cmdName){
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

    //临时, 为了让按钮能正常显示.
    ns.registerUI(
        [ 'formatmatch',
            'orderedlist', 'unorderedlist', 'indent',
            'alignleft', 'aligncenter', 'alignright', 'alignjustify',
            'fontfamily', 'fontsize', 'fontcolor', 'bgcolor',
            'image', 'attach',
            'touppercase', 'tolowercase',
            'subscript', 'superscript', 'source', 'indent', 'outdent',
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
})(Zepto,ME)