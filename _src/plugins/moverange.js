ME.plugins['moverange'] = function(){
    var me = this;
    me.commands['moverange'] = {
        execCommand : function( cmd,dir, end ) {
            var me = this,
                rng = me.selection.getRange(),
                address;
            end = !!end;//false表示移动左边的，true移动右边的
            rng.shrinkBoundary();
            address = rng.createAddress();
            try{
                rng.shrinkBoundary();
                if(rng.collapsed){
                    rng.startOffset += (dir == 'left' ? -1 : 1);
                    rng.collapse(true);
                }else{
                    rng[end?'endOffset':'startOffset'] += (dir == 'left' ? -1 : 1);
                }
                rng.select();
            }catch(e){
                rng.moveToAddress(address).select()
            }
        },
        queryCommandState: function(cmd, dir, end){
            var rng = me.selection.getRange();
            if(rng.collapsed && ((dir == 'left' && end) || (dir=='right' && !end))){
                return -1;
            }
        },
        notNeedUndo:1
    };
};

