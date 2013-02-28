

(function ($) {
    ME.ui.define('popup', {

        _options: {
            content:        null,
            height:         150,
            width:          200,
            needIscroll:    true,
            _stamp:         0,
            _isShow:        false,
            _iscrollInited: false
        },

        _create: function () {
            var me = this,
                opt = me._options;
            me._el = $('<div class="mui-popup"></div>').append($('<div class="mui-popup-content"></div>').html(opt.content).append('<div class="mui-popup-arrow"><b></b></div>')).appendTo('body');
        },

        _init: function () {
            var me = this,
                opt = me._options,
                root = me.root();
            //设置宽高
            root.css({
                height:     opt.height,
                width:      opt.width
            }).children().first().css({
                height:     opt.height,
                width:      opt.width
            })
            //点击隐藏
            $(document).on('tap', function (e) {
                if ($.contains(root[0], e.target)) return;
                me.hide();
            });
        },

        _fitSize: function (node) {
            var me = this,
                opt = me._options,
                rect;
            if(!node) {
                rect = {left: opt.width + 15, top: 10, height: 30};  //如果不传入节点，可以传入一个这样的对象，用来定义组件位置，height控制箭头位置
            } else if(node[0] || node.nodeType === 1) {
                rect= (node[0] || node).getBoundingClientRect();
            } else rect = node;

            me.root().css({
                top:        rect.top,
                left:       rect.left - opt.width - 15
            }).children().last().css({
                top:        rect.height / 2 - 16
            });
            return me;
        },

        show: function (node) {
            var me = this,
                opt = me._options,
                now = Date.now(),
                stamp = opt._stamp;
            if(now - stamp < 50) return me;
            opt._stamp = now;
            me._fitSize(node).root().show();
            opt._isShow = true;
            if(opt.needIscroll && !opt._iscrollInited) {
                me.root().children().first().iscroll();
                opt._iscrollInited  = true;
            }
            return me;
        },

        hide: function () {
            var me = this,
                opt = me._options,
                now = Date.now(),
                stamp = opt._stamp;
            if(now - stamp < 50) return me;
            opt._stamp = now;
            me.root().hide();
            opt._isShow = false;
            return me;
        },
        toggle: function (node) {
            return this._options._isShow ? this.hide() : this.show(node);
        }

    });

})(Zepto);

