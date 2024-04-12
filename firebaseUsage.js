import { initializeFirebase } from "./firebaseInit.js";

import { getDatabase, ref, get, set, remove, push } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

import {
getStorage,
ref as sRef,
deleteObject, uploadBytesResumable, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

const app = initializeFirebase();
const db = getDatabase(app);
const storage = getStorage();


// 게시글 조회 페이지 업로드 
export function watchReview(query) {
    let param = new URLSearchParams(query);
    let reviewKey = param.get('review');
    console.log(reviewKey);
    // 클릭한 게시글 key 받아오기
    const reviewRef = ref(db, 'user_review/' + reviewKey)   
    get(reviewRef).then((snapshot) => {
        if (snapshot.exists()) {
          const object = snapshot.val();
          loadReview(object);
        } else {
            alert("No data available");
        }
    }).catch((error) => {
        console.error(error)
    })
}

// 게시글 수정 페이지 업로드
export function updateReview(query) {
    let param = new URLSearchParams(query);
    let reviewKey = param.get('review');
    console.log(reviewKey);
    const reviewListRef = ref(db, "user_review/" + reviewKey);
    let reviewId = sessionStorage.getItem('id');
   
    viewPrev();
}

// 업데이트된 리뷰 데이터 DB 값 수정
function updateDb(reviewImg) {
    let date = new Date();

    let reviewHotelName = $("#hotelName").val();
    let reviewRegion = $("#region").val();
    let reviewRate = $("#rate").val();
    let reviewContent = $("#comment").val();
    let reviewDate = date.getFullYear() + "년 " + date.getMonth() + "월 " + date.getDate() + "일 (수정)";
    console.log(reviewDate);

    set(reviewListRef, {
      "reviewId": reviewId,
      "reviewImg": reviewImg,
      "reviewHotelName": reviewHotelName,
      "reviewRegion": reviewRegion,
      "reviewRate": reviewRate,
      "reviewContent": reviewContent,
      "reviewDate": reviewDate
    })
      .then(() => {
        alert("수정이 완료되었습니다.");
        location.href = "user_mypage.html";
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
}

// 기존 리뷰 데이터 입력창에 표시하기
function viewPrev () {
    get(reviewListRef).then((snapshot) => {
      if (snapshot.exists()) {
        const object = snapshot.val();

        loadPrevFile(object.reviewImg);
        const viewHotelName = object.reviewHotelName;
        const viewRegion = object.reviewRegion;
        const viewRate = object.reviewRate;
        const viewContent = object.reviewContent;
        console.log(viewHotelName);
        $('#hotelName').val(viewHotelName);        
        $("#region").val(viewRegion).prop("selected", true);
        $('#rate').val(viewRate).prop("selected", true);
        $('#comment').text(viewContent);
      } else {
          alert("No data available");
      }
    }).catch((error) => {
        console.error(error)
    })
}


// 기존 리뷰 데이터 띄우기
function loadReview(object){
    loadFile(object.reviewImg);
    const viewRegion = object.reviewRegion;
    const viewId = object.reviewId;
    const viewHotelName = object.reviewHotelName;
    const viewRate = generateStars(object.reviewRate);
    const viewContent = object.reviewContent;
    const viewDate = object.reviewDate;
    
    //console.log(viewId);
    $('#reviewRegion').text(viewRegion);
    $('#reviewId').text(viewId);
    $('#reviewHotelName').text(viewHotelName);
    $('#reviewRate').html(viewRate);
    $('#reviewContent').text(viewContent);
    $('#reviewDate').text(viewDate);
}

// 메인 페이지 전체 데이터 가져오기
export function displayTotalData() {
    const gridContainer = document.querySelector('.grid-container');
    const searchFilter = document.querySelector('.search-filter');
    const searchText = document.querySelector('.search-input').value.toLowerCase();

    // 'user_review' 데이터베이스 참조
    const reviewRef = ref(db, 'user_review');

    get(reviewRef).then((snapshot) => {
        if (snapshot.exists()) {
            gridContainer.innerHTML = ''; // 기존 내용 초기화
            const reviews = snapshot.val();

            // 각 리뷰에 대해 반복
            Object.keys(reviews).forEach((key) => {
                const review = reviews[key];

                // 검색 필터에 따른 검색 수행
                if (
                    (searchFilter.value === 'id' && review.reviewId.toLowerCase().includes(searchText)) ||
                    (searchFilter.value === 'accommodation' && review.reviewHotelName.toLowerCase().includes(searchText)) ||
                    (searchFilter.value === 'location' && review.reviewRegion.toLowerCase().includes(searchText)) ||
                    (searchFilter.value === 'rating' && review.reviewRate.toString().includes(searchText)) ||
                    (searchFilter.value === 'review' && review.reviewContent.toLowerCase().includes(searchText)) ||
                    (searchFilter.value === 'all' && (
                        review.reviewId.toLowerCase().includes(searchText) ||
                        review.reviewHotelName.toLowerCase().includes(searchText) ||
                        review.reviewRegion.toLowerCase().includes(searchText) ||
                        review.reviewRate.toString().includes(searchText) ||
                        review.reviewContent.toLowerCase().includes(searchText)
                    ))
                ) {
                    // 그리드에 추가할 요소 생성
                    const gridItem = document.createElement('div');
                    gridItem.classList.add('grid-item');
                    gridItem.setAttribute('data-key', key); // 각 항목의 키 값 설정

                    gridItem.innerHTML = `
                <img src="${review.reviewImg}" alt="리뷰 이미지">
                <div class="grid-item-content">
                    <p><strong>아이디:</strong> ${review.reviewId}</p>
                    <p><strong>숙소명:</strong> ${review.reviewHotelName}</p>
                    <p><strong>지역:</strong> ${review.reviewRegion}</p>
                    <p><strong>평점:</strong> ${generateStars(review.reviewRate)}</p>
                    <p><strong>리뷰내용:</strong> ${review.reviewContent}</p>
                </div>
            `;
                    gridContainer.appendChild(gridItem);
                }
            });
        } else {
            console.log("데이터가 없습니다.");
        }
    }).catch((error) => {
        console.error(error);
    });
}

// 마이페이지 유저 데이터 가져오기
export function displayUserData() {
    const gridContainer = document.querySelector('.grid-container');
    const searchFilter = document.querySelector('.search-filter');
    const searchText = document.querySelector('.search-input').value.toLowerCase();

    const userKey = sessionStorage.getItem('id');
    console.log(userKey);
    // 'user_review' 데이터베이스 참조
    const userRef = ref(db, 'user_review');

    // 데이터 가져오기
    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            gridContainer.innerHTML = ''; // 기존 내용 초기화
            const reviews = snapshot.val();

            // 각 리뷰에 대해 반복
            Object.keys(reviews).forEach((key) => {
                const review = reviews[key];
                if (review.reviewId == userKey) {
                    // 검색 필터에 따른 검색 수행
                    if (
                        (searchFilter.value === 'accommodation' && review.reviewHotelName.toLowerCase().includes(searchText)) ||
                        (searchFilter.value === 'location' && review.reviewRegion.toLowerCase().includes(searchText)) ||
                        (searchFilter.value === 'rating' && review.reviewRate.toString().includes(searchText)) ||
                        (searchFilter.value === 'review' && review.reviewContent.toLowerCase().includes(searchText)) ||
                        (searchFilter.value === 'all' && (
                            review.reviewId.toLowerCase().includes(searchText) ||
                            review.reviewHotelName.toLowerCase().includes(searchText) ||
                            review.reviewRegion.toLowerCase().includes(searchText) ||
                            review.reviewRate.toString().includes(searchText) ||
                            review.reviewContent.toLowerCase().includes(searchText)
                        ))
                    ) {
                        // 그리드에 추가할 요소 생성
                        const gridItem = document.createElement('div');
                        gridItem.classList.add('grid-item');
                        gridItem.setAttribute('data-key', key); // 각 항목의 키 값 설정
                        
                        gridItem.innerHTML = `
                        <img src="${review.reviewImg}" alt="리뷰 이미지">
                        <div class="grid-item-content">
                            <div class = "text-container">
                            
                            <p><strong>숙소명:</strong> ${review.reviewHotelName}</p>
                            <p><strong>지역:</strong> ${review.reviewRegion}</p>
                            <p><strong>평점:</strong> ${generateStars(review.reviewRate)}</p>
                            <p><strong>리뷰내용:</strong> ${review.reviewContent}</p>
                            </div>
                            <div class = "btn-container">
                            <button class="btn btn-outline-primary editBtn">수정하기</button>
                            <button class="btn btn-outline-danger deleteBtn">삭제하기</button>
                            </div>
                        </div>
                        `;
                        gridContainer.appendChild(gridItem);
                    }
                }    
            });
        } else {
            gridContainer.innerHTML = '<p>게시글이 없습니다.</p>';
            console.log("데이터가 없습니다.");
        }
    }).catch((error) => {
        console.error(error);
    });
    if (gridContainer.innerHTML == '') {
        gridContainer.innerHTML = '<p>게시글이 없습니다.</p>';
            console.log("데이터가 없습니다.");
    }
}

// 별표 생성 함수
function generateStars(rate) {
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 !== 0;

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<span style="color: orange;">★</span>';
    }
    if (hasHalfStar) {
        starsHTML += '<span style="color: orange;">☆</span>';
    }
    const emptyStars = 5 - Math.ceil(rate);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<span>☆</span>';
    }

    return starsHTML;
}

// 스토리지 이미지 삭제 
export function deleteImg(object) {
    const deleteRef = sRef(storage, object.reviewImg);

    // Delete the file
    deleteObject(deleteRef).then(() => {
        console.log("이미지 삭제 완료");
    }).catch((error) => {
        console.log("이미지 삭제 실패")
    });
}

// 마이페이지 리뷰 삭제하기
export function deleteReview(key) {
    const reviewListRef = ref(db, "user_review/" + key);
    get(reviewListRef).then((snapshot) => {
        if (snapshot.exists()) {
        const object = snapshot.val();
        deleteImg(object);
        } else {
            alert("No data available");
        }
    }).catch((error) => {
        console.error(error)
    })

    // Firebase에서 데이터 삭제
    remove(reviewListRef)
        .then(() => {
            // 삭제 성공 시 알림창 표시
            alert("삭제가 완료되었습니다!");
            console.log("Document successfully deleted!");
            displayUserData();
        })
        .catch((error) => {
            console.error("Error removing document: ", error);
        });
}

