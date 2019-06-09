module.exports = {

'filtering': function(left,right,steps) {
  var threshold = 5;
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

  while(i !=  steps && j !=  steps-1) {
    curL = left[i];
    nextL = left[i+1];
    curR = right[j];
    nextR = right[j+1];
    if(i==j) { //왼발 앞으로
      j++
      var statL = this.Get_foot_state((curL.yaw - direction)*-1);
      console.log(`left: ${curL.yaw} , ${direction}, ${curL}`);
      resultL[statL]++;
    } else { //오른발 앞으로
      i++
      var statR = this.Get_foot_state(curR.yaw - direction);
      console.log(`right: ${curR.yaw} , ${direction}, ${curR}`);
      resultR[statR]++;
    }

    //각각 발자국의 yaw 변화량 측정
    var del_temp_L = nextL.yaw - curL.yaw;
    var del_temp_R = nextR.yaw - curR.yaw;

    //변화량의 방향과 누적값이 임계치를 넘어서면
    //진행방향에 변화량의 평균치를 더해 진행방향을 바꿔준다.
    if( Math.abs(del_left + del_temp_L) > threshold &&
          Math.abs(del_right + del_temp_R) > threshold) {
        if(Math.sign(del_right + del_temp_R) == Math.sign(del_left + del_temp_L)) {
          if(i==j) { //왼발 앞으로
            j++
            var statL = this.Get_foot_state((curL.yaw - direction)*-1);
            resultL[statL]++;
          } else { //오른발 앞으로
            i++;
            var statR = this.Get_foot_state(curR.yaw - direction);
            resultR[statR]++;
          }
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
  if(angle >= 15) {
    return 2;
  } else if(angle >= 13){
    return 1;
  } else if( angle >= 0) {
    return 0;
  } else if(angle < -8) {
    return 4;
  } else {
    return 3;
  }
},

//stream형태의 발자국 data 중 마지막 부분만 모아서 배열로 만든다
'Arrange_data':function(rows) {
  var preId;
  var preEuler;
  var length = 0;
  var result = [];
  preId = rows[0].id;
  preEuler = rows[0].eulerx;
  if(preEuler < -180) {
      preEuler += 360;
  }
  for(var i = 1; i < rows.length; i++) {
      if(rows[i].id - 1 != preId) {
          if(length > 2) {
            if(rows[i].yaw < -180) {
                rows[i].yaw += 360;
            }
            result.push(rows[i]);
          }
          length = 0;
      }
      preId = rows[i].id;
      preEuler = rows[i].eulerx;
      length++;
      if(preEuler < -180) {
          preEuler += 360;
      }
  }
  return result;
}

}
