/**
 * 开发版本的文件导入
 */
(function (){
    var paths  = [
            'meditor.js',
            'core/utils.js',
            'core/dtd.js',
            'core/domUtils.js',
            'core/Range.js',
            'core/Selection.js',
            'core/Editor.js',
            'core/htmlparser.js',
            'core/node.js',
            'core/filternode.js',
            'plugins/paragraph.js',
            'plugins/inserthtml.js',
            'plugins/moverange.js',
            'plugins/basestyle.js',
            'plugins/autolink.js',
            'plugins/paste.js',
            'plugins/undo.js',
            'plugins/font.js',
            'plugins/removeformat.js',
            'plugins/justify.js',
            'plugins/list.js',
            'plugins/indent.js',
            'plugins/autoheight.js',
            'ui/ui.js',
            'ui/button.js',
            'ui/toolbar.horizontal.js',
            'ui/tabs.js',
            'ui/popup.js',
            'ui/combox.js',
            'ui/dialog.js',
            'ui/emotion.js',
            'ui/colorpicker.js',
            'ui/imguploader.js',
            'adapter/adapter.js',
            'adapter/buttons.js',
            'adapter/popups.js',
            'adapter/dialogs.js'

        ],
        baseURL = '../_src/';
    for (var i=0,pi;pi = paths[i++];) {
        document.write('<script type="text/javascript" src="'+ baseURL + pi +'"></script>');
    }
})();
