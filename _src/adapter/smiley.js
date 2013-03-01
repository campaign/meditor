;(function($,ui){
    ui.define('smiley', {
        _options: {
            items: null
        },
        _create: function(){;
            var me = this,
                el = me.$super('_create').root(),
                opt = me._options,
                panels = [];
            $.each(opt.items || [], function(){
                panels.push( me._creatPanel(this));
            });
            el.append((opt.tabs = ui.tabs({
                items: panels
            })).root().addClass('smiley-tabs'));
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
            this.root().on('click', 'td', function(){
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
    });

    ME.registerUI(
        'smiley', function(editor,cmdName){
            var pop,
                btn = ui.button({
                name : cmdName,
                buttonclick:function(){
                    var smiley;
                    pop = pop || ui.popup({
                        content: smiley = ui.smiley({
                            items: [
                                {
                                    cls: 'bubble',
                                    url: 'http://img.baidu.com/hi/face/i_f##.gif',
                                    size: 25,
                                    items: [
                                        '微笑', '亲吻', '调皮', '惊讶', '耍酷', '发火', '害羞', '汗水', '大哭', '得意', '鄙视', '困', '夸奖', '晕倒', '疑问', '媒婆', '狂吐', '青蛙', '发愁', '亲吻', '', '爱心', '心碎', '玫瑰', '礼物', '哭', '奸笑', '可爱', '得意', '呲牙', '暴汗', '楚楚可怜', '困', '哭', '生气', '惊讶', '口水', '彩虹', '夜空', '太阳', '钱钱', '灯泡', '咖啡', '蛋糕', '音乐', '爱', '胜利', '赞', '鄙视', 'OK'
                                    ]
                                },
                                {
                                    cls: 'lvdouwa',
                                    url: 'http://img.baidu.com/hi/bobo/B_####.gif',
                                    size: 35,
                                    items: [
                                        'HI', 'KISS', '不说', '不要', '扯花', '大心', '顶', '大惊', '飞吻', '鬼脸', '害羞', '口水', '狂哭', '来', '泪眼', '流泪', '生气', '吐舌', '喜欢', '旋转', '再见', '抓狂', '汗', '鄙视', '拜', '吐血', '嘘', '打人', '蹦跳', '变脸', '扯肉', '吃To', '吃花', '吹泡泡糖', '大变身', '飞天舞', '回眸', '可怜', '猛抽', '泡泡', '苹果', '亲', '', '骚舞', '烧香', '睡', '套娃娃', '捅捅', '舞倒', '西红柿', '爱慕', '摇', '摇摆', '杂耍', '招财', '被殴', '被球闷', '大惊', '理想', '欧打', '呕吐', '碎', '吐痰'
                                    ]
                                },
                                {
                                    cls: 'bobo',
                                    url: 'http://img.baidu.com/hi/ldw/w_####.gif',
                                    size: 35,
                                    items: [
                                        '大笑', '瀑布汗~', '惊讶', '臭美', '傻笑', '抛媚眼', '发怒', '我错了', 'money', '气愤', '挑逗', '吻', '怒', '胜利', '委屈', '受伤', '说啥呢？', '闭嘴', '不', '逗你玩儿', '飞吻', '眩晕', '魔法', '我来了', '睡了', '我打', '闭嘴', '打', '打晕了', '刷牙', '爆揍', '炸弹', '倒立', '刮胡子', '邪恶的笑', '不要不要', '爱恋中', '放大仔细看', '偷窥', '超高兴', '晕', '松口气', '我跑', '享受', '修养', '哭', '汗', '啊~', '热烈欢迎', '打酱油', '俯卧撑', '?'
                                    ]
                                }
                            ],
                            init: function(){
                                var tabs = this.option('tabs'),
                                    fn = tabs._fitToContent;
                                tabs._fitToContent = function(){
                                    fn.apply(tabs, arguments);
                                    pop.root().height(tabs.root().height());
                                }
                            },
                            commit: function(e, url){
                                editor.execCommand( 'inserthtml', '<img src="'+url+'" />' );
                                pop.hide();
                            }
                        }).root(),
                        prefix: 'smiley'
                    });
                    pop.toggle(btn.root());
                },
                title:cmdName
            });

            return btn;
        }
    )
})(Zepto,ME.ui)