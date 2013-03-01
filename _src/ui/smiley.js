;(function($, ui){
    ui.define('smiley', {
        _options: {
            items: null,
            prefix: 'smiley'
        },
        _create: function(){;
            var me = this,
                opt = me._options,
                panels = [];
            $.each(opt.items || [], function(){
                panels.push( me._creatPanel(this));
            });
            this._content = opt.content = ui.tabs({
                items: panels
            }).root().addClass('smiley-tabs');
            return this.$super('_create');
        },

        _creatPanel: function(obj){
            var cells = obj.cells || 11,
                arr = obj.items.concat(),
                size = obj.size || 35,
                row, i, item, index = 0, html='',
                div = $('<table class="smiley-'+obj.cls+'" data-url="'+obj.url+'"></table>');

            while(arr.length) {
                row = arr.splice(0, cells);
                html += '<tr>';
                for(i=0; i<cells; i++){
                    item = row[i];
                    html += '<td data-index="'+index+'" title="'+item+'">';
                    html += typeof item == 'string'?'<span style="background-position: 0 -'+index*size+'px"></span>':'&nbsp;';
                    html += '</td>';
                    index++;
                }
                html += '</tr>';
            }
            return div.append(html);
        },
        _init: function(){
            var me = this;
            this.$super('_init');
            this._content.on('click', 'td', function(){
                var td = $(this),
                    table = td.closest('table'),
                    url = table.attr('data-url'),
                    index = parseInt(td.attr('data-index'), 10)+1,
                    len = /(#+)/.test(url) && RegExp.$1.length || 2,
                    file;

                file = "" + index;
                while (file.length < len) {
                    file = "0" + file;
                }
                file = url.replace(/#+/g, file);
                me.trigger('commit', file);
            });
        }
    }, "popup");
})(Zepto, ME.ui)