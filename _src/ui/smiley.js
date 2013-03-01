;(function($, ui){
    ui.define('smiley', {
        _options: {
            items: null,
            prefix: 'smiley'
        },
        _create: function(){;
            var me = this,
                opt = me._options,
                panels = [],
                content;
            $.each(opt.items || [], function(){
                panels.push( me._creatPanel(this));
            });
            content = opt.content = $('<div></div>');
            content.append(ui.tabs({
                items: panels
            }).root().addClass('smiley-tabs'));
            content.append('<div class="smiley-btns"><div class="mui-btnOk">确认</div></div>');
            return this.$super('_create');
        },

        _creatPanel: function(obj){
            var cells = obj.cells || 8,
                arr = obj.items.concat(),
                size = obj.size || 35,
                url = obj.url,
                row, i, item, index = 0, html='', empty,
                div = $('<table class="smiley-'+obj.cls+'"></table>');

            while(arr.length) {
                row = arr.splice(0, cells);
                html += '<tr>';
                for(i=0; i<cells; i++){
                    item = row[i];
                    empty = typeof item !== 'string';
                    html += '<td '+(empty?' class="empty"':'')+'data-url="'+this._formatUrl(url, index+1)+'" title="'+item+'"><div>';
                    html += empty ? '&nbsp;' : '<span class="icon" style="background-position: 0 -'+index*size+'px"></span>';
                    html += '</div></td>';
                    index++;
                }
                html += '</tr>';
            }
            return div.append(html);
        },

        _formatUrl: function(tpl, index){
            var len = /(#+)/.test(tpl) && RegExp.$1.length || 2,
                file;

            file = "" + index;
            while (file.length < len) {
                file = "0" + file;
            }
            return tpl.replace(/#+/g, file);
        },

        _init: function(){
            var me = this, opt = this._options;
            this.$super('_init');
            opt.content.on('click', 'td:not(.empty)', function(){
                var td = $(this),
                    url = td.attr('data-url');

                me.trigger('select', [url, td.hasClass('active')]);
                td.toggleClass('active');
            }).highlight()
                .find('.mui-btnOk')
                .highlight('mui-state-hover')
                .on('click', function(e){
                    me._commit();
                });
        },

        _commit: function(){
            var opt = this._options,
                ret = [],
                actives = $('td.active', opt.content);
            actives.each(function(){
                ret.push($(this).attr('data-url'));
            }).removeClass('active');
            this.trigger('confirm', [ret]);
        }
    }, "popup");
})(Zepto, ME.ui)