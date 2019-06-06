var express = require('express');
var bodyParser = require('body-parser')

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

function filter (rows) {
    var count = [0, 0, 0];
    var preId;
    var preEuler;
    preId = rows[0].id;
    preEuler = rows[0].eulerx;
    if(preEuler < -180) {
        preEuler += 360;
    }
    for(var i = 1; i < rows.length; i++) {
        if(rows[i].id - 1 != preId) {
            if(preEuler > 20) {
                count[1]++;
            } else if(preEuler < -20) {
                count[2]++;
            } else {
                count[0]++;
            }
        }
        preId = rows[i].id;
        preEuler = rows[i].eulerx;
        if(preEuler < -180) {
            preEuler += 360;
        }
    }
    console.log(count);
    return count;
}

app.get('/query', function(req,res) {
    var result = [0, 0];
    //count[0]: 정상 count[1]: 팔자 count[2]: 안짱
    connection.query(`SELECT * from gyro where pressure > 800 and side = 82`, function(err, rows, fields) {
        // connection.end();
        result[0] = filter(rows); // right
        connection.query(`SELECT * from gyro where pressure > 800 and side = 76`, function(err, rows, fields) {
            result[1] = filter(rows); // left
            res.send(result)
        });
    });
})

app.post('/profile', function(req,res){


	console.log(req.body);

	connection.query(`INSERT INTO gyro (side,accx,accy,accz,eulerx,eulery,eulerz,pressure) VALUES (${req.body.side},${req.body.accx},${req.body.accy},${req.body.accz}
		,${req.body.eulerx},${req.body.eulery},${req.body.eulerz},${req.body.pressure})`);



});




app.listen(9000);

