

var User 		= require('./models/user');


module.exports = function(app, passport) {

// student routes ==============================================================

// add a new student to a class
	app.post('/api/addstudent', function(req, res) {
		var id = req.user._id;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var index = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(user.currentClass);
				user.classes[index].studentList.push(req.body);
				//user.classes[index].numStudents++;

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// delete a student from a class
	app.delete('/api/deletestudent', function(req, res) {
		var id = req.user._id;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var classIndex = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(user.currentClass);
				var studentIndex = user.classes[classIndex].studentList.map(function(arrayItem) { return arrayItem.studentName; }).indexOf(req.body.studentname);
				
				user.classes[classIndex].studentList.splice(studentIndex, 1);
				//user.classes[classIndex].numStudents--;

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// edit a student from a class
	app.put('/api/editstudent', function(req, res) {
		var id = req.user._id;
		var thisStudent = req.body.oldName;
		var thisClass = req.user.currentClass;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var classIndex = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(thisClass);
				var studentIndex = user.classes[classIndex].studentList.map(function(arrayItem) { return arrayItem.studentName; }).indexOf(thisStudent);
				
				var student = user.classes[classIndex].studentList[studentIndex];
				student.studentName = req.body.studentName;
			    student.age = req.body.age;
			    student.gender = req.body.gender;
			    student.classAverage = req.body.classAverage;

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// get students from a class
	app.get('/api/students', function(req, res) {
		var id = req.user._id;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var index = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(user.currentClass);
				res.json(user.classes[index].studentList);
			}
		});
	});

// class routes ================================================================
	// add a class to a user
	app.post('/api/addclass', function(req, res) {
		var id = req.user._id;
		var classname = req.body.classname;

		User.findById(id, function(err, user) {
			if (err) { 
				res.send(err); 
			} else {
				user.classes.push(
					{
						className: classname,
						classAverage: 95,
						numStudents: 1,
						studentList: [
							{
								studentName: 'sampleStudent',
								age: 14,
								gender: 'Female',
								classAverage: 95
							}
						]
					}
				);

				user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
			}
		});
		
	});

	// delete a class from a user
	app.delete('/api/deleteclass', function(req, res) {
		var id = req.user._id;
		var classToDelete = req.body.classname;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var classIndex = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(classToDelete);
				
				user.classes.splice(classIndex, 1);

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// edit a class' classname from a user
	app.put('/api/editclassname', function(req, res) {
		var id = req.user._id;
		var oldClassName = req.body.oldClassName;
		var newClassName = req.body.newClassName;

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var classIndex = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(oldClassName);
				
				user.classes[classIndex].className = newClassName;

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// edit a class' classAverage from a user
	app.put('/api/editclassstats', function(req, res) {
		var id = req.user._id;
		var thisClass = req.user.currentClass;
		var classAverage = req.body.average;
		var numStudents = req.body.numStudents;
		

		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				var classIndex = user.classes.map(function(arrayItem) { return arrayItem.className; }).indexOf(thisClass);
				
				user.classes[classIndex].classAverage = classAverage;
				user.classes[classIndex].numStudents = numStudents;

	            user.save(function(err) {
	            	res.send(
		            	(err === null) ? { msg: '' } : { msg: 'error: ' + err}
		            );
		        });
		    }        	

		});
	});

// get classes from a user
	app.get('/api/classes', function(req, res) {
		var id = req.user._id;

		User.findById(id, function(err, user) {
			if (err)
				res.send(err);

			res.json(user.classes);
		});

	});

// saves current class in session cookie
	app.post('/api/currentclass', function(req, res) {
		var id = req.user._id
		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {
				user.currentClass = req.body.classname;

				user.save(function(err) {
		            res.send(
	            		(err === null) ? { msg: '' } : { msg: 'error: ' + err}
	            	);
	            });
		    }
		});

	});




// user routes =================================================================
// returns current user in session cookie
	app.get('/api/currentuser', function(req, res) {
		res.json(req.user._id);
	});




// user routes for testing =====================================================
	// get all users in db
	app.get('/api/users', function(req, res) {

		// use mongoose to get all users in the database
		User.find(function(err, users) {

			// if there is an error retrieving, send the error. nothing after res.send(err) will execute
			if (err)
				res.send(err);

			res.json(users); // return all users in JSON format
		});
	});


	// delete a user 
	app.delete('/api/users/:user_id', function(req, res) {
		User.remove({
			_id : req.params.user_id
		}, function(err, users) {
			if (err)
				res.send(err);

			// get and return all the users after you create another
			User.find(function(err, users) {
				if (err)
					res.send(err)
				res.json(users);
			});
		});
	});
	


// view routes =================================================================

	// show the home page (will also have our login links)
	app.get('/', function(req, res) {
		res.render('index.ejs', {
			title: 'Group Students'
		});
	});

	// CLASSES SECTION =========================
	app.get('/classes', isLoggedIn, function(req, res) {
		res.render('classes.ejs', {
			user : req.user,
			title: 'Group Students'
		});
	});

	// STUDENTS SECTION ========================
	
	app.get('/students', isLoggedIn, function(req, res) {
		var id = req.user._id
		User.findById(id, function(err, user) {
			if (err) {
				res.send(err);
			} else {

				res.render('students.ejs', {
					user : req.user,
					title : 'Group Students'
				});
			}

		});

	});



	// LOGOUT ==============================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

// locally --------------------------------
	// LOGIN ===============================
	// show the login form
	app.get('/login', function(req, res) {
		res.render('login.ejs', { 
			message: req.flash('loginMessage'),
			title: 'Group Students' 
		});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/classes', // redirect to the secure classes section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// SIGNUP =================================
	// show the signup form
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', { 
			message: req.flash('signupMessage'),
			title: 'Group Students'
		});
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/classes', // redirect to the secure classes section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));



};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();

	res.redirect('/');
}
