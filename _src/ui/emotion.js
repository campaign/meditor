;(function ($, ui) {

    ui.define('emotion', {
        _options:{
            items:null,
            prefix:'emotion'
        },

        _create:function () {
            var me = this,
                opt = me._options,
                panels = [],
                content;

            $.each(opt.items || [], function () {
                panels.push(me._creatPanel(this));
            });

            content = opt.content = $('<div></div>');
            content.append(ui.tabs({
                items:panels
            }).root().addClass('emotion-tabs'));

            ui.isWidget(this, 'dialog') || content.append('<div class="emotion-btns">' +
                '<div class="mui-btnCancel">重置</div>' +
                '<div class="mui-btnOk">确认</div>' +
                '</div>');

            return this.$super('_create');
        },

        _creatPanel:function (obj) {
            var cells = obj.cells || 8,
                arr = obj.items.concat(),
                size = obj.size || 35,
                url = obj.url,
                row, i, item, index = 0, html = '', empty,
                div = $('<table class="emotion-' + obj.cls + '"></table>');

            while (arr.length) {
                row = arr.splice(0, cells);
                html += '<tr>';
                for (i = 0; i < cells; i++) {
                    item = row[i];
                    empty = typeof item !== 'string';
                    html += '<td ' + (empty ? ' class="empty"' : '') + 'data-url="' +
                        this._formatUrl(url, index + 1) +
                        '" title="' + (item || '') + '"><div>';
                    html += empty ? '&nbsp;' : '<span class="icon" style="background-position: 0 -' + index * size + 'px"></span>';
                    html += '</div></td>';
                    index++;
                }
                html += '</tr>';
            }
            return div.append(html);
        },

        _formatUrl:function (tpl, index) {
            var len = /(#+)/.test(tpl) && RegExp.$1.length || 2,
                file;

            file = "" + index;
            while (file.length < len) {
                file = "0" + file;
            }
            return tpl.replace(/#+/g, file);
        },

        _init:function () {
            var me = this, opt = this._options;
            this.$super('_init');
            opt.content.on('h_tap', 'td:not(.empty)',function () {
                var td = $(this),
                    url = td.attr('data-url');
                me.trigger('select', [url, td.hasClass('active'), td]);
            }).highlight()
                .find('.mui-btnOk, .mui-btnCancel')
                .highlight('mui-state-hover')
                .on('click', function () {
                    me.trigger($(this).is('.mui-btnOk') ? 'confirm' : 'reset');
                });

            me.on('reset',function () {
                this._val = [];
                $('td.active', opt.content).removeClass('active');
            }).on('select', $.proxy(me._toggleValue, me))
                .on('open show', function () {
                    me._val = [];
                    $('td.active', opt.content).removeClass('active');
                });

            opt.content.find('.mui-tabs').hammer({tap: true});
        },

        _toggleValue:function (e, url, check, td) {
            var values = this._val = this._val || [],
                idx = $.inArray(url, values);

            td[check ? 'removeClass' : 'addClass']('active');
            ~idx && values.splice(idx, 1);
            check || values.push(url);
        },

        value:function () {
            return (this._val || []).concat();
        }

    }, 'popup');
})(Zepto, ME.ui);