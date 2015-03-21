(function(DT){    
    /* Scope:
     *
     * An internal class representing data which depends
     * on the current scope. As you add and remove braces
     * We push and pop a stack of Scopes().
     */
    var Scope = function(){
        this.defer = [];
    };

    /* State:
     *
     * The main object representing the state of the parser.
     * It has many many flags that change as we read through
     * the document.
     */
    DT.State = function(){
        /* Sometimes we need to track category codes of characters
         * and this database keeps track of those changes. See
         * also these functions:
         *   - catcode()
         *   - setCatcode()
         *   - resetCatcodes()
         */
        this.catcodeDB = {};

        /* We need to track internal variables and counters. We
         * store them here.
         */
        this.counter = {
            'section': 0,
            'subsection': 0,
            'subsubsection': 0
        };
        this.vars = {};


        /* ENVIRONMENTS:
         *
         * We need a stack consistsing of the environments the
         * parser is currently inside of.
         */
        this.environmentStack = [];
        /*
         * Every time we see a new environment, we give it an ID
         * and add a spot in an array for data it carries. This
         * way, we can go back and fill in the data hole we left
         * behind.
         */
        this.environmentData = [];

        /* Does the document have a table of contents? */
        this.hasTOC = false;

        this.paragraph = {};
        /* Determining when to start a new paragraph, when to
         * ignore paragraph rules, etc. is a complicated task.
         * We use the following boolean flags to help us keep
         * track of what to do.
         */
        this.paragraph.lastWasEOL = false;
        /*              -  Tracks whether or not the last seen
         *                 character was an EOL character.
         */
        this.paragraph.seenNonEOL = false;
        /*              -  Keeps track of, since we started a
         *                 new paragraph, if we have read in a
         *                 character which is not an EOL.
         */
        this.paragraph.inside = false;
        /*              -  Are we currently in the middle of a
         *                 paragraph?
         */
        this.paragraph.ignore = false;
        /*              -  Should we even bother considering
         *                 the paragraph rules?
         */


        this.scopeStack = [];
        this.labelStack = [];
        this.labels = {};
        this.labelsReversed = {};
    }

    DT.State.prototype = {
        //scope stuff
        getScope: function(){
            return this.scopeStack[this.scopeStack.length - 1];
        },

        popScope: function(){
            return this.scopeStack.pop();
        },

        pushScope: function(){
            this.scopeStack.push(new Scope());
            return this.getScope();
        },

        //environment stuff
        getEnvironment: function(){
            return this.environmentStack[this.environmentStack.length - 1];
        },

        popEnvironment: function(){
            return this.environmentStack.pop();
        },

        pushEnvironment: function(_name, env){
            /* Push an environment onto the environment stack, and log
             * the environment for data storage and later retrieval.
             *
             * Returns the environment id number for data access.
             */
            this.environmentStack.push({name: _name, environment: env, itemCount: 0, eid: this.environmentData.length});
            this.environmentData.push({ attr: [], pairs: {} });
        },

        getEnvironmentID: function(){
            /* Returns the environmentID of the top environment on the stack */
            return this.environmentStack[this.environmentStack.length - 1].eid;
        },
        
        setEnvironmentData: function(eid, key, value){
            if(typeof(value) === 'undefined'){
                this.environmentData[eid].attr.push(key);
            }
            this.environmentData[eid].pairs[key] = value;
        },

        getEnvironmentData: function(eid, key){
            return this.environmentData[eid].pairs[key];
        },

        addDefer: function(d){
            this.scopeStack[this.scopeStack.length - 1].push(d);
        },

        //seciton label stuff

        pushSectionLabel: function(){
            var lbl = this.labelStack[this.labelStack.length - 1];
            while(this.labelStack.length > 0 && lbl.type !== 'environment'){
                this.labelStack.pop();
                lbl = this.labelStack[this.labelStack.length - 1];
            }
            ++this.counter['section'];
            this.counter['subsection'] = 0;
            this.counter['subsubsection'] = 0;
            this.labelStack.push({type: 'sec', label: this.getSectionString(0) });
        },

        pushSubsectionLabel: function(){
            var lbl = this.labelStack[this.labelStack.length - 1];
            while(this.labelStack.length > 0 && lbl.type !== 'environment' && lbl.type !== 'section'){
                this.labelStack.pop();
                lbl = this.labelStack[this.labelStack.length - 1];
            }

            ++this.counter['subsection'];
            this.counter['subsubsection'] = 0;
            this.labelStack.push({type: 'sec', label: this.getSectionString(1) });
        },

        pushSubsubsectionLabel: function(){
            var lbl = this.labelStack[this.labelStack.length - 1];
            while(this.labelStack.length > 0 && lbl.type !== 'environment' && lbl.type !== 'section' && lbl.type !== 'subsection'){
                this.labelStack.pop();
                lbl = this.labelStack[this.labelStack.length - 1];
            }
            ++this.counter['subsubsection'];
            this.labelStack.push({type: 'sec', label: this.getSectionString(2) });
        },

        getSectionString: function(lvl){
            var arr = ['section', 'subsection', 'subsubsection'];
            var out = []
            for(var i = 0; i <= lvl; ++i){
                out.push(this.counter[ arr[i] ]);
            }
            return out.join('_');
        },

        registerLabel: function(lbl){
            var top = this.labelStack[this.labelStack.length - 1];
            var serializedLabelStackTop = top.type + ':' + top.label;
            this.labels[ serializedLabelStackTop ] = lbl;
            this.labelsReversed[ lbl ] = serializedLabelStackTop;
        },

        /* Restore the LaTeX default character codes. */
        resetCatcodes: function(){
            this.catcodeDB = {};
        },

        /* Make a change to the character codes. Regardless
         * of the change, we add it to the database. So if the
         * change we make actually is the same as the default,
         * we still store it.
         */
        setCatcode: function(ch, val){
            if(typeof(ch) === 'string'){
                //passed in a single character
                this.catcodeDB[ch] = val;
                return;
            }
            else if(typeof(ch) === 'object'){
                //passed in an array of characters, all to get the same value
                ch.forEach(function(el){
                    this.catcodeDB[el] = val;
                }, this);
            }
        },

        /* Lookup the catcode for a character. We do this by first
         * looking in the built database (stored as catcodeDB). If
         * we don't find it, then we simply return one of the LaTeX
         * defaults.
         */
        catcode: function(ch){
           if(typeof(this.catcodeDB[ch]) !== "undefined"){
                return this.catcodeDB[ch];
            }

            //use the LaTeX defualts
            return DT.CATCODE.default(ch);
        }
     }
})(window.DiscoTeX = window.DiscoTeX || {});
