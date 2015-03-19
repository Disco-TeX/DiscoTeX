/* This is not the LaTeX package, but I don't know where these things are supposed to go, so I'm putting them here. */



DiscoTeX.addPackage({
    Cmd : {

    },
    Env : {
        'theorem': {
            args: ['O'],
            begin: function(eid, args){
                return '<dt-theoremlike class="theorem"' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + ' number="2" <!--envid:' + eid + '-->>';
            },

            end: function(){
                return '</dt-theoremlike>';
            }
        },

        'lemma': {
            args: ['O'],
            begin: function(eid, args){
                return '<dt-theoremlike class="lemma"' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + ' number="2" <!--envid:' + eid + '-->>';
            },

            end: function(){
                return '</dt-theoremlike>';
            }
        },

        'proof': {
            args: ['O'],
            begin: function(eid, args){
                return '<dt-proof' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + '<!--envid:' + eid + '-->>';
            },

            end: function(){
                return '</dt-proof>';
            }
        },

        'definition': {
            args: ['O'],
            begin: function(eid, args){
                return '<dt-theoremlike class="definition"' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + ' number="2">';
            },

            end: function(){
                return '</dt-theoremlike>';
            }
        }
    }
});
