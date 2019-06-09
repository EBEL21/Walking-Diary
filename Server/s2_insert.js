var express = require('express');
var bodyParser = require('body-parser')
var filter = require('/filter.js')

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
		var result;
    //count[0]: 정상 count[1]: 팔자 count[2]: 안짱
    connection.query(`SELECT * from L_gyro where pressure > 800`, function(err, rows, fields) {
        // connection.end();
        left_data = filter.Arrange_data(rows); // left
        connection.query(`SELECT * from R_gyro where pressure > 800`, function(err, rows, fields) {
            right_data = filter.Arrange_data(rows);
						result = filter.filtering(left_data,right_data,right_data.length);
            res.send(result)
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

app.listen(9000);
