// arcaconDownloader.js
const $ = require("jquery");
const JSZip = require("jszip");
require("file-saver");

const arcaPostURLRegex1 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+\/\d+$/; // 아카라이브 게시글 url 정규식
const arcaPostURLRegex2 = /^https:\/\/arca\.live\/b\/[^\/]+\/\d+$/; // 아카라이브 게시글 url 정규식

// 아카콘별 다운로드 관련 상태 변수
let arcaconTitleName = "최근 사용";
let arcaconsURLArray = [];
let downloadCount = 0;
let isDownloading = false;

/**
 * 아카콘 API 호출 (arcaconPackageId 이용)
 * - /api/emoticon2/<packageId> 로 GET 요청
 * - 반환 데이터 예: [{id, imageUrl, type}, ...]
 */
async function fetchArcaconData(packageId) {
  const url = `https://arca.live/api/emoticon2/${packageId}`;
  try {
    const res = await fetch(url, {
      headers: {
        pragma: "no-cache",
        origin: "https://arca.live",
        referer: "https://arca.live/",
        "cache-control": "no-cache",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
      },
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch arcacon data:", err);
    return [];
  }
}

/**
 * 파일 배열을 받아 ZIP으로 압축하여 다운로드
 * @param {Array} files  [{ url: string, type?: string }, ...]
 */
const saveFilesAsZip = (files) => {
  const zip = new JSZip();

  // 파일 각각 fetch -> blob -> zip에 추가
  let remoteZips = files.map(async (file, index) => {
    if (!file.url) return;

    const response = await fetch(file.url, {
      headers: {
        pragma: "no-cache",
        origin: "https://arca.live",
        referer: "https://arca.live/",
        "cache-control": "no-cache",
        "cache-directive": "no-cache",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
      },
    }).catch((err) => {
      console.error("Fetch error:", err);
    });

    if (!response || !response.ok) return;
    let fetchedFile = await response.blob();

    // 다운로드 진행 상황 표시
    if (!isDownloading) isDownloading = true;
    downloadCount += 1;
    document.querySelector("#arcaconDownloadText").innerHTML = `${downloadCount}/${files.length}`;
    $("#arcaconDownloadProgress").css("width", `calc(${downloadCount}% - 0.5em)`);

    // 파일 타입 확인
    // const mimeType = fetchedFile.type; // ex) 'image/webp', 'video/mp4', 'image/png'...
    const arcaconIndex = `${arcaconTitleName}_${index + 1}`;
    // // 1) image/webp -> (선택적으로) PNG 리사이즈
    // if (mimeType === "image/webp") {
    //   const shouldResize = false; // 필요시 true로
    //   if (shouldResize) {
    //     // 리사이징 로직
    //     const canvas = document.createElement("canvas");
    //     const context = canvas.getContext("2d");
    //     const img = await createImageBitmap(fetchedFile);
    //     canvas.width = 100;
    //     canvas.height = (img.height * 100) / img.width;
    //     context.drawImage(img, 0, 0, canvas.width, canvas.height);
    //     const resizedBlob = await new Promise((resolve) => {
    //       canvas.toBlob((blob) => resolve(blob), "image/png", 1);
    //     });
    //     zip.file(`${arcaconIndex}.png`, resizedBlob, { binary: true });
    //   } else {
    //     // 그대로 webp로 압축에 추가
    //     zip.file(`${arcaconIndex}.webp`, fetchedFile, { binary: true });
    //   }
    // }
    // // 2) video/mp4 -> 확장자 mp4 그대로
    // else if (mimeType === "video/mp4") {
    //   zip.file(`${arcaconIndex}.mp4`, fetchedFile, { binary: true });
    // }
    // // 3) 그 외의 이미지 타입
    // else if (mimeType.startsWith("image/")) {
    //   // ex) image/png, image/jpeg, ...
    //   const extension = mimeType.split("/")[1];
    //   zip.file(`${arcaconIndex}.${extension}`, fetchedFile, { binary: true });
    // }
    // // 4) 혹시 file.type이 비어있거나 기타 타입인 경우
    // else {
      // 만약 file.type 속성이 API에서 넘어왔다면 그 정보를 사용 가능
      // 예: if (file.type === 'image' || 'video'), 등
      const fallbackExt = file.type === "video" ? "gif" : "png"; // 혹은 "bin" 등등
      // 여기서는 간단히 확장자 없이 처리
      zip.file(fallbackExt ? `${arcaconIndex}.${fallbackExt}` : arcaconIndex, fetchedFile, { binary: true });
    // }
  });

  // 모든 파일 처리가 끝나면 ZIP 생성 후 다운로드
  Promise.all(remoteZips).then(() => {
    $("#arcaconDownloadText").text("아카콘 다운로드");
    downloadCount = 0;
    isDownloading = false;
    $("#arcaconDownloadProgress").css("width", `0%`);

    zip.generateAsync({ type: "blob" }).then((blob) => {
      saveAs(blob, `${arcaconTitleName}.zip`);
    });
  });
};

// DOM 로드 완료 시
$(document).ready(function () {
  const urlPost = new URL(window.location.href);
  // 아카라이브 게시글 페이지인 경우에만 동작
  if (arcaPostURLRegex1.test(urlPost.origin + urlPost.pathname) || arcaPostURLRegex2.test(urlPost.origin + urlPost.pathname)) {
    const arcaconFormContainer = $(".reply-form-button-container"); // 댓글 컨테이너
    const arcaconButton = $(".reply-form-arcacon-button.btn-namlacon"); // 아카콘 버튼
    const arcaconWrapper = $(".arcaconPicker"); // 아카콘 버튼 누르면 보이는 영역

    let arcaconPackageId = 0; // 아카콘 타이틀별 패키지 아이디
    let arcaconImageContainer = $(`.package-wrap[data-package-id="${arcaconPackageId}"]`);

    // 아카콘 다운로드 버튼(아래에서 append)
    let arcaconDownloadButton;

    // 아카콘 버튼 클릭 시: 다운로드 버튼 표시/숨김
    arcaconButton.click(function (e) {
      e.preventDefault();
      if (arcaconWrapper.css("display") === "none") {
        arcaconDownloadButton.css("display", "flex");
      } else {
        arcaconDownloadButton.css("display", "none");
      }
    });

    // 아카콘 다운로드 버튼 DOM 추가
    arcaconFormContainer.append(`
      <button class="reply-form-voice-button btn-arcaconDownload" type="button" tabindex="105" style="display: none;">
        <span class="ion-android-download"></span>
        <span class="text" id="arcaconDownloadText">&nbsp;아카콘 다운로드</span>
        <div id="arcaconDownloadProgress" style="width: 0%;"></div>
      </button>
    `);
    arcaconDownloadButton = $(".reply-form-voice-button.btn-arcaconDownload");

    // 다운로드 버튼 클릭 -> 현재 포커스된 아카콘 패키지(arcaconPackageId) 확인 -> API 호출 -> ZIP 다운로드
    arcaconDownloadButton.click(async function (e) {
      e.preventDefault();
      if (arcaconWrapper.css("display") === "none") {
        alert("아카콘 리스트를 열어주세요.");
        return;
      }

      // 포커스된 아카콘 패키지 정보
      arcaconTitleName = $(".arcaconPicker .package-item.focused").data("packageName");
      arcaconPackageId = $(".arcaconPicker .package-item.focused").data("packageId");
      arcaconImageContainer = $(`.package-wrap[data-package-id="${arcaconPackageId}"]`);
      console.log("Selected Arcacon:", arcaconTitleName, arcaconPackageId, arcaconImageContainer);

      if (!isDownloading) {
        // 1) API로부터 아카콘 목록 가져오기
        const arcaconDataList = await fetchArcaconData(arcaconPackageId);
        // arcaconDataList: [{ id, imageUrl, type }, ...]

        // 2) arcaconsURLArray 구성 (url, type)
        arcaconsURLArray = arcaconDataList.map((item) => {
          // API가 반환하는 imageUrl 앞에 https: 가 빠져 있을 수 있으므로 보정
          if (item.type == 'video') {
              fullUrl = `https:${item.orig}`;
          } else {
              fullUrl = `https:${item.imageUrl}`;
          }
          const fullGifUrl = `https:${item.orig}`;
          return {
              url: fullUrl,
              type: item.type, // 'image' or 'video' etc.
          };
        });

        // 3) ZIP으로 다운로드
        saveFilesAsZip(arcaconsURLArray);
      } else {
        alert("현재 아카콘을 다운로드 중입니다.");
      }
    });
  }
});
