var express = require('express');
var bodyParser = require('body-parser')
var filter = require('./filter.js')

var app = express();

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'capston',
	password: '1234',
	database: 'mydb'
});
connection.connect();

app.get('/query', function(req,res) {
    var left_data;
		var righ_data;
		var left_angle;
		var right_angle;
		var t_result;
		var milli = 62135596800000;
		var today = new Date();
		var day1 = new Date("2019/06/"+today.getDate());
		var day2 = new Date("2019/06/"+(today.getDate() + 1));
		var day3 = new Date("2019/06/"+(today.getDate() - 10));

    //get today's data
    connection.query(`SELECT * from L_gyro WHERE (pressure > 800) AND (time BETWEEN ${day3.getTime()+milli} AND ${day2.getTime()+milli}) ORDER BY time`, function(err, rows, fields) {
			if(rows.length > 0) {
				left_data = filter.Arrange_data(rows); // left
				left_angle = filter.filtering3(rows);
				console.log(left_angle);
			} else {
				console.log('left empty');
			}
      connection.query(`SELECT * from R_gyro WHERE (pressure > 800)
			 AND (time BETWEEN ${day3.getTime()+milli} AND ${day2.getTime()+milli})
			 ORDER BY time`, function(err, rows, fields) {
				 if(rows.length > 0) {
            				right_data = filter.Arrange_data(rows);
										right_angle = filter.filtering3(rows);
										console.log(right_angle);
				 } else {
				   console.log('right empty');
					 right_data = [];
				 }
				 if(right_data.length > 0 && left_data.length > 0) {
						 t_result = filter.filtering2(left_data,right_data,right_data.length);
					 } else {
						 t_result = [0,0,0];
					 }
					 t_result[3]= left_angle;
					 t_result[4] = right_angle;
				 res.send(t_result);
        });
    });
})

app.get('/query2', function(req,res) {
    var left_data;
		var righ_data;
		var y_result;
		var today = new Date();
		var day1 = new Date("2019/06/"+today.getDate());
		var day2 = new Date("2019/06/"+(today.getDate() - 1));

    //get today's data
    connection.query(`SELECT * from L_gyro WHERE pressure > 800
			AND time BETWEEN ${day2.getTime()} AND ${day1.getTime()}
			ORDER BY time`, function(err, rows, fields) {
       			 console.log(rows);
			if(!err) {
				left_data = filter.Arrange_data(rows); // left
			} else {
				console.log('empty');
				left_data = [];
			}
      connection.query(`SELECT * from R_gyro WHERE pressure > 800
			 time BETWEEN ${day2.getTime()} AND ${day1.getTime()}
			 ORDER BY time`, function(err, rows, fields) {
				 if(!err) {
            				right_data = filter.Arrange_data(rows);
				 } else {
				   console.log('empty');
					 right_data = [];
				 }
				 if(right_data.length > 0 && left_data.length > 0) {
	    			 y_result = filter.filtering2(left_data,right_data,right_data.length);
					 } else {
						 y_result = [0,0,0];
					 }
        });
    });
})




app.post('/profile', function(req,res){
	console.log(req.body);

    if (req.body.side == 76) { // Left-side
	    connection.query(`INSERT INTO L_gyro (accx, accy, accz, yaw, pitch, roll, pressure, time)
                        VALUES (${req.body.accx}, ${req.body.accy}, ${req.body.accz}, ${req.body.yaw}, ${req.body.pitch}, ${req.body.roll},
                        ${req.body.pressure}, ${req.body.time})`);
    }
    else if (req.body.side == 82){ // Right-side
	    connection.query(`INSERT INTO R_gyro (accx, accy, accz, yaw, pitch, roll, pressure, time)
                        VALUES (${req.body.accx}, ${req.body.accy}, ${req.body.accz}, ${req.body.yaw}, ${req.body.pitch}, ${req.body.roll},
                        ${req.body.pressure}, ${req.body.time})`);
    }
});


app.get('/test', function (req, res) {
    res.send('hello')
})
app.listen(9000);
