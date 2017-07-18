
var myApp = new Framework7({
    swipePanel: 			"left",
    material: 				true,
    preloadPreviousPage: 	false
});

var EMAIL_REGEX 	= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var MOBILE_REGEX 	= /^\d{10}$/;
var PIN_REGEX 		= /^\d{4}$/;

var API_URL 		= "https://mpower.chat/fortis-australian-paper/api";

var DOCTOR 			= Lockr.get("DOCTOR");

var $$ 				= Dom7;

// Add main view
var mainView 		= myApp.addView(".view-main", {
});

if ( DOCTOR == undefined || DOCTOR._id == undefined ) {
	mainView.router.load({url: 'login.html'});
}

$(document).on('click', '.chip-delete', function (e) {
    e.preventDefault();
    var chip = $(this).parents('.chip');
    chip.remove();
});

myApp.onPageInit("about", function (page) {
	console.log("load about");
});

myApp.onPageInit("login", function (page) {
	console.log("load login");

	$("[data-page='login'] .login-btn").click(function(event) {
		var mobile 	= $("[data-page='login'] .mobile").val().trim();
		var pin 	= $("[data-page='login'] .pin").val().trim();

		if (! mobile.match(MOBILE_REGEX) ) {
			myApp.alert("Provide valid mobile number");
			return false;
		} else if ( ! pin.match(PIN_REGEX) ) {
			myApp.alert("Provide 4 digit pin");
			return false;
		}

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/doctor_login',
			type: 'POST',
			dataType: 'json',
			data: {
				mobile	: mobile,
				pin 	: pin
			},
		})
		.done(function(res) {
			console.log("success");

			if (res.status == "success") {
				DOCTOR = res.data;
				Lockr.set("DOCTOR", res.data);

				$("[data-page='login'] .mobile").val("");
				$("[data-page='login'] .pin").val("");
				
				mainView.router.load({url: 'index.html'});
			}
		})
		.fail(function(err) {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});
});

myApp.onPageInit("add-patient", function (page) {
	console.log("load add-patient");

	$("[data-page='add-patient'] .add-patient-btn").click(function(event) {
		var name	= $("[data-page='add-patient'] .name").val().trim();
		var mobile 	= $("[data-page='add-patient'] .mobile").val().trim();
		var email 	= $("[data-page='add-patient'] .email").val().trim();

		if (! mobile.match(MOBILE_REGEX) ) {
			myApp.alert("Provide valid mobile number");
			return false;
		} else if ( ! email.match(EMAIL_REGEX) ) {
			myApp.alert("Provide valid email");
			return false;
		} else if ( name == "" ) {
			myApp.alert("Provide name");
			return false;
		}

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/add_patient',
			type: 'POST',
			dataType: 'json',
			data: {
				doctor_id	: DOCTOR._id,
				name		: name,
				mobile 		: mobile,
				email 		: email
			},
		})
		.done(function(res) {
			console.log("success");

			if (res.status == "success") {
				myApp.alert("Patient added successfully");

				$("[data-page='add-patient'] .name").val("");
				$("[data-page='add-patient'] .mobile").val("");
				$("[data-page='add-patient'] .email").val("");
			} else {
				myApp.alert(res.data);
			}
		})
		.fail(function(err) {
			console.log("error");
			myApp.alert("some error occured, please contact admin");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});
});


// add appointment
myApp.onPageInit("add-appointment", function (page) {
	console.log("load add-appointment");

	// search patient
	$("[data-page='add-appointment'] .search-patient-btn").click(function(event) {
		var mobile = $("[data-page='add-appointment'] .mobile").val().trim();

		if (! mobile.match(MOBILE_REGEX) ) {
			myApp.alert("Provide valid mobile number");
			return false;
		}

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/get_patient',
			type: 'POST',
			dataType: 'json',
			data: {
				mobile: mobile
			},
		})
		.done(function(res) {
			console.log("success");

			if ( res.status == "success" ) {
				$("[data-page='add-appointment'] .search-mobile-div").hide();
				$("[data-page='add-appointment'] .patient-personal-detail-div").show();
				$("[data-page='add-appointment'] .appointment-detail-div").show();

				$("[data-page='add-appointment'] .patient_id").val(res.data._id);
				$("[data-page='add-appointment'] .name").val(res.data.name);
				$("[data-page='add-appointment'] .mobile").val(res.data.mobile);
				$("[data-page='add-appointment'] .email").val(res.data.email);
			} else {
				myApp.alert(res.data);
			}
		})
		.fail(function() {
			console.log("error");
			myApp.alert("some error occured, please contact admin");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});

	// add appointment
	$("[data-page='add-appointment'] .add-appointment-btn").click(function(event) {

		var patient_id	= $("[data-page='add-appointment'] .patient_id").val().trim();
		var date 		= $("[data-page='add-appointment'] .date").val().trim();
		var time	 	= $("[data-page='add-appointment'] .time").val().trim();

		if ( date == "" ) {
			myApp.alert("Provide date");
			return false;
		} else if ( time == "" ) {
			myApp.alert("Provide time");
			return false;
		} else if ( patient_id == "" ) {
			myApp.alert("Provide patient data");
			return false;
		}

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/add_appointment',
			type: 'POST',
			dataType: 'json',
			data: {
				doctor_id: 	DOCTOR._id,
				patient_id: patient_id,
				date: 		date,
				time: 		time
			},
		})
		.done(function(res) {
			console.log("success");

			if (res.status == "success") {
				myApp.alert("Appointment added successfully");

				$("[data-page='add-appointment'] .search-mobile-div").show();
				$("[data-page='add-appointment'] .patient-personal-detail-div").hide();
				$("[data-page='add-appointment'] .appointment-detail-div").hide();

				$("[data-page='add-appointment'] .name").val("");
				$("[data-page='add-appointment'] .mobile").val("");
				$("[data-page='add-appointment'] .email").val("");

				$("[data-page='add-appointment'] .patient_id").val("");
				$("[data-page='add-appointment'] .date").val("");
				$("[data-page='add-appointment'] .time").val("");
			} else {
				myApp.alert(res.data);
			}
		})
		.fail(function(err) {
			console.log("error");
			myApp.alert("some error occured, please contact admin");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});
});

// add record
myApp.onPageInit("add-record", function (page) {
	console.log("load add-record");

	// search patient
	$("[data-page='add-record'] .search-patient-btn").click(function(event) {
		var mobile = $("[data-page='add-record'] .mobile").val().trim();

		if (! mobile.match(MOBILE_REGEX) ) {
			myApp.alert("Provide valid mobile number");
			return false;
		}

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/get_patient',
			type: 'POST',
			dataType: 'json',
			data: {
				mobile: mobile
			},
		})
		.done(function(res) {
			console.log("success");

			if ( res.status == "success" ) {
				$("[data-page='add-record'] .search-mobile-div").hide();
				$("[data-page='add-record'] .patient-personal-detail-div").show();
				$("[data-page='add-record'] .record-detail-div").show();

				$("[data-page='add-record'] .patient_id").val(res.data._id);
				$("[data-page='add-record'] .name").val(res.data.name);
				$("[data-page='add-record'] .mobile").val(res.data.mobile);
				$("[data-page='add-record'] .email").val(res.data.email);
			} else {
				myApp.alert(res.data);
			}
		})
		.fail(function() {
			console.log("error");
			myApp.alert("some error occured, please contact admin");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});

	// chips
	$("[data-page='add-record'] .add-complaint-btn").click(function(event) {
		var complaint = $("[data-page='add-record'] .complaint").val().trim();

		if ( complaint == "" ) {
			myApp.alert("Provide complaint");
			return false;
		}

		var chip = 	'<div class="chip">'+
				    	'<div class="chip-label">' + complaint + '</div>'+
					    '<a href="#" class="chip-delete"></a>'+
				  	'</div>';
		$("[data-page='add-record'] .complaint-chips-block").append(chip);
		$("[data-page='add-record'] .complaint").val("");
	});

	$("[data-page='add-record'] .add-observation-btn").click(function(event) {
		var observation = $("[data-page='add-record'] .observation").val().trim();

		if ( observation == "" ) {
			myApp.alert("Provide observation");
			return false;
		}

		var chip = 	'<div class="chip">'+
				    	'<div class="chip-label">' + observation + '</div>'+
					    '<a href="#" class="chip-delete"></a>'+
				  	'</div>';
		$("[data-page='add-record'] .observation-chips-block").append(chip);
		$("[data-page='add-record'] .observation").val("");
	});

	$("[data-page='add-record'] .add-diagnosis-btn").click(function(event) {
		var diagnosis = $("[data-page='add-record'] .diagnosis").val().trim();

		if ( diagnosis == "" ) {
			myApp.alert("Provide diagnosis");
			return false;
		}

		var chip = 	'<div class="chip">'+
				    	'<div class="chip-label">' + diagnosis + '</div>'+
					    '<a href="#" class="chip-delete"></a>'+
				  	'</div>';
		$("[data-page='add-record'] .diagnosis-chips-block").append(chip);
		$("[data-page='add-record'] .diagnosis").val("");
	});

	// add-lab-orders-btn
	$("[data-page='add-record'] .add-lab-orders-btn").click(function(event) {
		var test 		= $("[data-page='add-record'] .test").val().trim();
		var instruction = $("[data-page='add-record'] .instruction").val().trim();

		if ( test == "" ) {
			myApp.alert("Provide test name");
			return false;
		}

		var row 		= '<tr>'+
						  	'<td class="label-cell lab-test">' + test + '</td>'+
						  	'<td class="label-cell lab-instruction">' + instruction + '</td>'+
						  '</tr>';
		$("[data-page='add-record'] .lab-order-tbody").append(row);
		$("[data-page='add-record'] .test").val("");
		$("[data-page='add-record'] .instruction").val("");
	});

	// add-priscription-btn
	$("[data-page='add-record'] .add-priscription-btn").click(function(event) {
		var drug 		= $("[data-page='add-record'] .drug").val().trim();
		var frequency	= $("[data-page='add-record'] .frequency").val().trim();
		var duration	= $("[data-page='add-record'] .duration").val().trim();
		var instruction	= $("[data-page='add-record'] .drug-instruction").val().trim();

		if ( drug == "" ) {
			myApp.alert("Provide drug name");
			return false;
		}

		var row 		= '<tr>'+
						  	'<td class="label-cell prescription-drug">' + drug + '</td>'+
						  	'<td class="label-cell prescription-frequency">' + frequency + '</td>'+
						  	'<td class="label-cell prescription-duration">' + duration + '</td>'+
						  	'<td class="label-cell prescription-instruction">' + instruction + '</td>'+
						  '</tr>';
		$("[data-page='add-record'] .priscription-tbody").append(row);
		$("[data-page='add-record'] .drug").val("");
		$("[data-page='add-record'] .drug-instruction").val("");
	});


	// add record
	$("[data-page='add-record'] .add-record-btn").click(function(event) {
		var patient_id		= $("[data-page='add-record'] .patient_id").val().trim();

		var complaints 		= [];
		$(".complaint-chips-block .chip").map(function(index, el) {
			
			var complaint = $(this).find(".chip-label").html();
			complaints.push( complaint );

		});

		var observations 	= [];
		$(".observation-chips-block .chip").each(function(index, el) {
			
			var observation = $(this).find(".chip-label").html();
			observations.push( observation );

		});

		var diagnosises 	= [];
		$(".diagnosis-chips-block .chip").each(function(index, el) {
			
			var diagnosis = $(this).find(".chip-label").html();
			diagnosises.push( diagnosis );

		});

		var lab_orders	 	= [];
		$(".lab-order-tbody tr").each(function(index, el) {
			
			var test 		= $(this).find(".lab-test").html();
			var instruction = $(this).find(".lab-instruction").html();
			lab_orders.push( {test: test, instruction: instruction} );

		});

		var priscriptions 	= [];
		$(".priscription-tbody tr").each(function(index, el) {
			
			var drug 		= $(this).find(".prescription-drug").html();
			var frequency 	= $(this).find(".prescription-frequency").html();
			var duration 	= $(this).find(".prescription-duration").html();
			var instruction = $(this).find(".prescription-instruction").html();
			priscriptions.push( {drug: drug, frequency: frequency, duration: duration, instruction: instruction} );

		});
		
		if ( patient_id == "" ) {
			myApp.alert("Provide patient data");
			return false;
		}
		var formData = {
			doctor_id		: DOCTOR._id,
			patient_id		: patient_id,
			complaints 		: complaints,
			observations 	: observations,
			diagnosises		: diagnosises,
			lab_orders		: lab_orders,
			priscriptions	: priscriptions
		};

		console.log("formData", formData);
		// return;

		myApp.showIndicator();
		$.ajax({
			url: API_URL + '/add_record',
			type: 'POST',
			dataType: 'json',
			data: formData,
		})
		.done(function(res) {
			console.log("success");

			if (res.status == "success") {
				myApp.alert("Record added successfully");

				// empty form
				$("[data-page='add-record'] .patient_id").val("");
				$("[data-page='add-record'] .name").val("");
				$("[data-page='add-record'] .mobile").val("");
				$("[data-page='add-record'] .email").val("");

				$("[data-page='add-record'] .complaint-chips-block").empty();
				$("[data-page='add-record'] .complaint").val("");

				$("[data-page='add-record'] .observation-chips-block").empty();
				$("[data-page='add-record'] .observation").val("");

				$("[data-page='add-record'] .diagnosis-chips-block").empty();
				$("[data-page='add-record'] .diagnosis").val("");

				$("[data-page='add-record'] .lab-order-tbody").empty();
				$("[data-page='add-record'] .test").val("");
				$("[data-page='add-record'] .instruction").val("");

				$("[data-page='add-record'] .priscription-tbody").empty();
				$("[data-page='add-record'] .drug").val("");
				$("[data-page='add-record'] .drug-instruction").val("");


				$("[data-page='add-record'] .search-mobile-div").show();
				$("[data-page='add-record'] .patient-personal-detail-div").hide();
				$("[data-page='add-record'] .record-detail-div").hide();
			} else {
				myApp.alert(res.data);
			}
		})
		.fail(function(err) {
			console.log("error");
			myApp.alert("some error occured, please contact admin");
		})
		.always(function() {
			console.log("complete");
			myApp.hideIndicator();
		});
		
	});
});

