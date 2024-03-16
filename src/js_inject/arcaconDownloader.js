const $ = require( "jquery" );
const JSZip = require("jszip");
require("file-saver");

const arcaPostURLRegex1 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+\/\d+$/; // 아카라이브 게시글 url 정규식
const arcaPostURLRegex2 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+$/; // 아카라이브 게시글 url 정규식
const imageFormatRegex = /\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i; // 아카라이브 아카콘 파일포멧 정규식
let arcaconTitleName = '최근 사용'; // 아카콘별 타이틀 아이디 - 아이디에 따른 타이틀 네임이 아카콘 폴더에 저장될 예정
let arcaconsURLArray = []; // 아카콘 주소가 저장된 배열

// 아카콘 다운로드
const saveFilesAsZip = async (files) => {
  const zip = new JSZip();
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fetchedFile = await fetchFileWithRetry(file.url);

      if (fetchedFile) {
        console.log('[ fetchedFile ]', fetchedFile);
        const downloadCount = i + 1;
        const totalFiles = files.length;
        updateDownloadProgress(downloadCount, totalFiles);

        const extension = fetchedFile.type.replace(/image\//, '');
        const fileName = `${arcaconTitleName}_${downloadCount}.${extension}`;
        zip.file(fileName, fetchedFile, { binary: true });
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${arcaconTitleName}.zip`);
    resetDownloadProgress();
  } catch (error) {
    console.error('Error saving files as ZIP:', error);
  }
};

// 파일 재다운로드 필요한지 체크... 그럴 일은 없겠지만.
const fetchFileWithRetry = async (url, retries = 3) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const originalBlob = await response.blob();
      const resizedBlob = await resizeImageBlob(originalBlob, 100); // 아카콘 리사이징
      return resizedBlob;
    } else {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    if (retries > 0) {
      console.warn(`Retrying fetch for ${url} (${retries} attempts remaining): ${error.message}`);
      return await fetchFileWithRetry(url, retries - 1);
    } else {
      console.error(`Failed to fetch ${url} after ${retries} attempts:`, error);
      return null;
    }
  }
};

// 아카콘 리사이징
const resizeImageBlob = (blob, maxWidth) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = width / height;

      if (blob.type === 'image/webp') {
        let newWidth = maxWidth;
        let newHeight = Math.round(newWidth / aspectRatio);

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob((resizedBlob) => {
          resolve(resizedBlob);
        }, 'image/png', 0.8); // PNG MIME 타입 지정 및 이미지 리사이즈
      } else {
        resolve(blob);
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

// 다운로드 진행 과정 업데이트
const updateDownloadProgress = (downloadCount, totalFiles) => {
  const downloadText = document.querySelector('#arcaconDownloadText');
  const progressBar = document.querySelector('#arcaconDownloadProgress');

  if (downloadText && progressBar) {
    downloadText.innerHTML = `${downloadCount}/${totalFiles}`;
    progressBar.style.width = `calc(${(downloadCount / totalFiles) * 100}% - 0.5em)`;
  }
};

// 다운로드 진행 과정 초기화
const resetDownloadProgress = () => {
  const downloadText = document.querySelector('#arcaconDownloadText');
  const progressBar = document.querySelector('#arcaconDownloadProgress');

  if (downloadText && progressBar) {
    downloadText.textContent = '아카콘 다운로드';
    progressBar.style.width = '0%';
  }
};

$(document).ready(function() {
  const urlPost = new URL(window.location.href);
  if (
    arcaPostURLRegex1.test(urlPost.origin + urlPost.pathname)
    || arcaPostURLRegex2.test(urlPost.origin + urlPost.pathname)
  ) {
    const arcaconFormContainer = $('.reply-form-button-container'); // 댓글 컨테이너
    const arcaconButton = $('.reply-form-arcacon-button.btn-namlacon'); // 아카콘 버튼
    const arcaconWrapper = $('.namlacon'); // 아카콘 버튼 누르면 보이는 영역
    const arcaconTitle = $('.thumbnails'); // 아카콘별 타이틀 이미지 - 아이디에 따른 타이틀 네임이 나올 예정

    // 아카콘 버튼을 클릭하면 아카콘 다운로드 버튼의 표시 여부를 변경한다.
    arcaconButton.click(function (e) { 
      e.preventDefault();
      if (arcaconWrapper.css('display') === 'none') {
        arcaconDownloadButton.css('display', 'flex');
      } else {
        arcaconDownloadButton.css('display', 'none');
      }
    });

    // 아카콘 다운로드 버튼을 생성한다.
    arcaconFormContainer.append(`
      <button class="reply-form-voice-button btn-arcaconDownload" type="button" tabindex="105" style="display: none;">
        <span class="ion-android-download"></span>
        <span class="text" id="arcaconDownloadText">&nbsp;아카콘 다운로드</span>
        <div id="arcaconDownloadProgress" style="width: 0%;"></div>
      </button>
    `);
    const arcaconDownloadButton = $('.reply-form-voice-button.btn-arcaconDownload'); // 아카콘 다운로드 버튼

    // 아카콘별 타이틀 이미지를 클릭하면 해당 이미지의 아이디를 통해서 아카콘 이름을 긁어온다.
    arcaconTitle.on("click", "img", function (e) {
      let arcaconURL = `https://arca.live/e/${$(e.target).data('id')}`;
      // console.log('아이디 ===', $(e.target).data('id'));
      if ($(e.target).data('id') === 0) {
        // console.log('타이틀 ===', '최근 사용');
        arcaconTitleName = '최근 사용';
      } else {
        fetch(arcaconURL)
          .then(response => {
            if (!response.ok) {}
            return response.text();
          })
          .then(html => {
            let title = new DOMParser().parseFromString(html, 'text/html').querySelector('title').textContent;
            // console.log('타이틀 ===', title);
            arcaconTitleName = title;
          })
          .catch(error => {
            console.error('몬가 문제가 생겨슴:', error);
          });
      }
    });

    // 아카콘 다운로드 버튼을 클릭하면 현재 포커스된 아카콘을 전부 다운로드한다.
    arcaconDownloadButton.click(async function (e) {
      arcaconsURLArray = [];
      e.preventDefault();
      const arcacons = $('.emoticons');
      arcacons.children().each(function (index, element) {
        // element == this
        // console.log(index, element.src);
        arcaconsURLArray.push({
          url: element.src,
        });
        
      });
      saveFilesAsZip(arcaconsURLArray);
    });


    // console.log('아 지금 내가 게시글에 있다!');
  }
})