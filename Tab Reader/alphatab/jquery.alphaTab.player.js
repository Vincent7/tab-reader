/*
 * This file is part of alphaTab.
 *
 *  alphaTab is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  alphaTab is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with alphaTab.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * This is a plugin which extends alphaTab with a java midi player.
 */
(function(alphaTabWrapper)
{
    alphaTabWrapper.fn.player = function(playerOptions) {
        var self = this;
        var defaults = {
            player: false,
            playerTickCallback: null,
            createControls: true,
            caret: true,
            measureCaretColor: '#FFF200',
            measureCaretOpacity: 0.25,
            beatCaretColor: '#4040FF',
            beatCaretOpacity: 0.25,
            autoScroll: true,
            language: {play: "Play", pause: "Pause", stop: "Stop", metronome: "Metronome"}
        };

        var playerOptions = $.extend(defaults, playerOptions);
        
        //
        // API Functions
        //        
        this.updatePlayer = function(song)
        {
            self.updateCaret(0);
        }
        this.loadCallbacks.push(this.updatePlayer);

        this.updateCaret = function(tickPos)
        {
            setTimeout(function(){
                    self.tablature.notifyTickPosition(tickPos);
                }, 1);
        }
        
        var pos = 960;
        var tid = null;
		var speed = 1.0;
		var startat = 0.0;
 
        this.play = function() {
            var interval = Math.floor((60.0 / self.tablature.track.song.tempo) * 1000) * (1/speed);
            tid = setInterval(function() {
                pos = pos + 960;
				if ( pos < 960 ) {
					eval('' + playerOptions.playerTickCallback + '(960)');
				}
				else {
					eval('' + playerOptions.playerTickCallback + '(' + pos + ')');
				}
            }, interval);
        }
    
        this.pause = function() {
            if( tid != null ) {
                clearInterval(tid);
                tid = null;
            }
        }

        this.stop = function() {
            if( tid != null ) {
                clearInterval(tid);
                tid = null;
            }
			pos = 960 + 960*startat;
			if( pos > 0 ) {
				self.updateCaret(pos);
			}
			else {
				self.updateCaret(0);
			}
        }
        
		this.setSpeed = function(theSpeed) {
			speed = theSpeed;	
		}
 
		this.setStartAt = function(theStartAt) {
			if( pos == (960 + 960*startat) ) {
				pos = 960 + 960*theStartAt;
			}
			else {
				if(theStartAt > startat) {
					pos = pos + 960*0.5;
				}
				else {
					pos = pos + 960*(-0.5);
				}
			}
			if( pos > 0 ) {
				self.updateCaret(pos);
			}
			else {
				self.updateCaret(0);
			}
			startat = theStartAt;
		}	
 
        // create carets
        if(playerOptions.caret)
        {
            var measureCaret = $('<div class="measureCaret"></div>');
            var beatCaret = $('<div class="beatCaret"></div>');
            // set styles
            measureCaret.css({ 'opacity' : playerOptions.measureCaretOpacity, 'position' : 'absolute', background: playerOptions.measureCaretColor });
            beatCaret.css({ 'opacity' : playerOptions.beatCaretOpacity, 'position' : 'absolute', background: playerOptions.beatCaretColor });
            measureCaret.width(0);
            beatCaret.width(0);
            measureCaret.height(0);
            beatCaret.height(0);
            this.el.append(measureCaret);
            this.el.append(beatCaret);
        }

        this.tablature.onCaretChanged = function(beat)
        {
            var x = $(self.canvas).offset().left + parseInt($(self.canvas).css("borderLeftWidth"), 10) ;
            var y = $(self.canvas).offset().top;

            y += beat.measureImpl().posY;
 
            measureCaret.offset({ top: y, left: x + beat.measureImpl().posX});
            measureCaret.width(beat.measureImpl().width + beat.measureImpl().spacing);
            measureCaret.height(beat.measureImpl().height());

            beatCaret.offset({top: y, left: x + beat.getRealPosX(self.tablature.viewLayout)});
            beatCaret.width(3);
            beatCaret.height(measureCaret.height());

            if(beat.measureImpl().isFirstOfLine && playerOptions.autoScroll)
            {
                window.scrollTo(0, y - 30);
            }
        }
        
        // load current song 
        if(this.tablature.track != null)
        {
            this.updatePlayer(this.tablature.track.song);
        } 
        
        return this;
    }

})(alphaTabWrapper);
