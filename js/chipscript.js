// Main function headers
var mode = 'baseline';
var roundNum = 0;
var log = [{'game': 'chip'}];

$(window).ready(function() {
	var $_GET=[];
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(a,name,value){$_GET[name]=value;});
	console.log("Starting chip game with baseline " + $_GET['baseline']);
});

function add_to_log (obj) {
	obj['timestamp'] = $.now();
	log.push(obj);
}

/*
Overall architecture

[ Round updating, health updating ]
[ Animation, action ]
[ Key listeners ]
*/



/**
 #####                          ######
#     #   ##   #    # ######    #     #  ####  #    # #    # #####   ####
#        #  #  ##  ## #         #     # #    # #    # ##   # #    # #
#  #### #    # # ## # #####     ######  #    # #    # # #  # #    #  ####
#     # ###### #    # #         #   #   #    # #    # #  # # #    #      #
#     # #    # #    # #         #    #  #    # #    # #   ## #    # #    #
 #####  #    # #    # ######    #     #  ####   ####  #    # #####   ####
*/

var baseline_timer;
var roundtime = 20*1000;


function do_pregame () {
	$('#wrapper').fadeTo(250, 0.4);
	$('#pregame-instructions').fadeIn();
	Example2.Timer.stop();
	Example2.resetCountdown();
}


function do_baseline () {
	$('#wrapper').fadeTo(250, 0.4);
	$('#baseline-instructions').fadeIn();
	Example2.Timer.stop();
	Example2.resetCountdown();
}

function show_game_over () {
  $('#game-over').fadeIn();
  $('#wrapper').fadeTo(250, 0.4);
  var json = JSON.stringify(log);
  $('#results').text(json);
  
  $.ajax({
    type: "POST",
    url: "http://arunganesan.com/anxiety-study/submit.php",
    data: "state=" + json,
    dataType: "text"
  });
}

function updateRound () {
	//if we are done with experiment, save and exit.
	//otherwise, tell animator to reset
	//record data
    roundNum += 1;
	

	$('#roundNum').text(roundNum);
    $('#start-round-instructions').fadeIn();
    $('#wrapper').fadeTo(250, 0.4);
    Example2.resetCountdown();
	
	reset_animation();
	increment_health();
	reset_values();

    add_to_log({
		'state': 'update round',
		'round num': roundNum,
		'new health': total_chiphealth
	});
}

function startRounds () {
    roundNum = 1;

	
	var end_of_baseline = $.now();
	var time_elapsed = end_of_baseline - baseline_timer;
	roundtime = time_elapsed;
	console.log(roundtime);
	
	$('#roundNum').text(roundNum);
    $('#start-round-instructions').fadeIn();
    $('#wrapper').fadeTo(250, 0.4);
    Example2.resetCountdown();
	
	reset_animation();
	reset_health();
	reset_values();
	
	add_to_log({
		'state': 'starting rounds',
		'round num': roundNum,
		'starting health': total_chiphealth
	});
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

var total_chiphealth = 16;
var total_sweephealth = 16;
var current_chiphealth = 16;
var current_sweephealth = 16;
var done_melting = false;


var current = 'hammer';
var attack_power = {
	icepick: { chip_thresh: 4, clean_thresh: 2 },
	hammer: { chip_thresh: 2, clean_thresh: 4 },
	pickaxe: { chip_thresh: 3, clean_thresh: 3 }
}

var ice_id = 0;

function reset_health () {
	total_chiphealth = 12;
	total_sweephealth = 12;
}


function increment_health () {
	total_chiphealth += 4;
	total_sweephealth += 4;
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









/**
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
	get_status = do_action();
	get_status['state'] = 'did action';
	add_to_log(get_status);
	
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
  		} else if (mode == 'baseline') {
			var alldone = actionate();
			if (alldone) startRounds();
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

    add_to_log({
		'state': 'item changed',
		'chosen': new_loc
	});
	
    $('#item').css('background-image', new_loc);
});



$('.button img').click(function() {
	var button = this;
    var parent_id = $(button).parent().parent().attr('id');
    $('.instructions').fadeOut();
	
	if (parent_id == 'pregame-instructions') {
		do_baseline();
	} else {
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
				add_to_log({
					'state': 'round starting'
				});				
			} else {
				baseline_timer = $.now();
				add_to_log({
					'state': 'baseline starting'
				});
			}
		}, 3000);
	}
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
    var currentTime = roundtime;

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
            currentTime = roundtime;
            Example2.resetCountdown();
            return;
        }

        // Increment timer position
        currentTime -= incrementTime;
        if (currentTime < 0) currentTime = 0;

    }

    this.resetCountdown = function() {

        // Get time from form
        var newTime = roundtime;
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
	setTimeout(do_pregame, 500);
});
