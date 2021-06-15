// 초기화면 리스트
$('#page1').ready(function(){
    $.getJSON('https://api.odcloud.kr/api/15077586/v1/centers?page=1&perPage=1000&serviceKey=OMzKYB%2BUDlok97%2BEhbqQEO5wP1XnsmjYv4ykQPYUuBT%2FLIWhn0c539Rg7WQAS6luJAm2fV5lPrGDm0uH0EimQw%3D%3D', function(jsonData){
        var tagList = "";
        $.each(jsonData.data, function(){
            id = this.id;
            tagList += "<li><a href = '#detail' onclick = detail(this)>" + this.facilityName + "</a></li>";
        });
        $('#listArea').empty();
        $('#listArea').append(tagList);
        $('#listArea').listview('refresh');
    });
});

// 검색 데이터 추출
function search_item(){
    $('#btn').click(function(){
        const keyword = document.getElementById('keyword').value;
        $.getJSON('https://api.odcloud.kr/api/15077586/v1/centers?page=1&perPage=1000&serviceKey=OMzKYB%2BUDlok97%2BEhbqQEO5wP1XnsmjYv4ykQPYUuBT%2FLIWhn0c539Rg7WQAS6luJAm2fV5lPrGDm0uH0EimQw%3D%3D', function(jsonData){
            var tagList = "";
            $.each(jsonData.data, function(){
                if(this.address.includes(keyword)){
                    tagList += "<li><a href = '#detail' onclick = detail(this)>" + this.facilityName + "</a></li>";
                }
            });
            $('#listArea').empty();
            $('#listArea').append(tagList);
            $('#listArea').listview('refresh');
        });
    });

}

let map;
function initMap() {
    var seoul = { lat: 37.5642135 ,lng: 127.0016985 };
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: seoul
    });


}

function changeCenter(latitude, longitude){
    // var latitude = parseFloat($('#latitude').val());
    // var longitude = parseFloat($('#longitude').val());

    var location = {lat : latitude, lng : longitude};
    map.panTo(location);
    map.setZoom(15);

    new google.maps.Marker({
        position : location,
        map : map
    });
}

// 상세화면 데이터 추출
function detail(center_name){
    var item = $(center_name).text();
    console.log("키값 : " + item);

    $('#detail').ready(function(){
        $.getJSON('https://api.odcloud.kr/api/15077586/v1/centers?page=1&perPage=1000&serviceKey=OMzKYB%2BUDlok97%2BEhbqQEO5wP1XnsmjYv4ykQPYUuBT%2FLIWhn0c539Rg7WQAS6luJAm2fV5lPrGDm0uH0EimQw%3D%3D', function(jsonData){
            var tagList = "";
            $.each(jsonData.data, function(){
                if(this.facilityName.includes(item)){
                    tagList += "<li><h3>시설명</h3><p>" + this.facilityName + "</p></li>"
                    + "<li><h3>주소</h3><p>" + this.address + "</p></li>"
                    + "<li><h3>전화번호</h3><p>" + this.phoneNumber + "</p></li>"
                    + "<form><input type = 'hidden' name = 'bm_facilityname' id = 'bm_facilityname' value = '" + this.facilityName + "'/>"
                    + "<input type = 'hidden' name = 'bm_address' id = 'bm_address' value = '" + this.address + "'/>"
                    + "<input type = 'hidden' name = 'bm_phone' id = 'bm_phone' value = '" + this.phoneNumber + "'/>"
                    + "<input type = 'hidden' name = 'latitude' id = 'latitude' value = '" + this.lat + "'/>"
                    + "<input type = 'hidden' name = 'longitude' id = 'longitude' value = '" + this.lng + "'/></form>";

                    changeCenter(parseFloat(this.lat), parseFloat(this.lng));
                }
            });
            $('#detailArea').empty();
            $('#detailArea').append(tagList);
            $('#detailArea').listview('refresh');
        });
        
    });
}



var db = null;
var var_no = null;
var position = null;
var index;

// DB열기
function openDB(){
    db = window.openDatabase('BookMark', '1.0', '북마크DB', 1024*1024);
    console.log('DB생성');
}

// 테이블 생성
function createTable(){
    db.transaction(function(tr){
        var createSQL = 'create table if not exists BookMark(facilityName text, address text, phoneNumber text)';
        tr.executeSql(createSQL, [], function(){
            console.log('테이블 생성 SQL 실행 성공');
        }, function(){
            console.log('테이블 생성 SQL 실행 실패');
        });
    }, function(){
        console.log('테이블 생성 트랜잭션 실패');
    }, function(){
        console.log('테이블 생성 트랜젝션 성공');
    });
}

// 북마크 추가
function insert_bookmark(){
    db.transaction(function(tr){
        var facilityName = $('#bm_facilityname').val();
        var address = $('#bm_address').val();
        var phoneNumber = $('#bm_phone').val();
        var insertSQL = 'insert into BookMark(facilityName, address, phoneNumber) values(?, ?, ?)';
        tr.executeSql(insertSQL, [facilityName, address, phoneNumber], function(tr, rs){
            console.log('즐겨찾기 등록 no : ' + rs.insertID);
            alert('시설명 ' + $('#bm_facilityname').val() + '즐겨찾기에 추가되었습니다.');
        }, function(tr, err){
            alert('DB오류 ' + err.message + err.code);
        });
    });
}

// 북마크 데이터 조회 트랜잭션
function select_bookmark(){
    db.transaction(function(tr){
        var tagLists = "";
        var selectSQL = "select * from BookMark";
        tr.executeSql(selectSQL, [], function(tr, rs){
            console.log('북마크 데이터베이스 조회... ' + rs.rows.length + '건');
            for(var i = 0; i < rs.rows.length; i++){
                temp = rs.rows.item(i).facilityName;
                tagLists += "<li><a href = '#detail' onclick = detail(this)>" + temp + "</a></li>";
                console.log('기관명 : ' + tagLists);
            }
            $('#bookmarkArea').empty();
            $('#bookmarkArea').append(tagLists);
            $('#bookmarkArea').listview('refresh'); 
        });

    });
}

// 북마크 데이터 전체 삭제
function delete_bookmark(){
    db.transaction(function(tr){
        var deleteSQL = "Delete from BookMark";
        tr.executeSql(deleteSQL, [], function(tr, rs){
            console.log("데이터 전체 삭제 완료");
            alert('데이터 전체 삭제 완료');
            location.href = "#page1";
        }, function(tr, err){
            alert('데이터 삭제 오류' + err.message + err.code);               
        });
    });
}