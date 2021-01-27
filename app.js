import { format, isValid, formatISO, add, formatDistanceToNowStrict } from 'https://unpkg.com/date-fns?module';

/*
* @function userMsg - Provides feedback to user
* @params {string} msg - User message
*/
function userMsg(msg = "Sorry, your browser lacks the features required by reToothbrush") {
	alert(msg);
	console.error(msg);
	document.querySelector('#brushchange').setAttribute('disabled', 'disabled');
	return;
}

//  Mustard Cut
if ( !('visibilityState' in document) ) { 
	userMsg();
}

// Storage must be present for StoreJS to function...
if ( typeof store !== 'undefined' && !store.enabled ) {
	userMsg('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade browser');
}

// Is HTTPS?
if ( window.isSecureContext === false ) {
	userMsg('Local storage is disabled by your browser in non-secure(HTTP) contexts. Check page URL is secure with ‘HTTPS’ (padlock symbol).');
}
	
/*
* Set locale language...
*/
var browLang = (() => {
	return window.navigator.languages || window.navigator.language;
})();


// Test browLang array for 'en', 'en-GB', 'en-US'...
let localesCheck = (() => {
	if (browLang.indexOf('en') === 0 || browLang.indexOf('en-GB') === 0 || browLang.indexOf('en-US') === 0) {
		return true;
	} else { 
		return false;
	};
})();


/*
* @function langChange - Browser language change
* @callback {brushDate}
*/
function langChange() {
	if ( confirm('Browser language has changed. Reload with new language preferences?') ) {
		console.warn('brushDates updated, reloaded?');
	}
}

/*
* Watch language change - maybe call display function again?
* @listener
* @callback {langChage}
*/
window.onlanguagechange = langChange;


/* 
* @var storedDate - checks typeof to keep Chrome happy, gets stored date
* @returns {string} - YYYY-MM-DD ???
*/
if (typeof store !== 'undefined') {
	var storedDate = store.get('dateSwapped');
}
else {
	var storedDate = false;
}


/*
*	@function dateChecked - Checks date value passed is valid date
*	@param {string} dateChecked
*	@return {boolean}
*/
function dateValid( dateChecked ) {
	return isValid(new Date(dateChecked));
}


/*
* @function - Days Remaining Plural String Function. New Intl.relativeTime API method!!! Use Polyfill (one exist yet??)
* @params {number} daysRemaining
* @return {string} - XX day(s)
*/
function dayPlural(daysRemaining) {
	
	if ( Number.isInteger(daysRemaining) ) {
		
		if ( window.Intl.hasOwnProperty('RelativeTimeFormat') ) {

			return new Intl.RelativeTimeFormat( browLang ).format(daysRemaining, 'day');
			
		} else {
			
			if (daysRemaining !== 1) {
				return daysRemaining + ' ' + 'days';
			} else {
				return daysRemaining + ' ' + 'day';
			}
		}

	}	

}


// Make UTC Version to add as datetime attribute. SEEMS TO BE DAY OUT THOUGH!!!!!111
/*
*	@function dateUtc - Make UTC Version to add as datetime attribute
*	@param {date} dateIn
*	@return {boolean}
*/
function dateUtc( dateIn ){
	
	if ( dateValid(dateIn) ) {
		return formatISO(new Date(dateIn));
	}
	
}


function makeDates( dateBrushchange = false) {

	if ( dateValid(dateBrushchange) ) {
		
		let	dateStart = new Date(dateBrushchange);
		
		let	dateEnd = add(new Date(dateStart), {days: 90});
		
		let	dateDayremain = formatDistanceToNowStrict(dateEnd, {unit: 'day'});
		
		let brushDates = Array.from([dateStart, dateDayremain, dateEnd]);
		
		dateFill(brushDates);
	}
}


/*
* Check en-US format being used and reverse date...
* Update footer note about date format....
* @function dateFormat
*/
function dateFormat() {
	
	let domDateformat = document.querySelector('i');
	
	if ( browLang.indexOf('en-US') === 0 ) {
		domDateformat.textContent = 'Date format MM/DD/YYYY';
		return 'MM/DD/YYYY';
	} else {
		domDateformat.textContent = 'Date format MM/DD/YYYY';
		return 'DD/MM/YYYY';
	}
}


/*
* Add dates to DOM
* @function dateFill
* @param {array} brushDates - Passes array of start, days remaining, end date
*/
function dateFill(brushDates) {
	
		// Vars
		let domDaystart = document.querySelector('#dayStart');
		let	domDayremain = document.querySelector('#dayRemaining');
		let	domDayend = document.querySelector('#dayEnd');		
		
		// Date Start		
		domDaystart.textContent = format(brushDates[0], 'dd/MM/yyyy');
		domDaystart.setAttribute('datetime', `${dateUtc(brushDates[0])}`);

		// Days Remain
		domDayremain.textContent = `${ brushDates[1] }`;
		domDayremain.setAttribute('datetime', `P ${brushDates[1]} D`);
		
		// Date End
		domDayend.textContent = format(brushDates[2], 'dd/MM/yyyy');
		domDayend.setAttribute('datetime', `${dateUtc(brushDates[2])}`);
		
}


/*
* Get stored date
* @function brushDate
* @callback {makeDates}
*/
function brushDate() {
	
	if ( storedDate ) {
		makeDates(storedDate);
	} else {
		return;
	}

}

	
/*
* @function brushSwap - Save to LocalStorage
* @param {string} dateBrushchange - Passed date, checks it is dateValid(), then store date in localStorage
* @callback makeDates
*/
function brushSwap() {

	console.warn('Brushchange!');	
	
	if ( dateValid( format(new Date(), 'yyyy-MM-dd') ) ) {
		if (storedDate) {
			confirm('Brush Changed. Create new date?');
		}
		store.set('dateSwapped', format(new Date(), 'yyyy-MM-dd') );
	}

	makeDates(format(new Date(), 'yyyy-MM-dd'));
	
	if (hasScheduling) {
		try {
			createScheduledNotification('retoothbrush', 'ReToothbrush', format(new Date()));
		} catch(error) {
			console.warn(error);
			confirm('Notification failed to schedule. You will not receive a reminder');
		}
	}

	// Trigger fade-in effect
	document.body.classList.add('has-updated');
}


// Once Event Listener Test / Polyfill
var supportsOnce = false;
try {
	let opts = Object.defineProperty({}, 'once', {
		get: function() {
			supportsOnce = true;
		}
	});
	window.addEventListener("test", null, opts);
} catch (e) {} 

/*
* DOMContentLoaded
*/
document.addEventListener('DOMContentLoaded', brushDate, supportsOnce? { once: true } : false);

/*
* Button Listener
*/
document.querySelector('#brushchange').addEventListener('click', brushSwap, false);

if ("serviceWorker" in navigator) {
	if (navigator.serviceWorker.controller) {
	  console.log("Service Worker Registered");
	} else {
	  navigator.serviceWorker
		.register("sw.js", {
		  scope: "./"
		})
		.then(function (reg) {
		  console.log('Service Worker Registered!');
		})
		.catch(function(error) {
		  console.log('Registration failed with ' + error);
		});
	}
  }

console.log(new Date())

/*
* Scheduled Notifications Test
*/
const hasScheduling = "showTrigger" in Notification.prototype;
var createScheduledNotification;
var cancelScheduledNotification;

if (hasScheduling) {

	navigator.permissions.query({name:'notifications'}).then(function(result) {
		if (result.state == 'granted') {
			confirm('You will receive notification reminders');
		} else {
			confirm('You need to enable notifications to receive notification reminders');
			Notification.requestPermission().then(function(result) {
				console.log(result);
			});
		}
	});

	createScheduledNotification = async (tag, title, timestamp) => {
		console.log({tag, title, timestamp});
		let scheduleDelay = add(new Date(), {days: 1}); // 1 day
		const registration = await navigator.serviceWorker.getRegistration();
		console.log(registration);
		registration.showNotification(title, {
			tag: tag,
			body: "Its time to swap your toothbrush!",
			showTrigger: new TimestampTrigger(timestamp + scheduleDelay)
		});
	};

	cancelScheduledNotification = async (tag) => {
		const registration = await navigator.serviceWorker.getRegistration();
		const notifications = await registration.getNotifications({
		  tag: tag,
		  includeTriggered: true,
		});
		notifications.forEach((notification) => notification.close());
	};
}