const $ = require( "jquery" );
const JSZip = require("jszip");
require("file-saver");

const arcaPostURLRegex1 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+\/\d+$/; // 아카라이브 게시글 url 정규식
const arcaPostURLRegex2 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+$/; // 아카라이브 게시글 url 정규식
let arcaconTitleName = '최근 사용'; // 아카콘별 타이틀 아이디 - 아이디에 따른 타이틀 네임이 아카콘 폴더에 저장될 예정
let arcaconsURLArray = []; // 아카콘 주소가 저장된 배열
let downloadCount = 0; // 다운로드 카운트
let isDownloading = false; // 다운로드중이면 다시 다운로드 못하게 해

// 아카콘 다운로드
const saveFilesAsZip = (files) => {
  const zip = new JSZip();
  let remoteZips = files.map(async (file, index) => {
    let fetchedFile = await fetch(file.url, {
      headers: {
        pragma: "no-cache",
        origin: "https://arca.live",
        referer: "https://arca.live/",
        "cache-control": "no-cache",
        "cache-directive": "no-cache",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
      },
    })
      .then((res) => {
        if (res.status === 200) {
          return res.blob();
        }
      })
      // .catch((err) => console.log(err));
    if (fetchedFile) {
      // console.log('다운로드중......')
      if (!isDownloading) { isDownloading = true; }
      downloadCount += 1;
      document.querySelector('#arcaconDownloadText').innerHTML = `${downloadCount}/${files.length}`;
      $('#arcaconDownloadProgress').css('width', `calc(${downloadCount}% - 0.5em)`);

      if (fetchedFile.type === 'image/webp') {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const img = await createImageBitmap(fetchedFile);
        canvas.width = 100;
        canvas.height = (img.height * 100) / img.width;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        const resizedBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => resolve(blob), 'image/png', 1);
        });
        zip.file(`${arcaconTitleName}_${index + 1}.png`, resizedBlob, { binary: true });
      } else {
        zip.file(`${arcaconTitleName}_${index + 1}.${fetchedFile.type.replace(/image\//, '')}`, fetchedFile, { binary: true });
      }
    }
  });
  Promise.all(remoteZips).then(() => {
    $('#arcaconDownloadText').text('아카콘 다운로드');
    downloadCount = 0;
    isDownloading = false;
    $('#arcaconDownloadProgress').css('width', `0%`);
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      saveAs(blob, `${arcaconTitleName}.zip`);
    });
  });
};

$(document).ready(function() {
  const urlPost = new URL(window.location.href);
  if (
    arcaPostURLRegex1.test(urlPost.origin + urlPost.pathname)
    || arcaPostURLRegex2.test(urlPost.origin + urlPost.pathname)
  ) {
    const arcaconFormContainer = $('.reply-form-button-container'); // 댓글 컨테이너
    const arcaconButton = $('.reply-form-arcacon-button.btn-namlacon'); // 아카콘 버튼
    const arcaconWrapper = $('.arcaconPicker'); // 아카콘 버튼 누르면 보이는 영역
    let arcaconPackageId = 0; // 아카콘 타이틀별 패키지 아이디
    let arcaconImageContainer = $('.package-wrap[data-package-id="' + arcaconPackageId + '"]'); // 아카콘 이미지 컨테이너

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

    // 아카콘 다운로드 버튼을 클릭하면 현재 포커스된 아카콘을 전부 다운로드한다.
    arcaconDownloadButton.click(async function (e) {
      e.preventDefault();
      arcaconTitleName = $('.arcaconPicker .package-item.focused').data('packageName');
      arcaconPackageId = $('.arcaconPicker .package-item.focused').data('packageId');
      arcaconImageContainer = $('.package-wrap[data-package-id="' + arcaconPackageId + '"]');
      console.log(arcaconTitleName, arcaconPackageId, arcaconImageContainer);
      if (!isDownloading) {
        arcaconsURLArray = [];
        arcaconImageContainer.find('.thumbnails').children('.thumbnail-wrap').each(function() {
          var imgSrc = $(this).find('img.thumbnail').attr('src');
          if (imgSrc) {
            arcaconsURLArray.push({
              url: imgSrc,
            });
          }
        });
        saveFilesAsZip(arcaconsURLArray);
      } else {
        alert('현재 아카콘을 다운로드 중입니다.');
      }
    });
  }
})