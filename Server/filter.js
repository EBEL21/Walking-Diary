'filtering': function(left,right,steps) {
  var threshold = 5;
  var direction = 0.0f;
  var del_right = 0.0f;
  var del_left = 0.0f;
  var curL, curR, nextL, nextR
  var i=0,j=0;

  //결과값
  // 0: 정상  0~13
  // 1: weak 팔자
  // 2: strong 팔자  15<d
  // 3: weak 안짱    d<0
  // 4: strong 안짱  d<-5
  var resultR = [0,0,0,0,0];
  var resultL = [0,0,0,0,0];


  while(i <= steps && j <= steps) {
    curL = left[i];
    nextL = left[i+1];
    curR = right[j];
    nextR = right[j+1];

    if(i==j) { //왼발 앞으로
      j++
      var statL = Get_foot_state((curL.yaw - direction)*-1);
      resultL[statL]++;
    } else { //오른발 앞으로
      i++
      var statR = Get_foot_state(curR.yaw - direction);
      resultR[statR]++;
    }

    //각각 발자국의 yaw 변화량 측정
    del_temp_L = nextL.yaw - curL.yaw;
    del_temp_R = nextR.yaw - curR.yaw;

    //변화량의 방향과 누적값이 임계치를 넘어서면
    //진행방향에 변화량의 평균치를 더해 진행방향을 바꿔준다.
    if( Math.abs(del_left + del_temp_L) > threshold &&
          Math.abs(del_right + del_temp_R) > threshold) {
        if(Math.sign(del_right + del_temp_R) == Math.sign(del_left + del_temp_L)) {
        //진행방향 갱신해주기
        direction += (del_temp_L + del_temp_R) / 2;
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
  var statL = Get_foot_state((curL.yaw - direction)*-1);
  resultL[statL]++;
  var statR = Get_foot_state(curR.yaw - direction);
  resultR[statR]++;

  return [resultL,resultR];
}


//진행방향에 대한 발의각도로 어떤 걸음상태인지를 계산한다.
'Get_foot_state': function(angle) {
  if(angle >= 15) {
    return 2;
  } else if(angle >= 13){
    return 1;
  } else if( angle >= 0) {
    return 0;
  } else if(angle < -5) {
    return 4;
  } else {
    return 3;
  }
}

'Arrange_data':function(rows) {
  var preId;
  var preEuler;
  var result = [];
  preId = rows[0].id;
  preEuler = rows[0].eulerx;
  if(preEuler < -180) {
      preEuler += 360;
  }
  for(var i = 1; i < rows.length; i++) {
      if(rows[i].id - 1 != preId) {
          result.push(rows[i]);
      }
      preId = rows[i].id;
      preEuler = rows[i].eulerx;
      if(preEuler < -180) {
          preEuler += 360;
      }
  }
  console.log(count);
  return result;
}
