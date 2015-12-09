// Main function headers
var mode = 'in-round';
var roundNum = 0;
var log = "";




/*
Overall architecture

[ Round updating, health updating ]
[ Animation, action ]
[ Key listeners ]
*/



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
	//if we are done with experiment, save and exit.
	//otherwise, tell animator to reset
	//record data
    roundNum += 1;
	
    //log += '' + $.now() + ',round_update,num=' + roundNum + ',requiredSteps=' + requiredSteps[current].cleanThresh + '\n';
    $('#roundNum').text(roundNum);
    $('#start-round-instructions').fadeIn();
    $('#wrapper').fadeTo(250, 0.4);
    Example2.resetCountdown();
	
	reset_animation();
	increment_health();
	reset_values();
}






/*
 #####
#     # #    # #####  # #    # #    # # #    #  ####
#       #    # #    # # ##   # #   #  # ##   # #    #
 #####  ###### #    # # # #  # ####   # # #  # #
      # #    # #####  # #  # # #  #   # #  # # #  ###
#     # #    # #   #  # #   ## #   #  # #   ## #    #
 #####  #    # #    # # #    # #    # # #    #  ####

#
#        ####   ####  #  ####
#       #    # #    # # #    #
#       #    # #      # #
#       #    # #  ### # #
#       #    # #    # # #    #
#######  ####   ####  #  ####
*/

var total_chiphealth = 9;
var total_sweephealth = 9;
var current_chiphealth = 9;
var current_sweephealth = 9;
var done_melting = false;


var current = 'hammer';
var attack_power = {
	icepick: { chip_thresh: 1, clean_thresh: 3 },
	hammer: { chip_thresh: 3, clean_thresh: 1 },
	pickaxe: { chip_thresh: 2, clean_thresh: 2 }
}

var ice_id = 0;

function increment_health () {
	total_chiphealth += 3;
	total_sweephealth += 3;
}

function reset_values () {
	ice_id = 0;
	alldone = false;
	current_chiphealth = total_chiphealth;
	current_sweephealth = total_sweephealth;
}

function do_action () {
	// Reset for the next one
	if (current_chiphealth <= 0 && current_sweephealth <= 0) {
		current_chiphealth = total_chiphealth;
		current_sweephealth = total_sweephealth;
		ice_id += 1;
	}
	
	if (!alldone) {
		if (current_chiphealth <= 0) current_sweephealth -= attack_power[current].clean_thresh;
		else current_chiphealth -= attack_power[current].chip_thresh;
		
		if (current_chiphealth < 0) current_chiphealth = 0;
		if (current_sweephealth < 0) current_sweephealth = 0;
	}
	
	var alldone = false;
	if (current_chiphealth <= 0 
		&& current_sweephealth <= 0
		&& ice_id == 8) 
		alldone = true;
	
	return {
		iceid: ice_id,
		chip: current_chiphealth/total_chiphealth,
		clean: current_sweephealth/total_sweephealth,
		alldone: alldone
	}
}









/*
   #
  # #   #    # # #    #   ##   ##### #  ####  #    #  ####
 #   #  ##   # # ##  ##  #  #    #   # #    # ##   # #
#     # # #  # # # ## # #    #   #   # #    # # #  #  ####
####### #  # # # #    # ######   #   # #    # #  # #      #
#     # #   ## # #    # #    #   #   # #    # #   ## #    #
#     # #    # # #    # #    #   #   #  ####  #    #  ####
*/


function reset_animation () {
	$('.ice .image .cracks').css('height', '0px');
	$('.ice .image').css('margin-top', '0px');
}


function actionate () {
	get_status = do_action()
	console.log(get_status);
	if (get_status.alldone) return true;
	else {
		var ice = get_status.iceid;
		var current_guy = '.ice:eq(' + ice + ')';
		set_chipped(current_guy, get_status.chip);
		set_cleaned(current_guy, get_status.clean);
	    item_animate(current_guy);
	}
}

function set_chipped (current_guy, percent) {
	var px = (1-percent)*120;
	console.log(px);
	console.log(current_guy);
	$(current_guy + ' .image .cracks').css('height', px + 'px');
}

function set_cleaned (current_guy, percent) {
	var px = (1-percent)*120;
	console.log(px);
	$(current_guy + ' .image').css('margin-top', px + 'px');
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
    	} else if (mode == 'in-round') {
				var alldone = actionate()
				if (alldone) updateRound();
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
