/**
 * @file 所有UI组件的基类，通过它可以简单的快速的创建新的组件。
 * @name UI 基类
 * @short Zepto UI
 * @desc 所有UI组件的基类，通过它可以简单的快速的创建新的组件。
 * @import core/zepto.js, core/zepto.extend.js
 */
(function($, ns, undefined) {
    var id = 1, _blankFn = function(){};

    function _guid() {
        return id++;
    };

    //创建一个新object
    function _createObject(proto, data) {
        var obj = {};
        Object.create ? obj = Object.create(proto) : obj.__proto__ = proto;
        return $.extend(obj, data || {});
    }

    //创建构造器:继承father.prototype，将data扩展到prototype中
    function _createClass(Class, data) {
        var father = data.inherit || _widget,
            proto = father.prototype;

        $.extend(Class.prototype, _createObject(proto, {
            $super: function (name) {
                var fn = proto[name];
                return $.isFunction(fn) ? fn.apply(this, $.slice(arguments, 1)) : fn;
            }
        }));

        $.isObject(data) && $.extend(true, Class.prototype, data);
        return Class;
    }

    ns.ui = ns.ui || {
        version: '1.0.0',
        define: function(name, data, superClass) {
            if(superClass) data.inherit = $.isString(superClass)?ns.ui[superClass]:superClass;
            var Class = ns.ui[name] = _createClass(function(options) {
                var obj = _createObject(Class.prototype, {
                    _id: name + '-' + _guid()
                })
                obj._createWidget.call(obj, options);
                return obj;
            }, data);
        },

        isWidget: function(obj, name){
            return obj instanceof (name===undefined ? _widget: ns.ui[name] || _blankFn);
        }
    };

    /**
     * @name widget基类
     * @desc GMU所有的组件都是此类的子类，即以下此类里面的方法都可在其他组建中调用。
     */
    var _widget = function() {};
    $.extend(_widget.prototype, {
        /**
         * common constructor
         */
        _createWidget: function(opts) {
            var me = this, el;
            me._options = $.extend({
                theme: 'default'
            }, me._options, opts);
            me._create();
            if(!(el = me.root())){
                throw new Error('组件的_create方法里面必须创建并保存根元素');
            }
            el.addClass('mui-widget');
            me.trigger('create');
            me._init();
            me.trigger('init');
        },

        /**
         * @interface: use in render mod
         * @name _create
         * @desc 接口定义，子类中需要重新实现此方法，此方法在render模式时被调用。
         *
         * 所谓的render方式，即，通过以下方式初始化组件
         * <code>
         * $.ui.widgetName(options);
         * </code>
         */
        _create: function() {
            return this.root($('<div></div>'));
        },

        _init: function () {},

        render: function (el) {
            $(el).append(this.root());
            return this;
        },

        /**
         * @name root
         * @grammar root() ⇒ value
         * @grammar root(el) ⇒ self
         * @desc 设置或者获取根节点
         * @example
         * $('a#btn').button({label: '按钮'});
         * console.log($('a#btn').button('root'));// => a#btn
         */
        root: function(el) {
            return $.isUndefined(el)? this._el: (this._el = $(el), this);
        },

        /**
         * @name id
         * @grammar id() ⇒ value
         * @grammar id(id) ⇒ value
         * @desc 设置或者获取组件id
         */
        id: function(id) {
            return $.isUndefined(id)? this._id: (this._id = id, this);
        },

        /**
         * @name data
         * @grammar data(key) ⇒ value
         * @grammar data(key, value) ⇒ value
         * @desc 设置或者获取options, 所有组件中的配置项都可以通过此方法得到。
         */
        option: function(key, val) {
            var _options = this._options;
            if ($.isObject(key)) return ($.extend(_options, key), this);
            else return $.isUndefined(val) ? key?_options[key]:_options : (_options[key] = val, this);
        },

        /**
         * @name destroy
         * @grammar destroy() ⇒ undefined
         * @desc 注销组件
         */
        destroy: function() {
            var That = this;
            this.trigger('destroy').root().off().remove();
            this.__proto__ = null;
            $.each(this, function(key) {
                delete That[key];
            });
        },

        /**
         * @name on
         * @grammar on(type, handler) ⇒ instance
         * @desc 绑定事件，此事件绑定不同于zepto上绑定事件，此On的this只想组件实例，而非zepto实例
         */
        on: function(ev, callback) {
            this.root().on(ev, $.proxy(callback, this));
            return this;
        },

        /**
         * @name off
         * @grammar off(type) ⇒ instance
         * @grammar off(type, handler) ⇒ instance
         * @desc 解绑事件
         */
        off: function(ev, callback) {
            this.root().off(ev, callback);
            return this;
        },

        /**
         * @name trigger
         * @grammar trigger(type[, data]) ⇒ instance
         * @desc 触发事件, 此trigger会优先把options上的事件回调函数先执行，然后给根DOM派送事件。
         * options上回调函数可以通过e.preventDefaualt()来组织事件派发。
         */
        trigger: function(event, data) {
            event = $.isString(event) ? $.Event(event) : event;
            var onEvent = this._options[event.type], result;
            if( onEvent && $.isFunction(onEvent) ){
                event.data = data;
                result = onEvent.apply(this, [event].concat(data));
                if(result === false || event.defaultPrevented){
                    return this;
                }
            }
            this.root().trigger(event, data);
            return this;
        }
    });

    //添加render事件
    var startEvent = $.fx.animationEnd.replace(/AnimationEnd$/, 'AnimationStart');
    $(document).on(startEvent, function(e){
        if (e.animationName == 'nodeInserted'){
            console.log(e)
            $(e.target).triggerHandler('render');
        }
    });
})(Zepto, ME);