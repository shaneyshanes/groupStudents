// classlist data array for filling in info box
var classListData = [];


// ----- Dom Ready -----------------------------------------//
$(document).ready(function(req, res) {

	initLayout();	


    // Populate the class table on initial page load
    populateClassTable();
});

// ----- Functions -----------------------------------------//


// populates class list
function populateClassTable() {	

    var tableContent = '';
    var displayType = $('#selectDisplay').find(":selected").val();
    var sortOrder = $('#selectDisplay').find(":selected").attr('class');
    var id = $('#logout').attr('rel');
	
          

	$.getJSON('api/classes/', function(data) {

		/*	Stick user data array into a userlist variable in the global object
			bad practice, do something else for large data like loading
			only the data you really need at any given time */
		classListData = data;
		data = data.sort(sortByProperty(displayType, sortOrder));
	

		// for each item in our JSON, add a table row and cells content string
		$.each(data, function() {
			tableContent += '<tr>';
            tableContent += '<td><a onclick="currentClass(this);" href="javascript:void(0);" rel="' + id + '"  title="Show Details">' + this.className + '</a></td>';
            tableContent += '<td>' + this.classAverage + '</td>';
            tableContent += '<td>' + this.numStudents + '</td>';
            tableContent += '<td><a onclick="editClass(this)" href="javascript:void(0);" class="linkeditclass" rel="' + this.className + '">edit</a> / ';
            tableContent += '<a onclick="deleteClass(this)" href="javascript:void(0);" class="linkdeleteclass" rel="' + this.className + '">delete</a></td>';
            tableContent += '</tr>';
		});

		// Insert the content string into our existing HTML table
		$('#classList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
		 
	});

};

// Go to Students page
function currentClass(user) {
	
	var className = $(user).text();

	var id = $(user).attr('rel');
	//  Use AJAX to get the object to our currentClass service

	$.ajax({
		type: 'POST',
		url: '/api/currentclass',
		data: {classname : className},
		dataType: 'JSON'
	}).done(function(response){

		
		// Check for successful (blank) response
		if (response.msg === '') {
			

		} else {

			// If something goes wrong, alert the error message that our service returned
			alert(response.msg);
		}

	});

	window.location.replace('/students');
	

};

// Add Class 
function addClass(event) {

	// Super basic validation - increase errorCount variable if any fields are blank
	// make this more robust
	var errorCount = 0;
	$('#addClass input').each(function(index, val) {
		if($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {
		// If it is, compile all user info into one object
		var name = $('#className').val();
		


		//  Use AJAX to post the object to our addclass service
		$.ajax({
			type: 'POST',
			data: { classname: name },
			url: '/api/addclass',
			dataType: 'JSON'
		}).done(function(response){

			// Check for successful (blank) response
			if (response.msg === '') {

				// Clear the form inputs
				$('.clearInput').val('');

				// Update the table
				populateClassTable();

			} else {

				// If something goes wrong, alert the error message that our service returned
				alert(response.msg);
			}

		});
	
	} else {

		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	} 


};

// Delete Class
function deleteClass(thisClass) {
	//event.preventDefault();
	//alert(person);
	var confirmation = confirm('Are you sure you want to delete this Class?');
	var classToDelete = $(thisClass).attr('rel')
	// Make sure user confirmed
	if (confirmation === true) {

		// If so, delete
		$.ajax({
			type: 'DELETE',
			url: '/api/deleteclass',
			data: { classname : classToDelete },
			dataType: 'JSON'
		}).done(function(response) {
			
			// Check for success
			if (response.msg === '') {

			} else {
				alert(response.msg);
			}

			// Update table
			populateClassTable();
		});

	} else {

		// If they didn't confirm, do nothing
		return false;
	}

};

// Edit Class
function editClass(thisClass) {	

	// Retrieve username
	var thisClassName = $(thisClass).attr('rel');

	// Get Index of object based on id value
	var index = classListData.map(function(arrayItem) { return arrayItem.className; }).indexOf(thisClassName);

	// Get class object
	var thisClassObject = classListData[index];

	$('#editClassName').val(thisClassObject.className);
    
 	$("#btnEditClass").attr("name", thisClassName);

    $('#myModal').modal('show');	

};

// Updates class info after user edits
function updateClassInfo(event) {
	
	var id = event.name;
	var newName = $('#editClassName').val();
	var oldName = $('#btnEditClass').attr('name');

	var editData = {
		oldClassName: oldName,
		newClassName: newName
	}	

	$.ajax({
		type: 'PUT',
		url: '/api/editclassname',
		data: editData,
		dataType: 'JSON'
	}).done(function(response) {
		
		// Check for success
		if (response.msg === '') {

		} else {
			alert(response.msg);
		}

		// Update table
		$('#myModal').modal('hide');
		populateClassTable();
	});
	
}

function sortByProperty(property, order) {
    if(order == 'sortAscending') {
	    'use strict';
	    return function (a, b) {
	        var sortStatus = 0;
	        if (a[property] < b[property]) {
	            sortStatus = -1;
	        } else if (a[property] > b[property]) {
	            sortStatus = 1;
	        }
	 
	        return sortStatus;
	    };
	} else if (order == 'sortDescending') {
		'use strict';
	    return function (a, b) {
	        var sortStatus = 0;
	        if (a[property] < b[property]) {
	            sortStatus = 1;
	        } else if (a[property] > b[property]) {
	            sortStatus = -1;
	        }
	 
	        return sortStatus;
	    };
	}
}
 



function initLayout() {
	toggle('#addClass');
	toggle('#classList');
	toggle('#classInfo');

}

function toggle(element) {
    $(element).toggle();
}
  
