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
            'plugins/moverange.js',
            'plugins/basestyle.js',
            'ui/ui.js',
            'ui/toolbar.js',
            'ui/button.js',
            'ui/popup.js',
            'adapter/adapter.js',
            'adapter/buttons.js'

        ],
        baseURL = '../_src/';
    for (var i=0,pi;pi = paths[i++];) {
        document.write('<script type="text/javascript" src="'+ baseURL + pi +'"></script>');
    }
})();
