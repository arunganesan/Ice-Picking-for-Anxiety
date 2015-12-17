// Main function headers
var mode = 'baseline';
var shrinkTo = 0;
var requiredSteps = 10;
var step = 5;
var doneMelting = false;
var baseline_timer = 0;
var increment = 20;

var roundNum = 0;
var log = [{'game': 'melt'}];

function add_to_log (obj) {
	obj['timestamp'] = $.now();
	log.push(obj);
}

function do_baseline () {
	$('#wrapper').fadeTo(250, 0.4);
	$('#baseline-instructions').fadeIn();
	Example2.Timer.stop();
	Example2.resetCountdown();
}

function do_pregame () {
	$('#wrapper').fadeTo(250, 0.4);
	$('#pregame-instructions').fadeIn();
	Example2.Timer.stop();
	Example2.resetCountdown();
}

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
			shrinkTo = 0;
			$('#ice').css('clip', 'rect('+(shrinkTo)+'px, 200px, 200px, 0px)');
			
			if (parent_id == 'start-round-instructions') {
				$('#countdown').show();
				Example2.Timer.play();
				add_to_log({'state': 'round start'});
			} else if (parent_id == 'baseline-instructions') {
				
				baseline_timer = $.now();
				add_to_log({'state': 'baseline start'});
			}
		}, 3000);
	}
    //$('#wrapper').fadeTo(250, 1);

	
});

$('.item').click(function() {
	$('.item').removeClass('selected');
	console.log(this);
    $(this).addClass('selected');
    var new_loc = 'url(' + $('img', this).attr('src') + ')';
    console.log(new_loc);
    
	add_to_log({'item': new_loc});

    $('#item').css('background-image', new_loc);
});

function shrink_and_animate () {
    shrinkTo ++;
    var percent = shrinkTo/requiredSteps;
    var shrinkToPx = percent * 200;

    add_to_log({
		'state': 'action', 
		'shrinkTo': shrinkTo,
		'total': requiredSteps
	});
    $('#ice').css('clip', 'rect('+(shrinkToPx)+'px, 200px, 200px, 0px)');
    item_animate();
}

function show_game_over () {
  $('#game-over').fadeIn();
  $('#wrapper').fadeTo(250, 0.4);
  $('#results').text(JSON.stringify(log));
  
  $.post("http://arunganesan.com/anxiety-study/submit.php", JSON.stringify(log));
}

function updateRound () {
    roundNum += 1;
    add_to_log({
		'state': 'update round',
		'roundnum': roundNum,
		'requiredSteps': requiredSteps
	});

    $('#roundNum').text(roundNum);
    $('#start-round-instructions').fadeIn();
    $('#wrapper').fadeTo(250, 0.4);

    Example2.resetCountdown();
}




$('body').keyup(function(e) {
    if(e.keyCode == 32){
    	if ($('.instructions').is(':visible') || $('#starttime').is(':visible')) {
    	} else if (mode == 'baseline') {
            shrink_and_animate();

        	if (shrinkTo >= requiredSteps) {
                baseline_timer = $.now() - baseline_timer;
                var elapsed = baseline_timer/1000.0;
                var rate =(requiredSteps/elapsed * 20);
                increment = rate * 0.3;
                console.log('' + requiredSteps + ' clicks in ' + elapsed + ' seconds. Rate: ' + rate + ' per 20 seconds. Setting to ' + (rate - increment));
                add_to_log({
					'state': 'done baseline',
					'required time': elapsed,
					'rate per 20': rate,
					'setting rate to': rate - increment
				});
                requiredSteps = rate - increment;
				mode = 'in-round';
                updateRound();

            }
    	} else if (mode == 'in-round') {
    		shrink_and_animate();

        	if (shrinkTo >= requiredSteps) {
                console.log('' + requiredSteps + ' clicks. Increasing to ' + (requiredSteps + increment));
                requiredSteps += increment;
                updateRound();
        	}
    	}
    }
});

function item_animate () {
	var angle = -45;

	$({deg: 0}).animate({deg: 100}, {
        duration: 50,
        step: function(now) {
            $('#item').css({
                transform: 'rotate(' + now/100.0*angle + 'deg)',
                left: '' + (65 - now/100.0*15) + "%"
            });
        }
	}).delay(50).animate({deg:0}, {
		duration: 50,
        step: function(now) {
            $('#item').css({
                transform: 'rotate(' + now/100.0*angle + 'deg)',
                left: '' + (65 - now/100.0*15) + "%"
            });
        }
	});

}


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


$(document).ready(function() {
	Example2.Timer.stop();
	//setTimeout(do_baseline, 500);
	setTimeout(do_pregame, 500);
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
