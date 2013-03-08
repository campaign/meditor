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
        'undo redo lcursorbackward lcursorforward mcursor rcursorforward rcursorbackward bold italic underline strikethrough ' +
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

    ns.registerUI('fontfamily fontsize', function (editor,cmdName) {
        var cmd = cmdName.toLowerCase(),
            opts = editor.options[cmd],
            fn = null, combox, btn;

        switch (cmd) {
            case 'fontfamily':
                fn = function (i) {
                    return i < opts.length && '<div class="mui-combox-' + cmd + '" style="font-family:' + opts[i].val + '" value="' + opts[i].val + '" >' + opts[i].val.split(',')[0] + '</div>';};
                break;
            case 'fontsize':
                fn = function (i) {
                    return i < opts.length && '<div class="mui-combox-' + cmd + '" style="font-size:' + opts[i] + 'px;" value="' + opts[i] + 'px" >' + opts[i]+ '</div>';};
                break;
            case 'default':
                break;
        };

        btn = ui.button({
            name: cmdName,
            click: function () {
                !combox && (combox = ui.combox({
                    container: $('.mui-toolbar'),
                    renderFn: fn,
                    select: function (e, index, value, node) {
                        console.log(e);
                        editor.execCommand(cmd, value);
                        this.singleSelect(index);
                    }
                }));
                combox.toggle(this.root());
            }
        });

        editor.on('selectionchange', function (type, causeByUi, uiReady) {
            var state = editor.queryCommandState(cmdName);
        });

        return btn;
    })
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