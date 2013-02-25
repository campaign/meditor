///import editor.js
///import core/browser.js
///import core/dom/dom.js
///import core/dom/dtd.js
///import core/dom/domUtils.js
///import core/dom/Range.js
/**
 * @class baidu.editor.dom.Selection    Selection类
 */
(function () {

    var Selection = ME.Selection = function ( doc ) {
        this.document = doc;
    };

    Selection.prototype = {
        /**
         * 获取原生seleciton对象
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.getNative
         * @return {Selection}    获得selection对象
         */
        getNative:function () {
            var doc = this.document;
            try {
                return !doc ? null : domUtils.getWindow( doc ).getSelection();
            } catch ( e ) {
                return null;
            }
        },


        /**
         * 缓存当前选区的range和选区的开始节点
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.cache
         */
        cache:function () {
            this.clear();
            this._cachedRange = this.getRange();
            this._cachedStartElement = this.getStart();
            this._cachedStartElementPath = this.getStartElementPath();
        },

        getStartElementPath:function () {
            if ( this._cachedStartElementPath ) {
                return this._cachedStartElementPath;
            }
            var start = this.getStart();
            if ( start ) {
                return domUtils.findParents( start, true, null, true )
            }
            return [];
        },
        /**
         * 清空缓存
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.clear
         */
        clear:function () {
            this._cachedStartElementPath = this._cachedRange = this._cachedStartElement = null;
        },
        /**
         * 编辑器是否得到了选区
         */
        isFocus:function () {
            try {
                return this.getNative().rangeCount > 0 ;
            } catch ( e ) {
                return false;
            }

        },
        /**
         * 获取选区对应的Range
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.getRange
         * @returns {baidu.editor.dom.Range}    得到Range对象
         */
        getRange:function () {
            var me = this;
            function optimze( range ) {
                var child = me.document.body.firstChild,
                        collapsed = range.collapsed;
                while ( child && child.firstChild ) {
                    range.setStart( child, 0 );
                    child = child.firstChild;
                }
                if ( !range.startContainer ) {
                    range.setStart( me.document.body, 0 )
                }
                if ( collapsed ) {
                    range.collapse( true );
                }
            }

            if ( me._cachedRange != null ) {
                return this._cachedRange;
            }
            var range = new ME.Range( me.document );

            var sel = me.getNative();
            if ( sel && sel.rangeCount ) {
                var firstRange = sel.getRangeAt( 0 );
                var lastRange = sel.getRangeAt( sel.rangeCount - 1 );
                range.setStart( firstRange.startContainer, firstRange.startOffset ).setEnd( lastRange.endContainer, lastRange.endOffset );
                if ( range.collapsed && domUtils.isBody( range.startContainer ) && !range.startOffset ) {
                    optimze( range );
                }
            } else {
                //trace:1734 有可能已经不在dom树上了，标识的节点
                if ( this._bakRange && domUtils.inDoc( this._bakRange.startContainer, this.document ) ){
                    return this._bakRange;
                }
                optimze( range );
            }

            return this._bakRange = range;
        },

        /**
         * 获取开始元素，用于状态反射
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.getStart
         * @return {Element}     获得开始元素
         */
        getStart:function () {
            if ( this._cachedStartElement ) {
                return this._cachedStartElement;
            }
            var range = this.getRange(),
                    start;

            range.shrinkBoundary();
            start = range.startContainer;
            if ( start.nodeType == 1 && start.hasChildNodes() ){
                start = start.childNodes[Math.min( start.childNodes.length - 1, range.startOffset )];
            }
            if ( start.nodeType == 3 ){
                return start.parentNode;
            }

            return start;
        },
        /**
         * 得到选区中的文本
         * @public
         * @function
         * @name    baidu.editor.dom.Selection.getText
         * @return  {String}    选区中包含的文本
         */
        getText:function () {
            var nativeSel, nativeRange;
            if ( this.isFocus() && (nativeSel = this.getNative()) ) {
                nativeRange = nativeSel.getRangeAt( 0 );
                return nativeRange.toString();
            }
            return '';
        },
        clearRange : function(){
            this.getNative().removeAllRanges();
        }
    };
})();