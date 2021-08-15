let dbAccess;
let container=document.querySelector(".container");

let request = indexedDB.open("Camera", 1);
request.addEventListener("success", function () {
    dbAccess = request.result;
});
request.addEventListener("upgradeneeded", function () {
    let db = request.result;
    db.createObjectStore("gallery", { keyPath: "mId" });
});
request.addEventListener("error", function () {
    alert("some error occured");
});

function addMedia(type,media){
    let tx=dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore = tx.objectStore("gallery");
    let data = {
        mId: Date.now(),
        type,
        media
    };
    galleryObjectStore.add(data);
}

function viewMedia(){
    let tx=dbAccess.transaction("gallery","readonly");
    let galleryObjectStore=tx.objectStore("gallery");
    let req=galleryObjectStore.openCursor();
    req.addEventListener("success",function(){
        let cursor=req.result;
        if(cursor){
            let div=document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML=`<div class="media-container"></div>
                            <div class="action-container">
                                <button class="media-download">Download</button>
                                <button class="media-delete" id=${cursor.value.mId}>Delete</button>
                            </div>`;
            let downloadBtn = div.querySelector(".media-download");
            let deleteBtn = div.querySelector(".media-delete");
            deleteBtn.addEventListener("click",function(){
                let mId=deleteBtn.getAttribute("id");
                div.remove();
                deleteMediaFromDB(mId);
            });
            if (cursor.value.type == "img") {
                let img = document.createElement("img");
                img.classList.add("media-gallery");
                img.src = cursor.value.media;
                div.querySelector(".media-container").appendChild(img);
                downloadBtn.addEventListener("click", function (e) {
                    let a = document.createElement("a");
                    a.download = "image.jpg";
                    a.href = img.src;
                    a.click();
                    a.remove();
                });
            } else {
                let video = document.createElement("video");
                video.classList.add("media-gallery");
                video.src = URL.createObjectURL(cursor.value.media);
                div.querySelector(".media-container").appendChild(video);
                video.addEventListener("mouseenter", function (e) {
                    video.controls = true;
                    video.play();
                    video.currentTime = 0;
                    video.loop = true;
                });
                video.addEventListener("mouseleave",function(e){
                    video.controls=false;
                    video.pause();
                });
                downloadBtn.addEventListener("click",function(e){
                    let a=document.createElement("a");
                    a.download="video.mp4";
                    a.href=video.src;
                    a.click();
                    a.remove();
                });
            }
            container.appendChild(div);
            cursor.continue();
        }
    })
};

function deleteMediaFromDB(mId){
    let tx=dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore=tx.objectStore("gallery");
    galleryObjectStore.delete(parseInt(mId));
}