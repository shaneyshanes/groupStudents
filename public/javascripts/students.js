// studentlist data array for filling in info box
var studentListData = [];

// ----- Dom Ready -----------------------------------------//
$(document).ready(function() {

	initLayout();	

    // Populate the student table on initial page load
    populateTable();
});

// ----- Functions -----------------------------------------//


// populates student list (also calls updateClassStats)
function populateTable(callback) {	

    var tableContent = '';
    var displayType = $('#selectDisplay').find(":selected").val();
    var sortOrder = $('#selectDisplay').find(":selected").attr('class');
    
    var id = $('#logout').attr('rel');

    $.getJSON('/api/students', function(data) {

		/*	Stick user data array into a userlist variable in the global object
			bad practice, do something else for large data like loading
			only the data you really need at any given time */
		studentListData = data;

		data = data.sort(sortByProperty(displayType, sortOrder));
		

		// for each item in our JSON, add a table row and cells content string
		$.each(data, function() {
			tableContent += '<tr>';
            tableContent += '<td><a onclick="showStudentInfo(this)" href="javascript:void(0);" class="linkshowstudent"  title="Show Details">' + this.studentName + '</a></td>';
            tableContent += '<td>' + this.classAverage + '</td>';
            tableContent += '<td><a onclick="editStudent(this)" href="javascript:void(0);" class="linkeditstudent" rel="' + this.studentName + '">edit</a> / ';
            tableContent += '<a onclick="deleteStudent(this)" href="javascript:void(0);" class="linkdeletestudent" rel="' + this.studentName + '">delete</a></td>';
            tableContent += '</tr>';
		});

		// Insert the content string into our existing HTML table
		$('#studentList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
		 
		if (typeof callback === 'function') {
        	callback();
    }
	});

	
};

// Update's the Class' classAverage and # of students
function updateClassStats() {
	var len = studentListData.length;
	var sum = 0;
	var avg = 0;

	$.each(studentListData, function() {
		sum += this.classAverage;
	});

	avg = sum / len;
	avg = avg.toFixed(2);
	

	var editData = { 
		average : avg,
		numStudents : len
	};

	// updates class' classAverage
	$.ajax({
		type: 'PUT',
		url: '/api/editclassstats',
		data: editData,
		dataType: 'JSON'
	}).done(function(response) {
		
		// Check for success
		if (response.msg === '') {

		} else {
			alert(response.msg);
		}


	});


}

// Show Student info
function showStudentInfo(person) {

	// Prevent Link from Firing
	//event.preventDefault();

	// Retrieve username
	var thisStudentName = person.text;

	// Get Index of object based on id value
	var arrayPosition = studentListData.map(function(arrayItem) { return arrayItem.studentName; }).indexOf(thisStudentName);

	// Get student object
	var thisStudentObject = studentListData[arrayPosition];

	// Populate Info Box
	$('#studentInfoName').text(thisStudentObject.studentName);
    $('#studentInfoAge').text(thisStudentObject.age);
    $('#studentInfoGender').text(thisStudentObject.gender);
    $('#studentInfoClassAverage').text(thisStudentObject.classAverage);

    $('#addStudent').hide();
    //$('#groupStudents').hide();
    //$('#groupList').hide();
    $('#studentInfo').show();


};

// Add Student 
function addStudent(event) {

	// Super basic validation - increase errorCount variable if any fields are blank
	// make this more robust
	var errorCount = 0;
	$('#addStudent input').each(function(index, val) {
		if($(this).val() === '') {
			errorCount++;
		}
	});

	// Check and make sure errorCount's still at zero
	if(errorCount === 0) {
		// If it is, compile all user info into one object
		var name = $('#studentName').val();
		var age = $('#studentAge').val();
		var gender = $('#studentGender').find(":selected").text();
		var classAverage = $('#studentClassAverage').val();

		var newStudent = {
			'studentName': name,
            'age': age,
            'gender': gender,
            'classAverage': classAverage
		}

		//  Use AJAX to post the object to our addstudent service
		$.ajax({
			type: 'POST',
			data: newStudent,
			url: '/api/addstudent',
			dataType: 'JSON'
		}).done(function(response){

			// Check for successful (blank) response
			if (response.msg === '') {

				// Clear the form inputs
				$('.clearInput').val('');

				// Update the table
				populateTable(function() {
					updateClassStats();
				});
				
				

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

// Delete Student
function deleteStudent(student) {
	//event.preventDefault();
	//alert(person);
	var confirmation = confirm('Are you sure you want to delete this Student?');
	var studentName = $(student).attr('rel')
	// Make sure user confirmed
	if (confirmation === true) {

		// If so, delete
		$.ajax({
			type: 'DELETE',
			url: '/api/deletestudent/',
			data: { studentname : studentName },
			dataType: 'JSON'
		}).done(function(response) {
			
			// Check for success
			if (response.msg === '') {

			} else {
				alert(response.msg);
			}

			// Update table
			populateTable(function() {
				updateClassStats();
			});
		});

	} else {

		// If they didn't confirm, do nothing
		return false;
	}

};

// Edit Student
function editStudent(student) {	

	// Retrieve username
	var thisStudent = $(student).attr('rel');

	// Get Index of object based on id value
	var index = studentListData.map(function(arrayItem) { return arrayItem.studentName; }).indexOf(thisStudent);

	// Get student object
	var thisStudentObject = studentListData[index];

	$('#editStudentName').val(thisStudentObject.studentName);
    $('#editStudentAge').val(thisStudentObject.age);
    $('#editStudentGender').val(thisStudentObject.gender);
    $('#editStudentClassAverage').val(thisStudentObject.classAverage);

    
 	$("#btnEditStudent").attr("name", thisStudent);

    $('#myModal').modal('show');	

};

// Updates student info after user edits
function updateStudentInfo(event) {
	
	var id = event.name;
	var name = $('#editStudentName').val();
	var age = $('#editStudentAge').val();
	var gender = $('#editStudentGender').find(":selected").text();
	var classAverage = $('#editStudentClassAverage').val();

	
	var editData = {

		oldName : $("#btnEditStudent").attr("name"), 
		studentName: name,
	    age: age,
	    gender: gender,
	    classAverage: classAverage
		
	}

	$.ajax({
		type: 'PUT',
		url: '/api/editstudent',
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
		populateTable(function() {
			updateClassStats();
		});
	});
	
}






function groupStudents() {

	var errorCount = 0;
	
	if($('#studentNum').val() === '') {
		errorCount++;
	}
	
    if (errorCount === 0) {
    	var selectGrouping = $( "#groupStudents input:radio[name=optionsRadios]:checked" ).val();
		if (selectGrouping == "homoRadio") {

			groupHomogeneously();

		} else {

			groupHeterogeneously();

		}

		
	} else {

		// If errorCount is more than 0, error out
		alert('Please fill in all fields');
		return false;
	} 
}

function groupHomogeneously(event) {
	var tableContent = '';
	var studentNum = $('#studentNum').val();
	var extras = 0;

	var temp_group = [];

		$.getJSON('/api/students', function(data) {

			data = data.sort(sortByProperty('classAverage', 'sortAscending'));

			var numGroups = Math.ceil(data.length / studentNum);
			extras = data.length % studentNum;

			

			var i = 0;
			var j = 0;
			var index = 0;
			var className;
			var groupStudentName;

			
			for (i = 0; i < numGroups; i++) {
				for (j = 0 ; j < studentNum; j++) {
					if (index < data.length) {
						groupedStudentName = '<a onclick="showStudentInfo(this)" href="javascript:void(0);" class="linkshowstudent"  title="Show Details">' + data[index].studentName + '</a>';
						temp_group.push({ name : groupedStudentName, groupNum : i + 1});	
						index++;	
					}				
				};		
			};

	
			// for each item in our JSON, add a table row and cells content string
			for (i = 0; i < temp_group.length; i++) {
				if (temp_group[i].groupNum % 2 == 0) {
					className = "grayBackground";
				} else {
					className = "noBackground";
				}

				tableContent += '<tr class="' + className + '">';
				tableContent += '<td>' + temp_group[i].groupNum.toString() + '</td>';
				tableContent += '<td>' + temp_group[i].name + '</td>';
				tableContent += '</tr>';
			};

				// Insert the content string into our existing HTML table
				$('#groupList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
				$('#groupList').show();
			 
		});
}

function groupHeterogeneously() {
	var tableContent = '';
	var studentNum = $('#studentNum').val();
	var extras = 0;

	var temp_group = [];

		$.getJSON('/api/students', function(data) {

			data = data.sort(sortByProperty('classAverage', 'sortAscending'));

			var numGroups = Math.ceil(data.length / studentNum);
			extras = data.length % studentNum;

			

			var i = 0;
			var j = 0;
			var index = 0;
			var className;

			
			for (i = 0; i < numGroups; i++) {
				for (j = 0 ; j < studentNum; j++) {
					if (index < data.length) {
						temp_group.push({ name : data[index].studentName, groupNum : (index % numGroups) + 1 });	
						index++;	
					}				
				};		
			};

			temp_group = temp_group.sort(function (a, b) {
			    return a.groupNum - b.groupNum;
			});

	
			// for each item in our JSON, add a table row and cells content string
			for (i = 0; i < temp_group.length; i++) {
				if (temp_group[i].groupNum % 2 == 0) {
					className = "grayBackground";
				} else {
					className = "noBackground";
				}

				tableContent += '<tr class="' + className + '">';
				tableContent += '<td>' + temp_group[i].groupNum.toString() + '</td>';
				tableContent += '<td>' + temp_group[i].name + '</td>';
				tableContent += '</tr>';
			};

				// Insert the content string into our existing HTML table
				$('#groupList table tbody').html(tableContent); // not good for large data sets (don't want to display so much)
				$('#groupList').show();
			 
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
	toggle('#addStudent');
	toggle('#groupStudents');
	toggle('#studentList');
	toggle('#groupList');
	toggle('#studentInfo');

}

function toggle(element) {
    $(element).toggle();
}
  
