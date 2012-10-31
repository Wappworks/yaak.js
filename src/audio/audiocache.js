
var YAAK = YAAK || {};

(function() {
    "use strict";

    // Constants
    // ---------------------------------------

    // Private
    // ---------------------------------------

    // Export
    // ---------------------------------------
    function AudioCache() {
        this.cacheMap = {};
    }

    AudioCache.prototype = {
        cacheMap: null,
        audioErrCb: null,

        /**
         * Add an audio element to the cache
         *
         * @param   {String|Number}                                             id
         * @param   {String|HTMLMediaElement|String[]|HTMLMediaElement[]}       audioIdentifier
         *
         * @returns  {Boolean}          true if successful. false otherwise
         */
        addAudio: function( id, audioIdentifier ) {
            var identifierSize, identifierIndex;

            if( !YAAK.PLATFORM.canPlayAudio() )
                return false;

            if( audioIdentifier instanceof Array ) {
                for( identifierSize = audioIdentifier.length, identifierIndex = 0; identifierIndex < identifierSize; identifierIndex++ ) {
                    if( this.tryAddAudio( id, audioIdentifier[identifierIndex] ) )
                        return true;
                }

                return false;
            }

            return this.tryAddAudio( id, audioIdentifier );
        },

        /**
         * Remove an audio sample from the cache
         *
         * @param {String|Number}   id
         *
         * @return this
         */
        removeAudio: function( id ) {
            if( this.cacheMap.hasOwnProperty(id) )
                delete this.cacheMap[ id ];

            return this;
        },

        /**
         * Returns an element by Id
         *
         * @param   {String|Number} id
         *
         * @returns  {HTMLMediaElement?}
         */
        getAudioElement: function( id ) {
            if( this.cacheMap.hasOwnProperty(id) )
                return this.cacheMap[ id ];

            return null;
        },

        /**
         * Add an audio element to the cache
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {String||HTMLMediaElement}              audioIdentifier
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudio : function( id, audioIdentifier ) {
            if( typeof audioIdentifier === "string" )
                return this.tryAddAudioByUrl( id, audioIdentifier );

            if( audioIdentifier instanceof HTMLMediaElement )
                return this.tryAddAudioByElement( id, audioIdentifier );

            return false;
        },

        /**
         * Add an audio element to the cache by URL
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {String}                                url
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudioByUrl : function( id, url ) {
            var me = this,
                audioInst;

            if( !YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 )) )
                return false;

            audioInst = document.createElement('audio');
            audioInst.src= url;
            audioInst.preload = "auto";
            audioInst.addEventListener( "error", function() {
                me.removeAudio( id );
            } );
            audioInst.load();

            this.cacheMap[ id ] = audioInst;
            return true;
        },

        /**
         * Add an audio element to the cache based on an existing HTMLMediaElement
         * @private
         *
         * @param   {String|Number}                         id
         * @param   {HTMLMediaElement}                      mediaElement
         *
         * @returns  {Boolean}                              true if successful. false otherwise
         */
        tryAddAudioByElement : function( id, mediaElement ) {
            var url = mediaElement.src,
                me = this,
                audioInst;

            if( !YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 )) )
                return false;

            audioInst = document.createElement('audio');
            audioInst.src= url;
            audioInst.preload = "auto";
            audioInst.addEventListener( "error", function() {
                me.removeAudio( id );
            } );

            this.cacheMap[ id ] = audioInst;
            return true;
        }
    };


    YAAK.AudioCache = AudioCache;
})();
