DiscoTeX.addPackage({
    Cmd: {
        'DiscoTeX' : '\\(\\mathrm{Disco\\hspace{-1.7pt}\\TeX}\\)',

        'ifdisco' : { args : 'NN',
            fn : function(args){
                //FIXME make it so the second parameter's errors are ignored
                //Maybe do this with a coroutine and suspending warning logs between the second parameter?
                return args[0];
            }
        },

        'dtcollapsible' : { args : '',
            fn : function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'collapsible');
                return '';
            }
        },

        'dtnocollapse' : { args : '',
            fn : function(){
                return '';
            }
        },

        'dtstartcollapsed' : { args : '',
            fn : function(){
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'collapsible');
                this.state.setEnvironmentData(this.state.getEnvironmentID(), 'start-collapsed');

                return '';
            }
        },

        /* Embed a youtube video.
         * Parameters:
         *  - * optional, turns on autoplay
         *  - videoId
         */
        'dtyoutube' : { args : '*N',
            inParagraph: false,
            fn : function(args){
                return '<iframe id="ytplayer" type="text/html" width="560" height="390" src="http://www.youtube.com/embed/' + args[1] + '?autoplay=' + (args[0] ? '1' : '0') + '" frameborder="0"></iframe>';
            }
        },

        'dttweet' : { args : 'NN',
            inParagraph: false,
            fn : function(args){
                return '<iframe border=0 frameborder=0 height=250 width=550 src="http://twitframe.com/show?url=https%3A%2F%2Ftwitter.com%2F' +  + args[0] + '%2Fstatus%2F' + args[1] + '"></iframe>';
            }
        }
    },
    Env: {
        'disco' : {
            internalParagraphs: false,
            parse: function(eid, args, content){
                return '<!-- Begin disco environment -->\n' + content.replace(/&gt;/g,'>').replace(/&lt;/g,'<').trim() + '\n<!-- End disco environment -->';
            }
        },

        /* FOR TESTING PURPOSES ONLY */
        'proof': {
            args: 'O',
            begin: function(eid, args){
                return '<dt-proof' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + '<!--envid:' + eid + '-->>';
            },

            end: function(){
                return '</dt-proof>';
            }
        },

        'theorem': {
            args: ['O'],
            begin: function(eid, args){
                return '<dt-theoremlike class="theorem"' + (typeof(args[0]) !== 'undefined' ? ' name="' + args[0] + '"' : '') + ' number="2" <!--envid:' + eid + '-->>';
            },

            end: function(){
                return '</dt-theoremlike>';
            }
        }
    },
    Classes: {
    }
});
