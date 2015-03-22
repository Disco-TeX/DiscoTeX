(function(DT){
    /* TeXStream
     *
     * This object is used to get tokens from the TeX input. To
     * instantiate it, it takes in the following parameters:
     *
     * tex    -  A string representing the tex of the TeX file to be
     *           compiled.
     * state  -  The parser state. This is a reference, rather than a
     *           copy, so updates to the parser state are reflected
     *           here. The parser state keeps track of important data
     *           such as the catcode database. This data is used to
     *           determine what constitutes the next token, what should
     *           be ignored, etc.
     */
    DT.TeXStream = function(tex, state){
        this.index = -1; //points to the last character to be read in. thus, it starts pointing before the stream
        this.tex = tex;
        this.state = state;
    };

    DT.TeXStream.prototype = {
        peek: function(){
            if(this.eof()){
                return null;
            }

            var oldIndex = this.index;
            var token = this.next();
            this.index  = oldIndex;
            return token;
        },

        next: function(){
            if(this.eof()){
                return null;
            }

            var ch = this.tex[++this.index];
            var cat = this.state.catcode(ch);

            if(cat === DT.CATCODE.ESC){
                //read 1 non-letter, or a bunch of letters,
                //followed by any number of spaces, to be thrown away

                var nextChar = this.tex[++this.index];

                //take care of the case where the escape is the last
                //character in the document.
                if(typeof(nextChar) === 'undefined'){
                    return { leader: ch, token: '', catcode: cat };
                }

                if(this.state.catcode(nextChar) !== DT.CATCODE.LETTER){
                    //ignore whitespace following a command
                    while(this.index < this.tex.length - 1 && this.state.catcode(this.tex[this.index + 1]) === DT.CATCODE.SPACE){
                        ++this.index;
                    }

                    return { leader: ch, token: nextChar, catcode: DT.CATCODE.ESC };
                }
                else{
                    //otherwise, it starts with a letter
                    var tk = '';
                    while( this.index < this.tex.length && this.state.catcode(this.tex[this.index]) === DT.CATCODE.LETTER){
                        tk += this.tex[this.index];
                        ++this.index;
                    }
                    //index is now set to the very first non-letter token

                    //ignore whitespace following a command
                    while(this.index < this.tex.length - 1 && this.state.catcode(this.tex[this.index]) === DT.CATCODE.SPACE){
                        ++this.index;
                    }

                    //we're pointing to the start of the next token already.
                    //because we call ++index at the bottom of this loop iteration
                    //we need to subtract 1 from index to avoid skipping over something
                    --this.index;

                    return {leader: ch, token: tk, catcode: DT.CATCODE.ESC};

                }
            }
            else if(cat === DT.CATCODE.IGNORED){
                return this.next();
            }
            else if(cat === DT.CATCODE.OTHER){
                if(ch === '<'){
                    return { token: '&lt;', catcode: cat };
                }
                else if(ch === '>'){
                    return { token: '&gt;', catcode: cat };
                }
                else if(ch === '`'){
                    /* Check if it's followed by another tick, because then
                     * we should return a double quote, rather than a single
                     * quote.
                     */
                    if(this.tex[this.index + 1] === '`'){
                        ++this.index;
                        return { token: '&ldquo;', catcode: cat };
                    }
                    else{
                        return { token: '&lsquo;', catcode: cat };
                    }
                }
                else if(ch === '\''){
                    /* Check if it's followed by another tick, because then
                     * we should return a double quote, rather than a single
                     * quote.
                     */
                    if(this.tex[this.index + 1] === '\''){
                        ++this.index;
                        return { token: '&rdquo;', catcode: cat };
                    }
                    else{
                        return { token: '&rsquo;', catcode: cat };
                    }
                }
                else{
                    return { token: ch, catcode: cat };
                }
            }
            else if(cat === DT.CATCODE.COMMENT){
                var output = '';
                while( ++this.index < this.tex.length && this.state.catcode( this.tex[this.index] ) !== DT.CATCODE.EOL){
                    output += this.tex[this.index];
                }
                --this.index; //don't consume the newline character
                return { token: output, catcode: cat };
            }
            else{
                return { token: ch, catcode: cat };
            }
        },

        eof: function(){
            return this.index >= this.tex.length - 1; //if it's pointing to the last character, then we're already done.
        }
    };
})(window.DiscoTeX = window.DiscoTeX || {});
