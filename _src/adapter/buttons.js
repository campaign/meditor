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
        ['undo', 'redo', 'bold', 'italic', 'underline', 'formatmatch',
            'orderedlist', 'unorderedlist', 'indent',
            'alignleft', 'aligncenter', 'alignright', 'alignjustify',
            'fontfamily', 'fontsize', 'fontcolor', 'bgcolor',
            'image', 'attach',
            'touppercase', 'tolowercase',
            'strikethrough', 'subscript', 'superscript', 'source', 'indent', 'outdent',
            'blockquote', 'pasteplain', 'pagebreak',
            'selectall', 'print', 'preview', 'horizontal', 'removeformat', 'time', 'date', 'unlink',
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
})(Zepto,ME.ui)