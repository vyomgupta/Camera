let body=document.querySelector("body");
let video=document.querySelector("video");
let vidBtn=document.querySelector("#record");
let capBtn=document.querySelector("#capture");
let zoomIn=document.querySelector(".zoom-in");
let zoomOut=document.querySelector(".zoom-out");
let allFilters=document.querySelectorAll(".filters");
let galleryBtn=document.querySelector("#gallery");
let constraints={video:true,audio:true};
let mediaRecorder;
let isRecording=false;
let chunks=[];
let filter="";

let minZoom=1;
let maxZoom=3;
let currZoom=1;

for(let i=0;i<allFilters.length;i++){
    allFilters[i].addEventListener("click",function(e){
        filter=e.currentTarget.style.backgroundColor;
        removeFilter();
        applyFilter(filter);
    });
}

galleryBtn.addEventListener("click",function(){
    location.assign("gallery.html");
})

zoomIn.addEventListener("click",function(e){
    if(currZoom>maxZoom)
        return;
    else{
        currZoom+=0.1;
        video.style.transform=`scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click",function(e){
    if(currZoom<minZoom)
        return;
    else{
        currZoom-=0.1;
        video.style.transform=`scale(${currZoom})`;
    }
});

vidBtn.addEventListener("click", function(){
    let innerRecord=document.querySelector(".inner-record");
    if(isRecording){
        innerRecord.classList.remove("record-animation");
        mediaRecorder.stop();
        isRecording=false;
    }else{
        mediaRecorder.start();
        filter="";
        removeFilter();
        currZoom=1;
        video.style.transform=`scale(1)`;
        innerRecord.classList.add("record-animation");
        isRecording=true;
    }
});

capBtn.addEventListener("click",function(){
    let innerCapture=document.querySelector(".inner-capture");
    innerCapture.classList.add("capture-animation");
    setTimeout(() => {
        innerCapture.classList.remove("capture-animation");
    }, 500);
    capture();
});

navigator.mediaDevices.getUserMedia(constraints)
.then(function(mediaStream){
    video.srcObject=mediaStream;
    mediaRecorder=new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener("dataavailable",function(e){
        chunks.push(e.data);
    });
    mediaRecorder.addEventListener("stop",function(){
        let blob=new Blob(chunks,{type: "video/mp4"});
        addMedia("video",blob);
        chunks=[];
    });
});

function capture(){
    let c=document.createElement("canvas");
    c.width=video.videoWidth;
    c.height=video.videoHeight;
    let ctx=c.getContext("2d");
    ctx.translate(c.width/2,c.height/2);
    ctx.scale(currZoom,currZoom);
    ctx.translate(-c.width/2,-c.height/2);
    ctx.drawImage(video,0,0,);
    if(filter!=""){
        ctx.fillStyle=filter;
        ctx.fillRect(0,0,c.width,c.height);
    }
    addMedia("img",c.toDataURL());
}

function applyFilter(filterColor){
    let filterDiv=document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor=filterColor;
    body.append(filterDiv);
}

function removeFilter(){
    let filterDiv=document.querySelector(".filter-div");
    if(filterDiv){
        filterDiv.remove();
    }
}