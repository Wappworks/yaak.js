/**
 * User: ckhoo
 * Date: 22/10/12
 * Time: 5:26 PM
 *
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

(function(){

    var kCanvasSize,

        kAssetDefs,

        kVfxNukeAnim,
        kVfxNukeAnimFrameMs,
        kVfxNukeAnimDurationMs,
        kVfxNukeAnimAnchorPos,
        kVfxNukeAnimScale,
        kKittyAnchorPos,
        kKittyHotSpot,
        kKittySpawnDef,

        director,
        audioSys,
        sceneGame,
        containerGameActors,
        spriteImageVfxNuke,
        spriteImageKitty,
        spriteImageSoundPanel,

        kittyAliveCount;

    // Constants
    // ---------------------------------------
    kCanvasSize     = { x: 800, y: 600 };

    kAssetDefs = {
        images: [
            {   id: "kitty",            url: "images/kitty.png"         },
            {   id: "background",       url: "images/bkgdroom.png"      },
            {   id: "soundpanel",       url: "images/soundpanel.png"    },
            {   id: "vfxnuke",          url: "images/vfxnuke.png"       }
        ],

        imageDefs: {
            soundpanel: {
                uiempty: {
                    x: 163,
                    y: 121,
                    width:  50,
                    height: 50
                }
                ,
                uihilight: {
                    x: 0,
                    y: 121,
                    width:  59,
                    height: 59
                }
                ,
                soundoff: {
                    x: 59,
                    y: 121,
                    width:  52,
                    height: 52
                }
                ,
                soundon: {
                    x: 111,
                    y: 121,
                    width:  52,
                    height: 52
                }
                ,
                soundpanel: {
                    x: 0,
                    y: 0,
                    width:  247,
                    height: 121
                }
            }
        }
    };

    kVfxNukeAnim    = [
        0,  1,  2,  3,  4,  5,  6,  7,  8,  9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49
    ];
    kVfxNukeAnimFrameMs     = 1000 / 30;
    kVfxNukeAnimDurationMs  = kVfxNukeAnim.length * kVfxNukeAnimFrameMs;
    kVfxNukeAnimAnchorPos   = { x: 0.5, y: 0.9 };
    kVfxNukeAnimScale       = 2;

    kKittyAnchorPos     = { x: 0.45, y: 0.95 };
    kKittyHotSpot       = { x: 42, y: 15, w: 56, h:76 };
    kKittySpawnDef      = {
        spawnRect:          { x: 50, y: 150, w: kCanvasSize.x - 50 - 50, h: kCanvasSize.y - 150 - 20 },
        spawnDelayMinMs:    250,
        spawnDelayRangeMs:  750,
        lifeMinMs:          1000,
        lifeRangeMs:        3000,

        aliveMax:           8
    };

    // Private
    // ---------------------------------------
    director                = null;
    audioSys                = null;
    sceneGame               = null;
    containerGameActors     = null;

    spriteImageVfxNuke      = null;
    spriteImageKitty        = null;

    kittyAliveCount         = 0;

    // Kitty class
    // ---------------------------------------
    /**
     * Kitty actor
     * @extends CAAT.ActorContainer
     * @constructor
     *
     * @returns {Kitty}
     */
    function Kitty() {
        return Kitty.superclass.constructor.apply( this, arguments );
    }

    Kitty.prototype = {
        counted: false,

        /**
         * Initializes the instance
         * @return {Kitty}
         */
        init: function() {
            var hotSpotActor;

            // Set up the primary actor...
            this.setBackgroundImage( spriteImageKitty )
                .setGlobalAnchor( kKittyAnchorPos.x, kKittyAnchorPos.y )
                .enableEvents( true )
                .setDiscardable( true );

            // Set up the clickable hot spot...
            hotSpotActor = new CAAT.Actor()
                .setBounds( kKittyHotSpot.x, kKittyHotSpot.y, kKittyHotSpot.w, kKittyHotSpot.h );
            hotSpotActor.mouseDown = function( event ) {
                var kittyParent = this.parent;

                kittyParent.setExpired( true );
                spawnNuke( kittyParent.x, kittyParent.y );
            };
            this.addChild( hotSpotActor );

            kittyAliveCount++;
            this.counted = true;

            return this;
        },

        /**
         * Overriden set expired parent function
         *
         * @param   {Number}    timeMs
         *
         * @returns {Kitty}
         */
        setExpired: function( timeMs ) {
            Kitty.superclass.setExpired.apply( this, arguments );

            if( this.counted && this.expired ) {
                this.counted = false;
                kittyAliveCount--;
            }
        }
    };

    /**
     * Randomly spawn a kitty if possible
     *
     * @return {Boolean}
     */
    Kitty.spawnRandom = function() {
        var spawnRect   = kKittySpawnDef.spawnRect,
            kitty;

        if( kittyAliveCount >= kKittySpawnDef.aliveMax )
            return false;

        kitty = new Kitty().init();
        kitty.setPosition( spawnRect.x + (Math.random() * spawnRect.w), spawnRect.y + (Math.random() * spawnRect.h) )
            .setFrameTime( sceneGame.time, kKittySpawnDef.lifeMinMs + (Math.random() * kKittySpawnDef.lifeRangeMs) );

        containerGameActors.addChild( kitty );

        return true;
    };

    YAAK.Object.extend( Kitty, CAAT.ActorContainer );

    // Private
    // ---------------------------------------
    function start() {
        var sceneIntro;

        // Set up the director
        director = new CAAT.Director()
            .initialize( kCanvasSize.x, kCanvasSize.y );
        director.enableResizeEvents( director.RESIZE_PROPORTIONAL );

        // Set up the intro scene
        sceneIntro = director.createScene();
        sceneIntro.addChild(
            new CAAT.Actor()
                .setBackgroundImage( document.getElementById("imgtitle") )
                .setGlobalAnchor( 0.5, 0.5 )
                .setPosition( kCanvasSize.x * 0.5, kCanvasSize.y * 0.5 )
        );

        // Initialize the audio system
        audioSys = new APP.AudioSys()
            .init()
            .loadSounds();

        // Load the images and trigger the game based on the image load completion
        var imagePreloader = new CAAT.ImagePreloader();
        imagePreloader.loadImages(
            kAssetDefs.images,
            function( counter, images ) {
                // Wait for the load to complete
                if( counter < images.length )
                    return;

                director.setImagesCache( images );
                enterGame();
            }
        );

        CAAT.loop();
    }

    function enterGame() {
        initGame();
        scheduleNextKittySpawn();
    }

    function initGame() {
        // Set up the sprite image masters...
        spriteImageVfxNuke = new CAAT.SpriteImage()
            .initialize( director.getImage("vfxnuke"), 5, 10 );
        spriteImageKitty = new CAAT.SpriteImage()
            .initialize( director.getImage("kitty"), 1, 1 );
        spriteImageSoundPanel = new CAAT.SpriteImage()
            .initializeFromMap( director.getImage("soundpanel"), kAssetDefs.imageDefs.soundpanel );

        // Create the game scene
        sceneGame = director.createScene();

        // Set up the game actor container (and the background)
        containerGameActors = createActorContainerSortY()
            .setBackgroundImage(
                new CAAT.SpriteImage()
                    .initialize( director.getImage("background"), 1, 1 )
                    .setSpriteTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE )
            )
            .setBounds( 0, 0, kCanvasSize.x, kCanvasSize.y );
        sceneGame.addChild( containerGameActors );

        // Set up the sound control panel
        sceneGame.addChild(
            createSoundControlPanel()
                .setPositionAnchored( sceneGame.width - 5, 5, 1, 0 )
        );

        // Switch to the game scene and turn on the music
        director.setScene( director.getSceneIndex(sceneGame) );
        audioSys.playMusic( APP.AudioSys.SOUND.musicMain );
    }

    function actorSortByY( actor1, actor2 ) {
        // Sort in ascending y-order
        return actor1.y - actor2.y;
    }

    function createActorContainerSortY() {
        var container = new CAAT.ActorContainer(),
            fnPaintActorPrev = container.paintActor;

        // Override the scene's paint actor so that actor's are drawn sorted by y-coordinates...
        container.paintActor = function(director, time ) {
            var actor,
                actorList,
                actorNum, actorIndex, actorLast;

            if( this.activeChildren != null ) {
                // Build up the actor list...
                actorList = [];
                for( actor = this.activeChildren; actor; actor = actor.__next )
                    actorList.push( actor );

                // Sort the list...
                actorList.sort( actorSortByY );

                // Rebuild the active actor linked list...
                actor               = actorList[ 0 ];
                this.activeChildren = actor;
                actorLast           = actor;
                for( actorNum = actorList.length, actorIndex = 1; actorIndex < actorNum; actorIndex++ ) {
                    actor               = actorList[ actorIndex ];
                    actorLast.__next    = actor;
                    actorLast           = actor;
                }

                actorLast.__next = null;
            }

            return fnPaintActorPrev.apply( this, arguments );
        };

        return container;
    }
    function scheduleNextKittySpawn() {
        var spawnDelayMs = ( kKittySpawnDef.spawnDelayMinMs + (Math.random() * kKittySpawnDef.spawnDelayRangeMs) ) >> 0;  // rounding trick

        setTimeout( function(){
            Kitty.spawnRandom();
            scheduleNextKittySpawn();
        }, spawnDelayMs );
    }

    function spawnNuke( x, y ) {
        var nukeActor;

        // Set up the visuals
        nukeActor = new CAAT.Actor()
            .setBackgroundImage(
            spriteImageVfxNuke.getRef()
                .setAnimationImageIndex( kVfxNukeAnim )
                .setChangeFPS( kVfxNukeAnimFrameMs )

        )
            .setGlobalAnchor( kVfxNukeAnimAnchorPos.x, kVfxNukeAnimAnchorPos.y )
            .setScale( kVfxNukeAnimScale, kVfxNukeAnimScale )
            .setPosition( x, y )
            .enableEvents( false )
            .setDiscardable( true )
            .setFrameTime( sceneGame.time, kVfxNukeAnimDurationMs );

        containerGameActors.addChild( nukeActor );

        // Set up the audio
        audioSys.playSfx( APP.AudioSys.SOUND.sfxExplosion );
    }

    function createSoundControlPanel() {
        var panelActor,
            btnMuteActor;

        // Create the panel actor
        panelActor = new CAAT.ActorContainer()
            .setBackgroundImage(
                spriteImageSoundPanel.getRef()
                    .setSpriteIndex( "soundpanel" )
            );

        // Set up the mute button actor
        btnMuteActor = new CAAT.Actor()
            .setBackgroundImage(
                spriteImageSoundPanel.getRef()
                    .setSpriteIndex( audioSys.isMute() ? "soundoff" : "soundon" )
            )
            .setGlobalAnchor( 0.5, 0.5 )
            .setPosition( 202, 59 );

        panelActor.addChild( btnMuteActor );

        // Set up mute controls
        panelActor.addChild(
            createUiHotSpotActor( 50, 50, function(){
                    var mute = !audioSys.isMute();

                    audioSys.setMute( mute );
                    btnMuteActor.setSpriteIndex( mute? "soundoff" : "soundon" );
                })
                .setPosition( 203, 60 )
        );

        // Set up alternate music controls
        panelActor.addChild(
            createUiHotSpotActor( 76, 38, function(){
                    var musicIdCurr = audioSys.handleMusic == null ? "blah" : audioSys.handleMusic.soundId;
                    audioSys.playMusic( musicIdCurr === APP.AudioSys.SOUND.musicMain ? APP.AudioSys.SOUND.musicAlt : APP.AudioSys.SOUND.musicMain );
                })
                .setPosition( 50, 79 )
        );

        // Set up SFX volume controls
        panelActor.addChild(
                createUiHotSpotActor( 36, 36, function(){
                        audioSys.setVolumeSfx( audioSys.getVolumeSfx() - 0.1 );
                    })
                    .setPosition( 117, 37 )
            )
            .addChild(
                createUiHotSpotActor( 36, 36, function(){
                        audioSys.setVolumeSfx( audioSys.getVolumeSfx() + 0.1 );
                    })
                    .setPosition( 153, 37 )
            );

        // Set up music volume controls
        panelActor.addChild(
                createUiHotSpotActor( 36, 36, function(){
                        audioSys.setVolumeMusic( audioSys.getVolumeMusic() - 0.1 );
                    })
                    .setPosition( 117, 78 )
            )
            .addChild(
                createUiHotSpotActor( 36, 36, function(){
                        audioSys.setVolumeMusic( audioSys.getVolumeMusic() + 0.1 );
                    })
                    .setPosition( 153, 78 )
            );
        return panelActor;
    }

    function createUiHotSpotActor( width, height, cbActivate ) {
        return new CAAT.Actor()
            .setAsButton(spriteImageSoundPanel.getRef(), "uiempty", "uiempty", "uihilight", "uiempty", cbActivate )
            .setImageTransformation( CAAT.SpriteImage.prototype.TR_FIXED_TO_SIZE )
            .setSize( width, height )
            .setGlobalAnchor( 0.5, 0.5 );
    }
    // APP Entry
    // ---------------------------------------
    /**
     * Callback function when the web page finishes loading
     */
    function onPageLoad() {
        window.removeEventListener( "load", onPageLoad, false );
        start();
    }

    if( document.readyState === "complete" )
        start();
    else
        window.addEventListener( "load", onPageLoad, false );
})();