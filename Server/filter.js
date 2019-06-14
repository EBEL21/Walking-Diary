module.exports = {
'filtering2': function(left,right,steps) {
  var i=0,j=0;
  var result = [0,0,0]
  while(i != steps-1 && j != steps-1) {

    var angle = this.Cal_Angle(left[i].yaw,right[j].yaw);
    console.log(`${left[i].yaw} , ${right[j].yaw} , ${angle}\n`);

    var stat= this.Get_foot_state(angle);
    result[stat]++;

    i==j ? i++ : j++;
  }
  return result
},
'filtering': function(left,right,steps) {
  var threshold = 3;
  var direction = 0;
  var del_right = 0;
  var del_left = 0;
  var curL, curR, nextL, nextR
  var i=0,j=0;

  //결과값
  // 0: 정상  0~13
  // 1: weak 팔자
  // 2: strong 팔자  15<d
  // 3: weak 안짱    d<-3
  // 4: strong 안짱  d<-8
  var resultR = [0,0,0,0,0];
  var resultL = [0,0,0,0,0];
  while(i!=steps-1 && j != steps-1) {
    curL = left[i];
    nextL = left[i+1];
    curR = right[j];
    nextR = right[j+1];

    if(curL.time - curR.time > 5000) {

	    direction = 0;
    } else if(curR.time - curL.time > 5000) {

	    direction = 0;
    }
    if(i == j) { //왼발 앞으로
      var angleL = this.Cal_Angle(curL.yaw, direction);
      var statL = this.Get_foot_state(angleL * -1);
      resultL[statL]++;
      i++;
    } else { //오른발 앞으로
      var angleR = this.Cal_Angle(curL.yaw,direction);
      var statR = this.Get_foot_state(angleR);
      resultR[statR]++;
      j++;
    }

    //각각 발자국의 yaw 변화량 측정
    var del_temp_L = -this.Cal_Angle(nextL.yaw, curL.yaw);
    var del_temp_R = this.Cal_Angle(nextR.yaw, curR.yaw);
    console.log(`direction:${direction}\nleft:${curL.yaw},${nextL.yaw},${del_temp_L}\nright:${curR.yaw},${nextR.yaw},${del_temp_R}\n\n`);
    //변화량의 방향과 누적값이 임계치를 넘어서면
    //진행방향에 변화량의 평균치를 더해 진행방향을 바꿔준다.
    if( Math.abs( del_temp_L) > threshold &&
          Math.abs(del_temp_R) > threshold) {
        if(Math.sign(del_temp_R) == Math.sign(del_temp_L)) {
          if(i==j) { //왼발 앞으로
            var angleL = this.Cal_Angle(curL.yaw,direction);
            var statL = this.Get_foot_state(angleL * -1);
            resultL[statL]++;
            i++;
          } else { //오른발 앞으로
            var angleR = this.Cal_Angle(curL.yaw,direction);
            var statR = this.Get_foot_state(angleR);
            resultR[statR]++;
            j++;
          }
        //진행방향 갱신해주기
        direction += (del_temp_L + del_temp_R) / 2;
        if(direction < 0) {
          direction += 360;
        } else if(direction >= 360) {
          direction -= 360
        }
        //delta 누적값 초기화
        del_left = 0;
        del_right = 0;
        continue;
      }
    }

    //진행방향의 변화가 없다면 누적값을 계속 쌓는다.
    del_left += del_temp_L;
    del_right += del_temp_R;
  }

  //마지막 step에 대한 처리
  var statL = this.Get_foot_state((curL.yaw - direction)*-1);
  resultL[statL]++;
  var statR = this.Get_foot_state(curR.yaw - direction);
  resultR[statR]++;
  console.log(resultL);
  console.log(resultR);
  return [resultL,resultR];
},


//진행방향에 대한 발의각도로 어떤 걸음상태인지를 계산한다.
'Get_foot_state': function(angle) {
  if(angle >= 25) {
    return 1;
  } else if(angle <= -25){
    return 2;
  } else {
    return 0;
  }
},

'Cal_Angle': function(ang1,ang2) {
  var cal = ang2-ang1
  if(Math.abs(cal) >= 180) {
    if(cal < 0) {
      cal += 360;
    } else {
      cal -=360;
    }
  }
  return cal;
},

//stream형태의 발자국 data 중 발바닥이 닿는 각도의 변화량 체크
'filtering3':function(rows) {
  var count = 0;
  var firstAngle = rows[0].roll, lastAngle;
  var del = 0;
  var result = [];
  for(var i = 0; i < rows.length-1; i++) {
      if(rows[i+1].time - rows[i].time > 500) {
	        del += rows[i].roll - firstAngle;
          firstAngle = rows[i+1].roll;
          count++;
      }
  }
  del = del/count;
  return del;
},
//stream형태의 발자국 data 중 마지막 부분만 모아서 배열로 만든다
'Arrange_data':function(rows) {
  var length = 0;
  var result = [];
  for(var i = 0; i < rows.length-1; i++) {
      if(rows[i+1].time - rows[i].time > 500) {
	  if(rows[i].yaw < 0.0) {
		   rows[i].yaw+=360.0;
	  }
          result.push(rows[i]);
      }
  }
  return result;
}

}

