(function(DT){
    /* TeXStream
     *
     * This is a function generator which is used to access tokens.
     * To instantiate it, it takes in the following parameters:
     *
     * tex    -  A string representing the tex of the TeX file to be
     *           compiled.
     * state  -  The parser state. This is a reference, rather than a
     *           copy, so updates to the parser state are reflected
     *           here. The parser state keeps track of important data
     *           such as the catcode database. This data is used to
     *           determine what constitutes the next token, what should
     *           be ignored, etc.
     *
     * To use this function generator after it has been initialized,
     * you simply call .next(), and it will return the next token.
     * You can also provide an argument the argument "repeat", as in
     * stream.next("repeat"), and the index will not be incremented.
     * This is a peek at the next token.
     */
    DT.TeXStream = function*(tex, state){
        var index = 0;
        var passback;
        var oldIndex = 0;
        while(index < tex.length){
            var ch = tex[index];
            var cat = state.catcode(ch);
            var toYield = '';

            if(cat === DT.CATCODE.ESC){
                //read 1 non-letter, or a bunch of letters,
                //followed by any number of spaces, to be thrown away
                //(FIXME need to do this last part)

                var nextChar = tex[++index];

                //take care of the case where the escape is the last
                //character in the document.
                if(typeof(nextChar) === 'undefined'){
                    return {leader: ch, token: '', catcode: cat};
                }

                if(state.catcode(nextChar) !== DT.CATCODE.LETTER){
                    //ignore whitespace following a command
                    while(index < tex.length - 1 && state.catcode(tex[index + 1]) === DT.CATCODE.SPACE){
                        ++index;
                    }

                    toYield = { leader: ch, token: nextChar, catcode: DT.CATCODE.ESC };
                }
                else{
                    //otherwise, it starts with a letter
                    var tk = '';
                    while( index < tex.length && state.catcode(tex[index]) === DT.CATCODE.LETTER){
                        tk += tex[index];
                        ++index;
                    }
                    //index is currently set to the very first non-letter token

                    //ignore whitespace following a command
                    while(index < tex.length - 1 && state.catcode(tex[index]) === DT.CATCODE.SPACE){
                        ++index;
                    }

                    //we're pointing to the start of the next token already.
                    //because we call ++index at the bottom of this loop iteration
                    //we need to subtract 1 from index to avoid skipping over something
                    --index;

                    toYield = {leader: ch, token: tk, catcode: DT.CATCODE.ESC};
                }
            }
            else if(cat === DT.CATCODE.IGNORED){
                continue; //I can do this because I'm using a generator. Hooray!
            }
            else if(cat === DT.CATCODE.OTHER){
                var tk = tex[index];
                if(tk === '<'){
                    toYield = {token: '&lt;', catcode: cat};
                }
                else if(tk === '>'){
                    toYield = {token: '&gt;', catcode: cat};
                }
                else if(tk === '`'){
                    /* Check if it's followed by another tick, because then
                     * we should return a double quote, rather than a single
                     * quote.
                     */
                    if(tex[index + 1] === '`'){
                        ++index;
                        toYield = {token: '"', catcode: cat};
                    }
                   else{
                        toYield = {token: '\'', catcode: cat};
                    }
                }
                else{
                    toYield = {token: tk, catcode: cat};
                }
            }
            else if(cat === DT.CATCODE.COMMENT){
                var output = '';
                while( ++index < tex.length && state.catcode( tex[index] ) !== DT.CATCODE.EOL){
                    output += tex[index];
                }
                toYield = {token: output, catcode: cat };
                --index; //don't eat the newline
            }
           else{
                toYield = {token: ch, catcode: cat};
            }

            if(passback === 'repeat'){
                index = oldIndex;
            }

            passback = yield toYield;

            if(passback === 'repeat'){
                oldIndex = index;
            }

            ++index;
        }

        return {};
    };
})(window.DiscoTeX = window.DiscoTeX || {});

/*
        getOptionalArg: function(){
            if(this.data[this.index] !== "["){
                return;
            }
            else{
                var output = "";
                var ch = "";
                while(ch !== "]"){
                    output += ch;
                    ch = this.data[++this.index];
                }
                ++this.index;

                return output;
            }
        },

        getVerbatim: function(){
            var tk = this.peek();
            if(tk.catcode === DT.CATCODE.ESC){
                tk = this.get();
                return tk.leader + tk.token;
            }
            else if(tk.catcode === DT.CATCODE.BEGIN_GROUP){
                var output = tk.token;

                ++this.index;
                tk = this.peek();
                while(tk.catcode !== DT.CATCODE.END_GROUP){
                    output += this.getVerbatim();
                    tk = this.peek();
                }

                return output + this.get().token;
            }
            else{
                return this.get().token;
            }
        },
*/
