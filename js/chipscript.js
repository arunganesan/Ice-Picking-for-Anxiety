// Main function headers
var mode = 'baseline';
var shrinkTo = 0;
var step = 5;
var doneMelting = false;
var baseline_timer = 0;
var increment = 20;

var current = 'hammer';

var requiredSteps = {
	icepick: {
		chipThresh: 5,
		cleanThresh: 10
	},
	hammer: {
		chipThresh: 10,
		cleanThresh: 5
	},
	pickaxe: {
		chipThresh: 7,
		cleanThresh: 7
	}
}

var currentIce = 0;

var roundNum = 0;
var log = "";



/*

Game Rounds Organization

*/

function do_baseline () {
	$('#wrapper').fadeTo(250, 0.4);
	$('#baseline-instructions').fadeIn();
	Example2.Timer.stop();
	Example2.resetCountdown();
}

function show_game_over () {
  $('#game-over').fadeIn();
  $('#wrapper').fadeTo(250, 0.4);
  $('#results').text(log);
}

function updateRound () {
    roundNum += 1;
    log += '' + $.now() + ',round_update,num=' + roundNum + ',requiredSteps=' + requiredSteps[current].cleanThresh + '\n';
    $('#roundNum').text(roundNum);
    $('#start-round-instructions').fadeIn();
    $('#wrapper').fadeTo(250, 0.4);
    Example2.resetCountdown();
}










/*
Item Animations and shrinking
*/




function doneShrinking () {
	return (shrinkTo >= (requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh));
}


function shrink_and_animate () {
    shrinkTo ++;

		chipThresh = requiredSteps[current].chipThresh;
		cleanThresh = requiredSteps[current].cleanThresh;
		current_guy = '.ice:eq(' + currentIce + ')';

		if (shrinkTo >= chipThresh) {
			//	$(current_guy).addClass("cracks");
			var percent = (shrinkTo-chipThresh)/(cleanThresh);
			var shrinkToPx = percent * 120;
			console.log("shrink to " + shrinkToPx);
			log += '' + $.now() + ',action,shrinkTo='+shrinkTo+',total='+cleanThresh+'\n';
			$(current_guy + ' .image').css('margin-top', (shrinkToPx) + 'px');
			
			if (doneShrinking() && currentIce < 8) {
				currentIce ++;
				shrinkTo = 0;
			}
		} else {
			var partialHeight = (shrinkTo+1)/chipThresh*120;
			$(current_guy + ' .image .cracks').css('height', (partialHeight) + 'px');
		}

    item_animate(current_guy);
}


function item_animate (guy) {
	var pos = $(guy).offset();
	var left_perc = pos.left/$(window).width() * 100;
	var left_difference = 65 - left_perc;
	var top_difference = 500 - pos.top;

	$({deg: 0}).animate({deg: 100}, {
        duration: 50,
        step: function(now) {
            $('#item').css({
							left: '' + (65 - now/100.0*left_difference) + "%",
							top: '' + (500 - now/100.0*top_difference) + "px"
            });
        }
	}).delay(50).animate({deg:0}, {
		duration: 50,
        step: function(now) {
            $('#item').css({
                left: '' + (65 - now/100.0*left_difference) + "%",
								top: '' + (500 - now/100.0*top_difference) + "px"
            });
        }
	});
}





















/*
#     #                    #    #
##   ##   ##   # #    #    #   #  ###### #   #  ####
# # # #  #  #  # ##   #    #  #   #       # #  #
#  #  # #    # # # #  #    ###    #####    #    ####
#     # ###### # #  # #    #  #   #        #        #
#     # #    # # #   ##    #   #  #        #   #    #
#     # #    # # #    #    #    # ######   #    ####

*/

$('body').keyup(function(e) {
    if(e.keyCode == 32){
    	if ($('.instructions').is(':visible') || $('#starttime').is(':visible')) {
    	} else if (mode == 'baseline') {

				shrink_and_animate();

      	if (doneShrinking() && currentIce == 8) {
            baseline_timer = $.now() - baseline_timer;
            var elapsed = baseline_timer/1000.0;
            var rate =((requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh)/elapsed * 20);
            increment = rate * 0.3;
            console.log('' + (requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh) + ' clicks in ' + elapsed + ' seconds. Rate: ' + rate + ' per 20 seconds. Setting to ' + (rate - increment));
            log += '' + $.now()+ ',required_time=' + elapsed + ',rate_per_20=' + rate + ',setting_rate_to=' + (rate - increment) + '\n';
            requiredSteps[current].cleanThresh = rate - increment;
            mode = 'in-round';
            updateRound();
        }
    	} else if (mode == 'in-round') {
				shrink_and_animate();

      	if (shrinkTo >= (requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh)) {
              console.log('' + (requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh) + ' clicks. Increasing to ' + ((requiredSteps[current].cleanThresh + requiredSteps[current].chipThresh) + increment));
              requiredSteps[current].cleanThresh += increment;
              updateRound();
      	}
  		}
    } else if (e.keyCode == 49 || e.keyCode == 50 || e.keyCode == 51) {
        $('.item').removeClass('selected');
        if (e.keyCode == 49) chosen = $('.item')[0];
        if (e.keyCode == 50) chosen = $('.item')[1];
        if (e.keyCode == 51) chosen = $('.item')[2];

				current = chosen.id;
        $(chosen).click();
    }
});


$('.item').click(function() {
	$('.item').removeClass('selected');
	console.log(this);
    $(this).addClass('selected');
    var new_loc = 'url(' + $('img', this).attr('src') + ')';
    console.log(new_loc);

    log += '' + $.now() + ',chosen=' + new_loc + '\n';

    $('#item').css('background-image', new_loc);
});



$('.button img').click(function() {
	var button = this;
    var parent_id = $(button).parent().parent().attr('id');
    $('.instructions').fadeOut();

    if (parent_id != 'game-over') {
        $('#starttime').text("3");
        $('#starttime').fadeIn(250).delay(2500).fadeOut(250);
        setTimeout(function() {$('#starttime').text("2");}, 1000);
        setTimeout(function() {$('#starttime').text("1");}, 2000);
    }

    setTimeout(function () {
        $('#wrapper').fadeTo(250, 1);
        shrinkTo = 0;
        $('#ice').css('clip', 'rect('+(shrinkTo)+'px, 200px, 200px, 0px)');

        if (parent_id == 'start-round-instructions') {
            $('#countdown').show();
            Example2.Timer.play();
            log += '' + $.now() + ',round_start\n';
        } else {
            baseline_timer = $.now();
            log += '' + baseline_timer + ',baseline_start\n';
        }
    }, 3000);
    //$('#wrapper').fadeTo(250, 1);
});


















/**
#######
   #    # #    # ###### #####
   #    # ##  ## #      #    #
   #    # # ## # #####  #    #
   #    # #    # #      #####
   #    # #    # #      #   #
   #    # #    # ###### #    #

######
#     # ###### #        ##   ##### ###### #####
#     # #      #       #  #    #   #      #    #
######  #####  #      #    #   #   #####  #    #
#   #   #      #      ######   #   #      #    #
#    #  #      #      #    #   #   #      #    #
#     # ###### ###### #    #   #   ###### #####

 #####
#     #  ####  #####  ######
#       #    # #    # #
#       #    # #    # #####
#       #    # #    # #
#     # #    # #    # #
 #####   ####  #####  ######
**/


var Example2 = new (function() {

    var $countdown;

    var incrementTime = 70;
    var currentTime = 20*1000; // 5 minutes (in milliseconds)

    $(function() {

        // Setup the timer
        $countdown = $('#countdown');
        Example2.Timer = $.timer(updateTimer, incrementTime, true);

    });

    function updateTimer() {

        // Output timer position
        var timeString = formatTime(currentTime);
        $countdown.html(timeString);

        // If timer is complete, trigger alert
        if (currentTime == 0) {
            Example2.Timer.stop();
            show_game_over ();
            currentTime = 20*1000;
            Example2.resetCountdown();
            return;
        }

        // Increment timer position
        currentTime -= incrementTime;
        if (currentTime < 0) currentTime = 0;

    }

    this.resetCountdown = function() {

        // Get time from form
        var newTime = 20*1000;//parseInt($form.find('input[type=text]').val()) * 1000;
        if (newTime > 0) {currentTime = newTime;}

        // Stop and reset timer
        Example2.Timer.stop().once();
    };
});

// Common functions
function pad(number, length) {
    var str = '' + number;
    while (str.length < length) {str = '0' + str;}
    return str;
}
function formatTime(time) {
    time = time / 10;
    var min = parseInt(time / 6000),
        sec = parseInt(time / 100) - (min * 60),
        hundredths = pad(time - (sec * 100) - (min * 6000), 2);
    return pad(sec, 2);
}


$(document).ready(function() {
	Example2.Timer.stop();
	//setTimeout(do_baseline, 500);
});
