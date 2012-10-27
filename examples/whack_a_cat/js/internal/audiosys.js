/**
 * User: ckhoo
 * Date: 22/10/12
 * Time: 4:42 PM
 *
 * Licensed under the FreeBSD license
 * Copyright (c) 2012, Wappworks Studio
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies,
 * either expressed or implied, of the FreeBSD Project.
 */

var APP = APP || {};

(function(){
    "use strict";

    // Constants
    // ---------------------------------------

    // Private
    // ---------------------------------------

    // Export
    // ---------------------------------------
    function AudioSys(){}

    AudioSys.SOUND = {
        sfxExplosion:   "sfx_explosion",
        musicMain:      "music_sedate",
        musicAlt:       "music_exciting"
    };

    AudioSys.prototype = {
        cache: null,
        channelSfx: null,
        channelMusic: null,

        handleMusic: null,

        /**
         * Initialize the instance
         *
         * @returns {AudioSys}
         */
        init: function() {
            this.cache = new YAAK.AudioCache();
            this.channelSfx = new YAAK.AudioChannel().init( 3, this.cache );
            this.channelMusic = new YAAK.AudioChannel().init( 1, this.cache )
                .setVolume( 0.5 );

            return this;
        },

        /**
         * Load the sounds
         *
         * @returns {AudioSys}
         */
        loadSounds: function() {
            var cache = this.cache;

            cache.addAudio( "sfx_explosion", [
                "audio/explosion_large.ogg",
                "audio/explosion_large.mp3",
                "audio/explosion_large.wav"
            ]);
            cache.addAudio( "music_sedate", [
                "audio/the_field_of_dreams.ogg",
                "audio/the_field_of_dreams.mp3",
                "audio/the_field_of_dreams.wav"
            ]);
            cache.addAudio( "music_exciting", [
                "audio/awesomeness.ogg",
                "audio/awesomeness.mp3",
                "audio/awesomeness.wav"
            ]);

            return this;
        },

        /**
         * Mutes audio
         *
         * @param {Boolean} isMute
         *
         * @return {AudioSys}
         */
        setMute: function( isMute ) {
            this.channelMusic.setMute( isMute );
            this.channelSfx.setMute( isMute );

            return this;
        },

        /**
         * Set the SFX volume
         *
         * @param {Number}  vol
         *
         * @return {AudioSys}
         */
        setVolumeSfx: function( vol ) {
            vol = Math.max( 0, Math.min(1, vol) );
            this.channelSfx.setVolume( vol );

            return this;
        },

        /**
         * Set the SFX volume
         *
         * @param {Number}  vol
         *
         * @return {AudioSys}
         */
        setVolumeMusic: function( vol ) {
            vol = Math.max( 0, Math.min(1, vol) );
            this.channelMusic.setVolume( vol );

            return this;
        },

        /**
         * Return the SFX volume
         *
         * @return {Number}
         */
        getVolumeSfx: function() {
            return this.channelSfx.volume;
        },

        /**
         * Return the music volume
         *
         * @return {Number}
         */
        getVolumeMusic: function() {
            return this.channelMusic.volume;
        },

        /**
         * Return the mute status
         *
         * @return {Boolean}
         */
        isMute: function() {
            // Can sample either channel for mute setting...
            return this.channelSfx.mute;
        },

        /**
         * Play a SFX
         *
         * @param   {String}                id
         *
         * @returns {AudioChannel.Handle}
         */
        playSfx: function( id ) {
            return this.channelSfx.playOneShot( id, 1, true );
        },

        /**
         * Play music
         *
         * @param   {String}                id
         *
         * @returns {AudioChannel.Handle}
         */
        playMusic: function( id ) {
            if( this.handleMusic != null ) {
                // Already playing the desired music? Don't do anything...
                if( this.handleMusic.soundId === id )
                    return this;

                // Let the channel music end the playing music instance
                this.handleMusic = null;
            }

            this.handleMusic = this.channelMusic.playLooped( id, 1, true );
            return this.handleMusic;
        }
    };

    APP.AudioSys = AudioSys;

})();

"use strict";
