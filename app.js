import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.7.0";

const $ = id => document.getElementById(id);
const fileInput=$("file"), drop=$("drop"), choose=$("choose"), status=$("status");
const result=$("result"), orig=$("orig"), out=$("out"), ometa=$("ometa"), rmeta=$("rmeta"), download=$("download");
let resultURL=null, sourceURL=null, sourceName="image";

function msg(text, error=false){status.textContent=text;status.className="status show"+(error?" error":"");}
function bytes(n){let u=["B","KB","MB","GB"],i=n?Math.floor(Math.log(n)/Math.log(1024)):0;return `${(n/Math.pow(1024,i)).toFixed(i?1:0)} ${u[i]}`;}
function dims(url){return new Promise(res=>{let im=new Image();im.onload=()=>res([im.naturalWidth,im.naturalHeight]);im.src=url;});}

choose.onclick=e=>{e.stopPropagation();fileInput.click()};
drop.onclick=()=>fileInput.click();
fileInput.onchange=()=>fileInput.files[0]&&run(fileInput.files[0]);

["dragenter","dragover"].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.add("drag")}));
["dragleave","drop"].forEach(x=>drop.addEventListener(x,e=>{e.preventDefault();drop.classList.remove("drag")}));
drop.addEventListener("drop",e=>{let f=e.dataTransfer.files[0];if(f)run(f)});

async function run(file){
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)) return msg("Please choose JPG, PNG or WebP.",true);
  if(file.size>20*1024*1024) return msg("This image is larger than 20 MB.",true);

  if(resultURL) URL.revokeObjectURL(resultURL);
  if(sourceURL) URL.revokeObjectURL(sourceURL);
  result.style.display="none";
  sourceName=(file.name||"image").replace(/\.[^.]+$/,"");
  sourceURL=URL.createObjectURL(file);
  orig.src=sourceURL;
  const [w,h]=await dims(sourceURL);
  ometa.textContent=`${w} × ${h} · ${bytes(file.size)}`;

  msg("Preparing AI model… The first run can take a little time.");
  try{
    const blob=await removeBackground(file,{
      model:"isnet_quint8",
      device:"cpu",
      publicPath:"https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/",
      output:{format:"image/png",quality:1},
      progress:(key,current,total)=>{
        if(total) msg(`AI processing… ${Math.round(current/total*100)}%`);
      }
    });
    resultURL=URL.createObjectURL(blob);
    out.src=resultURL;
    rmeta.textContent=`${w} × ${h} · ${bytes(blob.size)}`;
    result.style.display="grid";
    msg("✓ Done. Your transparent PNG is ready.");
    download.onclick=()=>{const a=document.createElement("a");a.href=resultURL;a.download=`${sourceName}-no-background.png`;a.click()};
    result.scrollIntoView({behavior:"smooth",block:"center"});
  }catch(err){
    console.error(err);
    msg("Background removal failed. Check your internet connection, then refresh and try again. If it still fails, send me a screenshot of this error from the browser Console.",true);
  }
}
