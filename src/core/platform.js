var YAAK = YAAK || {};

(function() {
    "use strict";

    var kAudioFileTypes,
        audioInst;

    // Constants
    // ---------------------------------------
    kAudioFileTypes = {
        'mp3': 'audio/mpeg;',
        'ogg': 'audio/ogg; codecs="vorbis"',
        'wav': 'audio/wav; codecs="1"',
        'mp4': 'audio/mp4; codecs="mp4a.40.2"'
    };

    // Private
    // ---------------------------------------
    audioInst           = undefined;

    /**
     * Returns the static audio instance
     *
     * @return {HTMLMediaElement?}
     */
    function getAudioInst() {
        if( audioInst === undefined ) {
            audioInst = document.createElement( "audio" );
            if( audioInst == null || !(audioInst.canPlayType instanceof Function) )
                audioInst = null;
        }

        return audioInst;
    }

    // Classes
    // ---------------------------------------

    // Export
    // ---------------------------------------
    YAAK.PLATFORM = {
        /**
         * Determines if the platform supports audio
         *
         * @returns {Boolean}
         */
        canPlayAudio: function() {
            return getAudioInst() != null;
        },

        /**
         * Determines if the platform supports the specified audio file
         *
         * @param   {String}        url
         *
         * @returns {Boolean}
         */
        canPlayAudioFile: function( url ) {
            if( typeof url !== "string" )
                return false;

            return YAAK.PLATFORM.canPlayAudioType(url.substr( url.lastIndexOf('.') + 1 ));
        },

        /**
         * Determines if the platform supports a particular audio file extension
         *
         * @param   {String}        fileExt
         *
         * @returns {Boolean}
         */
        canPlayAudioType: function( fileExt ) {
            var audioInst = getAudioInst(),
                audioTestResult;

            if( audioInst == null )
                return false;

            audioTestResult = audioInst.canPlayType( kAudioFileTypes[fileExt] );
            return ( audioTestResult !== "no" && audioTestResult !== "" );
        },

        /**
         * Determines if the platform supports audio looping
         *
         * @returns {Boolean}
         */
        hasNativeAudioLoop: function() {
            var audioInst = getAudioInst();

            if( audioInst == null )
                return false;

            return (typeof audioInst.loop !== "undefined");
        }
    };
})();
