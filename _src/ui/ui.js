var baidu = baidu || {};
baidu.meditor = baidu.meditor || {};

/**
 * @file 所有UI组件的基类，通过它可以简单的快速的创建新的组件。
 * @name UI 基类
 * @short Zepto UI
 * @desc 所有UI组件的基类，通过它可以简单的快速的创建新的组件。
 * @import core/zepto.js, core/zepto.extend.js
 */
(function($, undefined) {
    var id = 1;

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

        $.isObject(data) && $.extend(Class.prototype, data);
        return Class;
    }

    baidu.meditor.ui = baidu.meditor.ui || {
        version: '1.0.0',
        define: function(name, data, superClass) {
            if(superClass) data.inherit = superClass;
            var Class = baidu.meditor.ui[name] = _createClass(function(options) {
                var obj = _createObject(Class.prototype, {
                    _id: name + '-' + _guid()
                })
                obj._createWidget.call(obj, options);
                return obj;
            }, data);
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
            var me = this;
            me._data = $.extend({}, opts, {
                theme: 'default'
            });
            me._create();
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
        _create: function() {},

        _init: function () {},

        render: function () {},

        /**
         * @name root
         * @grammar root() ⇒ value
         * @grammar root(el) ⇒ value
         * @desc 设置或者获取根节点
         * @example
         * $('a#btn').button({label: '按钮'});
         * console.log($('a#btn').button('root'));// => a#btn
         */
        root: function(el) {
            return this._el = el || this._el;
        },

        /**
         * @name id
         * @grammar id() ⇒ value
         * @grammar id(id) ⇒ value
         * @desc 设置或者获取组件id
         */
        id: function(id) {
            return this._id = id || this._id;
        },

        /**
         * @name destroy
         * @grammar destroy() ⇒ undefined
         * @desc 注销组件
         */
        destroy: function() {
            var That = this,$el;

            $el = this.trigger('destroy').off().root();
            $el.find('*').off();
            this.__proto__ = null;
            $.each(this, function(key, val) {
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
            var onEvent = this._data[event.type],result;
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
})(Zepto);