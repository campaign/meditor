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
                if(rng.collapsed){
                    rng.shrinkBoundary();
                    rng.startOffset = rng.startOffset + (dir == 'left' ? -1 : 1);
                    rng.collapse(true);
                    rng.select();
                }else{
                    rng.shrinkBoundary();
                    if(end){
                        rng.endOffset = rng.endOffset + (dir == 'left' ? -1 : 1);
                    }else{
                        rng.startOffset = rng.startOffset + (dir == 'left' ? -1 : 1);
                    }
                    rng.select();
                }
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

