
function isUTF8(str) {
    let i = 0;
    while (i < str.length) {
        let charCode = str.charCodeAt(i++);
        if ((charCode & 0x80) === 0) continue; // 0xxxxxxx: one-byte character
        if ((charCode & 0xE0) === 0xC0) { // 110xxxxx: two-byte character
            if (i >= str.length || (str.charCodeAt(i++) & 0xC0) !== 0x80) return false;
        } else if ((charCode & 0xF0) === 0xE0) { // 1110xxxx: three-byte character
            if (i + 1 >= str.length || (str.charCodeAt(i++) & 0xC0) !== 0x80 || (str.charCodeAt(i++) & 0xC0) !== 0x80) return false;
        } else if ((charCode & 0xF8) === 0xF0) { // 11110xxx: four-byte character
             if (i + 2 >= str.length || (str.charCodeAt(i++) & 0xC0) !== 0x80 || (str.charCodeAt(i++) & 0xC0) !== 0x80 || (str.charCodeAt(i++) & 0xC0) !== 0x80) return false;
        } else {
            return false; // Invalid UTF-8
        }
    }
    return true;
}
//yeah
/*
MIT LICENSE

Copyright 2011 Jon Leighton

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function base64ArrayBuffer(arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  
    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder
  
    var a, b, c, d
    var chunk
  
    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
    
        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1
    
        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }
  
    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]
    
        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
    
        // Set the 4 least significant bits to zero
        b = (chunk & 3)   << 4 // 3   = 2^2 - 1
    
        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
    
        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
    
        // Set the 2 least significant bits to zero
        c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
    
        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }
    
    return base64
}
//more stuff from stack overflow

function base64ToArrayBuffer(base64) {
    var binaryString = atob(base64);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
//and from now on is my code :)
let meterPixRatio = innerHeight/500
let targetRate=250
const filterS = 10
let frameTime = 0, lastLoop = Date.now(), thisLoop, fps, pfps
let fric = 1.001
let objs = [],
    polys= []
let selecting = false
let selected, drawing;
let lines = [],
    ms=1,
    consolehist = [],
    flipP=[],
    flipR=[],
    flipW=[],
    motor2s=[],                                                                                                                                                
    cellsize = 4,
    ltype=0,
    cres=20,
    loading=true,
    grav = 9.8,
    saved,
    cn = 0,
    c1p,
    c2p,
    ml = false,
    valves = [],
    cv = false,
    paused = false,
    sil = false,
    sobjs = [],
    slines=[],
    av=false,
    mx,
    my,
    mol = false,
    clicking=false,
    fans=[],
    af=false,
    fp = {x:0,y:0},
    infspace=false,
    liq = false,
    selecttype = "none",
    deleting=false,
    tcans=[],
    adding={ia:false,t:0},
    cc,
    cs,
    fliprows = 500/cellsize+1,
    flipcols = fliprows+1,
    waterBlur=1,
    disec = false,
    d1p = {x:0,y:0},
    d2p = {x:0,y:0}
for (let y = 0; y < fliprows; y++){
    flipP.push([])
    for (let x = 0; x < flipcols; x++){
        flipP[y].push({x:null,y:null})
    }
}
for (let y = 0; y < fliprows; y++){
    flipR.push([])
    for (let x = 0; x < flipcols; x++){
        flipR[y].push({x:null,y:null})
    }
}
for (let y = 0; y < fliprows; y++){
    flipW.push([])
    for (let x = 0; x < flipcols; x++){
        flipW[y].push({w1:null,w2:null,w3:null,w4:null})
    }
}

const hRGBa = {"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"a":10,"b":11,"c":12,"d":13,"e":14,"f":15}
const rHEXa = ["0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f"]
function loadJSON(files){
    const reader = new FileReader()
    reader.onload = (e)=>{
        return JSON.parse(e.target.result)
    }
    reader.readAsText(files[0])
}

function HEXRGB(from){
    let c = [0,0,0]
    c[0]=hRGBa[from.charAt(1)]*16
    c[0]+=hRGBa[from.charAt(2)]
    c[1]=hRGBa[from.charAt(3)]*16
    c[1]+=hRGBa[from.charAt(4)]
    c[2]=hRGBa[from.charAt(5)]*16
    c[2]+=hRGBa[from.charAt(6)]
    
    return c
}
function imgSrc(url){
    const srcimg = document.createElement("img")
    srcimg.src=url
    srcimg.style.display="none"
    return srcimg
}
function selectBall(x, y){
    for (let i = 0; i < objs.length; i++){
        if (dist({x, y}, objs[i].p) <= objs[i].r){
            return i
        }
    }
    return undefined 
    
}
function selectValve(x, y){
    for (let i = 0; i < valves.length; i++){
        if (dist({x, y}, valves[i].p) <= valves[i].r){
            return i
        }
    }
    return undefined 
    
}
function selectFan(x, y){
    for (let i = 0; i < fans.length; i++){
        if (dist({x, y}, fans[i].p) <= 20){
            return i
        }
    }
    return undefined
    
}
function selectTCan(x, y){
    for (let i = 0; i < tcans.length; i++){
        if (dist({x, y}, tcans[i]) <= 64){
            return i
        }
    }
    return undefined
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
function addLine(w){
    lines.push({p1:c1p,p2:c2p,w:w, m:{h:false,p:{x:0,y:0},t:0},np1:c1p,np2:c2p,s:0.05, color:HEXRGB(clinp.value)})
    lninp.max=lines.length-1
    cn=0
    ml =false
}
function dist(v1, v2){
    return Math.sqrt((v1.x-v2.x)**2+(v1.y-v2.y)**2)
}
function LD(v1, v2){
    return (v1.x-v2.x)**2+(v1.y-v2.y)**2
}
function linePoint(p1, p2, p) {

    // get distance from the point to the two ends of the line
    const d1 = dist(p, p1);
    const d2 = dist(p, p2);
  
    // get the length of the line
    const lineLen = dist(p1, p2);
  
    // since floats are so minutely accurate, add
    // a little buffer zone that will give collision
    const b = 0.1;    // higher # = less accurate
  
    // if the two distances are equal to the line's
    // length, the point is on the line!
    // note we use the buffer here to give a range,
    // rather than one #
    if (d1+d2 >= lineLen-b && d1+d2 <= lineLen+b) {
        return "EE"
    }
    if (d1<=d2){
        return p1
    } else {
        return p2
    }
}
function snapLines(x, y){
    //if(slines.checked){
        let snapx = x
        let snapy = y
        lines.forEach(line =>{

            let npl = linePoint(line.p1, line.p2, {x,y})
            if (npl === "EE"){

                
                const d = ( ((x-line.p1.x)*(line.p2.x-line.p1.x)) + ((y-line.p1.y)*(line.p2.y-line.p1.y)) ) / dist(line.p1, line.p2)**2;
                let cx = line.p1.x + (d * (line.p2.x-line.p1.x))
                let cy = line.p1.y + (d * (line.p2.y-line.p1.y))
                npl = {x:cx,y:cy}
            }
            if (dist(npl, {x,y}) <= Math.max(line.w/2, 10)){

                snapx = npl.x
                snapy = npl.y
            }
            if (dist(line.p1, {x,y})<=Math.max(line.w/2, 20)){
                snapx = line.p1.x
                snapy = line.p1.y
            }
            if (dist(line.p2, {x,y})<=Math.max(line.w/2, 20)){
                snapx = line.p2.x
                snapy = line.p2.y
            }
        })
        return {x:snapx,y:snapy}
    //}else{return{x,y}}
}
function cpol(l,p){
    const x1 = l.p1.x
    const x2 = l.p2.x
    const y1 = l.p1.y
    const y2 =l.p2.y
    const d = ( ((p.x-x1)*(x2-x1)) + ((p.y-y1)*(y2-y1)) ) / dist(v1, v2)**2;
    let cx = x1 + (d * (x2-x1))
    let cy = y1 + (d * (y2-y1))
    
    const os = linePoint(v1, v2, {x:cx,y:cy})
    if (os !== "EE"){
        cx = os.x
        cy = os.y
    }
    return {x:cx,y:cy}
}
function selectLine(x, y){
    let i = 0
    lines.forEach(line =>{
        let c = cpol(line, {x,y})
        if (dist(c, {x,y}) <= line.w){
            alert(dist(c,{x,y}))
            return i
        }
        i++
    })
    return undefined
}
function select(x, y){
    const bs = selectBall(x, y)
    const ls = selectLine(x, y)
    if (bs!==undefined){
        sil = false
        return bs
    }
    if (ls!==undefined){
        if (bs===undefined){
            sil = true
            return ls
        } else {
            sil = false
            return bs
        }
    }
    return false
}
function selectLinePoint(x,y){
    let i = 0
    let ns = []
    lines.forEach(l => {
        if (dist(l.p1, {x,y})<=Math.max(l.w, 10)){
            ns.push({n:i,pn:0})
        }
        if (dist(l.p2, {x,y})<=Math.max(l.w, 10)){
            ns.push({n:i,pn:1})
        }
        i++
    })
    return ns
}
const getAngle = function(v){
    return Math.atan2(v.y,v.x)
}
function drawImage(image, x, y, scale, rotation){
    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    ctx.rotate(rotation);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    ctx.setTransform(1,0,0,1,0,0)
} 
function drawFan(fan){
    const a = getAngle(fan.dir)+1.57079633
    drawImage(t%2===0?fan1:fan2,fan.p.x,fan.p.y,40/(innerHeight-52),a)
    
}
function notInArray(ar,n){
    for (let i = 0; i < ar.length; i++){
        if (ar[i]===n){
            return false
        }
    }
    return true
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
///
/// Compressed saves
///
function encab(){
    const buf = new ArrayBuffer(lines.length*37+fans.length*24+valves.length*16+tcans.length*8+8)
    const view = new DataView(buf)
    view.setUint16(0, lines.length)
    view.setUint16(2, fans.length)
    view.setUint16(4, valves.length)
    view.setUint16(6, tcans.length)
    let byte = 8
    lines.forEach(l=>{
        let s = l.s
        if (l.m.s){
            s = l.m.s
        }
        //36
        view.setFloat32(byte, l.p1.x)
        byte += 4
        view.setFloat32(byte, l.p1.y)
        byte += 4
        view.setFloat32(byte, l.p2.x)
        byte += 4
        view.setFloat32(byte, l.p2.y)
        byte += 4
        view.setFloat32(byte, l.w)
        byte += 4
        view.setUint8(byte, l.m.h ? 1:0)
        byte ++
        view.setFloat32(byte, l.m.p.x)
        byte += 4
        view.setFloat32(byte, l.m.p.y)
        byte += 4
        view.setFloat32(byte, l.m.t)
        byte += 4
        view.setFloat32(byte, s)
        byte += 4
    })
    fans.forEach(f=>{
        // 24 bytes
        
        view.setFloat32(byte, f.p.x)
        byte += 4
        view.setFloat32(byte, f.p.y)
        byte += 4
        view.setFloat32(byte, f.s)
        byte += 4
        view.setFloat32(byte, f.dir.x)
        byte += 4
        view.setFloat32(byte, f.dir.y)
        byte += 4
        view.setFloat32(byte, f.md)
        byte += 4
    })
    valves.forEach(v=>{
        //16 bytes
        view.setFloat32(byte, v.p.x)
        byte += 4
        view.setFloat32(byte, v.p.y)
        byte += 4
        view.setFloat32(byte, v.r)
        byte += 4
        view.setUint8(byte, v.c[0])
        byte ++
        view.setUint8(byte, v.c[1])
        byte ++
        view.setUint8(byte, v.c[2])
        byte ++
        view.setUint8(byte, v.o ? 1:0)
        byte ++
    })
    tcans.forEach(t=>{
        // 8 bytes
        view.setFloat32(byte, t.x)
        byte += 4
        view.setFloat32(byte, t.y)
        byte += 4
    })
    return buf
}
function encode(){
    const buf = new ArrayBuffer(lines.length*37+fans.length*24+valves.length*16+tcans.length*8+8)
    const view = new DataView(buf)
    view.setUint16(0, lines.length)
    view.setUint16(2, fans.length)
    view.setUint16(4, valves.length)
    view.setUint16(6, tcans.length)
    let byte = 8
    lines.forEach(l=>{
        let s = l.s
        if (l.m.s){
            s = l.m.s
        }
        //36
        view.setFloat32(byte, l.p1.x)
        byte += 4
        view.setFloat32(byte, l.p1.y)
        byte += 4
        view.setFloat32(byte, l.p2.x)
        byte += 4
        view.setFloat32(byte, l.p2.y)
        byte += 4
        view.setFloat32(byte, l.w)
        byte += 4
        view.setUint8(byte, l.m.h ? 1:0)
        byte ++
        view.setFloat32(byte, l.m.p.x)
        byte += 4
        view.setFloat32(byte, l.m.p.y)
        byte += 4
        view.setFloat32(byte, l.m.t)
        byte += 4
        view.setFloat32(byte, s)
        byte += 4
    })
    fans.forEach(f=>{
        // 24 bytes
        
        view.setFloat32(byte, f.p.x)
        byte += 4
        view.setFloat32(byte, f.p.y)
        byte += 4
        view.setFloat32(byte, f.s)
        byte += 4
        view.setFloat32(byte, f.dir.x)
        byte += 4
        view.setFloat32(byte, f.dir.y)
        byte += 4
        view.setFloat32(byte, f.md)
        byte += 4
    })
    valves.forEach(v=>{
        //16 bytes
        view.setFloat32(byte, v.p.x)
        byte += 4
        view.setFloat32(byte, v.p.y)
        byte += 4
        view.setFloat32(byte, v.r)
        byte += 4
        view.setUint8(byte, v.c[0])
        byte ++
        view.setUint8(byte, v.c[1])
        byte ++
        view.setUint8(byte, v.c[2])
        byte ++
        view.setUint8(byte, v.o ? 1:0)
        byte ++
    })
    tcans.forEach(t=>{
        // 8 bytes
        view.setFloat32(byte, t.x)
        byte += 4
        view.setFloat32(byte, t.y)
        byte += 4
    })
    return base64ArrayBuffer(buf)
}
const pf = parseFloat
async function decode(str, typ){
    objs=[]
    lines=[]
    valves=[]
    fans=[]
    tcans=[]
    cn=0
    ml =false
    deleting=false
    adding.ia=false
    if (typ===1){
        const things = str.split(";")

        const ls = things[0].split("n")
        for (let i = 0; i < ls.length-1; i++){

            
            const parts = ls[i].split(",")
            const p1 = v(pf(parts[0]),pf(parts[1]))
            const p2 = v(pf(parts[2]),pf(parts[3]))
            const mp = v(pf(parts[6]),pf(parts[7]))
            lines.push({p1,p2,w:pf(parts[4]), m:{h:parts[5]==="t",p:mp,t:pf(parts[8]),s:pf(parts[9])},np1:p1,np2:p2,s:pf(parts[9])})
            lninp.max=lines.length-1
        }
        const fs = things[1].split("n")
        for (let i = 0; i < fs.length-1; i++){
            const parts = fs[i].split(",")
            //psdirmd
            
            fans.push({
                p: v(pf(parts[0]),pf(parts[1])),
                s: pf(parts[2]),
                dir: v(pf(parts[3]),pf(parts[4])),
                md:pf(parts[5])
            })
        }
        const vs = things[2].split("n")
        for (let i = 0; i < vs.length-1; i++){
            const parts = vs[i].split(",")
            //prco
            valves.push({
                p:v(pf(parts[0]),pf(parts[1])),
                r:pf(parts[2]),
                c:[pf(parts[3]),pf(parts[4]),pf(parts[5])],
                o:parts[6]==="t"
            })
        }
        const ts = things[3].split("n")
        for (let i = 0; i < ts.length-1; i++){
            const parts = ts[i].split(",")
            //prco
            tcans.push({
                x:pf(parts[0]),
                y:pf(parts[1])
            })
        }
    } else if(typ===2) {testDecode(str)}else{testDecode(base64ToArrayBuffer(str))}
        loading=false
}
function testDecode(buf){
    const view= new DataView(buf)
    const linen = view.getUint16(0)
    const fann = view.getUint16(2)
    const valven = view.getUint16(4)
    const tcann = view.getUint16(6)
    console.log("Line count:", linen, "Fan count:", fann, "Valve count:", valven)
    let byte = 8
    for (let i = 0; i < linen; i++){
        const p1x = view.getFloat32(byte)
        byte += 4
        const p1y = view.getFloat32(byte)
        byte += 4
        const p2x = view.getFloat32(byte)
        byte += 4
        const p2y = view.getFloat32(byte)
        byte += 4
        const lw = view.getFloat32(byte)
        byte += 4
        const hm = view.getUint8(byte) === 1
        byte ++
        const mpx = view.getFloat32(byte)
        byte += 4
        const mpy = view.getFloat32(byte)
        byte += 4
        const mt = view.getFloat32(byte)
        byte += 4
        const ms = view.getFloat32(byte)
        byte += 4
        const p1 = v(p1x,p1y)
        const p2 = v(p2x, p2y)
        const mp = v(mpx, mpy)
        lines.push({p1,p2,w:lw, m:{h:hm,p:mp,t:mt,s:ms},np1:p1,np2:p2,s:ms})
    }
    console.log(lines)
    console.log(byte)
    for (let i = 0; i < fann; i++) {
        const x = view.getFloat32(byte);
        byte += 4;
        const y = view.getFloat32(byte);
        byte += 4;
        const s = view.getFloat32(byte);
        byte += 4;
        const dx = view.getFloat32(byte);
        byte += 4;
        const dy = view.getFloat32(byte);
        byte += 4;
        const md = view.getFloat32(byte);
        byte += 4;

        console.log("Decoded fan:", x, y, s, dx, dy, md);

        fans.push({
            p: v(x, y),
            s,
            dir: v(dx, dy),
            md,
        });
    }
    console.log(fans)
    console.log(byte)
    for (let i = 0; i < valven; i++){
        const px = view.getFloat32(byte)
        byte += 4
        const py = view.getFloat32(byte)
        byte += 4
        const r = view.getFloat32(byte)
        byte += 4
        const red = view.getUint8(byte)
        byte ++
        const green = view.getUint8(byte)
        byte ++
        const blue = view.getUint8(byte)
        byte ++
        const o = view.getUint8(byte) === 0 ? false : true
        byte ++
        valves.push({
            p:v(px, py),
            r,
            c:[red,green,blue],
            o
        })
    }
    for (let i = 0; i < tcann; i++){
        const x = view.getFloat32(byte)
        byte += 4
        const y = view.getFloat32(byte)
        byte += 4
        valves.push(v(x,y))
    }
    console.log("Fan count:", fann, "Valve count:", valven);
}
String.prototype.removeCharAt = function (i) {
    var tmp = this.split(''); // convert to an array
    tmp.splice(i - 1 , 1); // remove 1 element from the array (adjusting for non-zero-indexed counts)
    return tmp.join(''); // reconstruct the string
}
function saveData(data, name) {
    if(localStorage.getItem(name) !== null){
        localStorage.clear()
        localStorage.setItem(name, data);
    }
    else{
        localStorage.setItem(name, data);
    }
}
async function setCloudData() {
    return new Promise((resolve, reject) => {
    if (db) {
        const transaction = db.transaction(["saves"], "readwrite")
        const objectStore = transaction.objectStore("saves")

        const getRequest = objectStore.get(saveslot)

        getRequest.onsuccess = function(event) {
            const data = event.target.result
            if (data) {
                data.lines=lines
                data.fans=fans
                data.valves=valves
                data.tcans=tcans
                const putRequest = objectStore.put(data, saveslot)

                putRequest.onsuccess = function() {
                    console.log("Data successfully updated in IndexedDB.")
                };

                putRequest.onerror = function() {
                    console.error("Failed to update data in IndexedDB.")
                };
            } else {
                console.warn("No data found for key 1.")
            }
            resolve(1)
        }

        getRequest.onerror = function() {
            console.error("Failed to retrieve data.")
            reject()
        }
    }
    })
}
function getStorage(name){
    if(localStorage.getItem(name) !== null){
        return localStorage.getItem(name)
    }
}
//
// END COMPRESSED SAVES
//
function seperateLines(x,y){
    let line1 = [false, 0,0]
    for (let i = 0; i < lines.length; i++){
        const l = lines[i]
        if (!line1[0]){
            if (dist(l.p1,{x,y}) <= Math.max(l.w/2,10)){
                line1=[true,0,i]
            }
            if (dist(l.p2,{x,y}) <= Math.max(l.w/2,10)){
                line1=[true,1,i]
            }
        } else {
            const ol = lines[line1[2]]
            if (line1[1]===0){
                    //o ,t
                if (dist(l.p1,{x,y}) <= Math.max(l.w/2,10)){
                    //p1,p1
                    const sd = ol.w/2+l.w/2
                    const tsd = norm(subVec(l.p2,ol.p2))
                    const osd = norm(subVec(ol.p2,l.p2))
                    l.p1 = addVec(l.p1, multVecCon(tsd,sd))
                    ol.p1 = addVec(ol.p1, multVecCon(osd,sd))
                }
                if (dist(l.p2,{x,y}) <= Math.max(l.w/2,10)){
                    const sd = ol.w/2+l.w/2
                    const tsd = norm(subVec(l.p1,ol.p2))
                    const osd = norm(subVec(ol.p2,l.p1))
                    l.p2 = addVec(l.p2, multVecCon(tsd,sd))
                    ol.p1 = addVec(ol.p1, multVecCon(osd,sd))
                    //p1,p2
                    //stuf
                }
            } else {
                if (dist(l.p1,{x,y}) <= Math.max(l.w/2,10)){
                    const sd = ol.w/2+l.w/2
                    const tsd = norm(subVec(l.p2,ol.p1))
                    const osd = norm(subVec(ol.p1,l.p2))
                    l.p1 = addVec(l.p1, multVecCon(tsd,sd))
                    ol.p2 = addVec(ol.p2, multVecCon(osd,sd))
                    //p2, p1
                    //stuf
                }
                if (dist(l.p2,{x,y}) <= Math.max(l.w/2,10)){
                    const sd = ol.w/2+l.w/2
                    const tsd = norm(subVec(l.p1,ol.p1))
                    const osd = norm(subVec(ol.p1,l.p1))
                    l.p2 = addVec(l.p2, multVecCon(tsd,sd))
                    ol.p2 = addVec(ol.p2, multVecCon(osd,sd))
                    //p2, p2
                    //stuf
                }
            }
        }
    }
}
function generateArc(x,y,sx,sy,mx,my,w,cw){
    const v1 = subVec({x:sx,y:sy},{x,y})
    let v2 = norm(subVec({x:mx,y:my},{x,y}))
    const rad = dist({x,y},{x:sx,y:sy})
    v2 = multVecCon(v2,rad)
    let ang = getAngleVec(v1,v2,cw)

    if (cw){
        ang = 2*Math.PI-ang
    }
    const addAng = ang/cres
    ang +=addAng
    const startAng =getAngleVec({x:0,y:rad},v1,!cw)
    let curve = [{x:sx,y:sy}]
        for (let a = startAng; a < startAng+ang; a+=addAng){
            curve.push(
                {
                    x: Math.sin(a)*rad+x,
                    y: Math.cos(a)*rad+y
                }
            )
        }
    for (let i = 1; i < curve.length-1; i++){
        lines.push({p1:curve[i],p2:curve[i+1],w:w, m:{h:false,p:{x:0,y:0},t:0},np1:curve[i],np2:curve[i+1],s:0.05})
    }
    lninp.max=lines.length-1
}
function logInForum(usrname, pword){
    fetch("https://mn4zqn4t-4000.usw3.devtunnels.ms/gyat.html", {
        method: "POST",
        body: {username: usrname, password: pword}
    })
}
function generateArcPrev(x,y,sx,sy,mx,my,w,cw){
    const v1 = subVec({x:sx,y:sy},{x,y})
    let v2 = norm(subVec({x:mx,y:my},{x,y}))
    const rad = dist({x,y},{x:sx,y:sy})
    v2 = multVecCon(v2,rad)
    let ang = getAngleVec(v1,v2,cw)

    if (cw){
        ang = 2*Math.PI-ang
    }
    const addAng = ang/cres
    ang +=addAng
    const startAng =getAngleVec({x:0,y:rad},v1,!cw)
    let curve = [{x:sx,y:sy}]
        for (let a = startAng; a < startAng+ang; a+=addAng){
            curve.push(
                {
                    x: Math.sin(a)*rad+x,
                    y: Math.cos(a)*rad+y
                }
            )
        }
    ctx.beginPath()
    ctx.lineWidth = w
    ctx.moveTo(curve[0].x,curve[0].y)
    for (let i = 1; i < curve.length-1; i++){
        ctx.lineTo(curve[i].x,curve[i].y)
    }
    ctx.stroke()
    lninp.max=lines.length-1
}
function generateBezier(x1,y1,x2,y2,cpx,cpy,w){
    try{
    const d1 = dist({x:x1,y:y1},{x:cpx,y:cpy})
    const d2 = dist({x:x2,y:y2},{x:cpx,y:cpy})
    const step1 = d1/cres
    const step2 = d2/cres
    const n2 = divVecCon(subVec({x:x2,y:y2},{x:cpx,y:cpy}),d2)
    const n1 = divVecCon(subVec({x:cpx,y:cpy},{x:x1,y:y1}),d1)
    let curve = []
    for (let i = 0; i < cres; i++){
        const p1 = addVec(multVecCon(n1, step1*i),{x:x1,y:y1})
        const p2 = addVec(multVecCon(n2, step2*i),{x:x2,y:y2})
        const dpts = dist(p1,p2)
        const step = dpts/cres
        const n = divVecCon(subVec(p2, p1),dpts)
        const p = addVec(multVecCon(n,step*i),p1)
        curve.push(p)
    }
    for (let i = 0; i < curve.length-1; i++){
        lines.push({p1:curve[i],p2:curve[i+1],w:w, m:{h:false,p:{x:0,y:0},t:0},np1:curve[i],np2:curve[i+1],s:0.05})
    }
}catch(e){alert(e)}
}
function generateBezierPrev(x1,y1,x2,y2,cpx,cpy,w){
    try{
    const d1 = dist({x:x1,y:y1},{x:cpx,y:cpy})
    const d2 = dist({x:x2,y:y2},{x:cpx,y:cpy})
    const step1 = d1/cres
    const step2 = d2/cres
    const n2 = divVecCon(subVec({x:x2,y:y2},{x:cpx,y:cpy}),d2)
    const n1 = divVecCon(subVec({x:cpx,y:cpy},{x:x1,y:y1}),d1)
    let curve = []
    for (let i = 0; i < cres; i++){
        const p1 = addVec(multVecCon(n1, step1*i),{x:x1,y:y1})
        const p2 = addVec(multVecCon(n2, step2*i),{x:x2,y:y2})
        const dpts = dist(p1,p2)
        const step = dpts/cres
        const n = divVecCon(subVec(p2, p1),dpts)
        const p = addVec(multVecCon(n,step*i),p1)
        curve.push(p)
    }
    ctx.beginPath()
    ctx.lineWidth = w
    ctx.moveTo(curve[0].x,curve[0].y)
    for (let i = 0; i < curve.length-1; i++){
        ctx.lineTo(curve[i].x,curve[i].y)
    }
    ctx.stroke()
    lninp.max=lines.length-1
}catch(e){alert(e)}
}
/**
 * 
 * @param {FileList} files 
 */
function processFile(files) {
    const file = files[0];
    const t = new Date(file.lastModified)
    if (t.getFullYear()<=2025&&t.getMonth()<=5&&t.getDate()<1){
        const reader = new FileReader()
        reader.onload = function (e) {
            if (e.target.result.charAt(0)==="{"){
                saved = JSON.parse(e.target.result);
                objs=[]
                lines=[]
                valves=[]
                cn=0
                ml =false
                for (let i = 0; i < saved.objs.length; i++){
                    const o = saved.objs[i]
                    objs.push(new Obj(o.x, o.y, o.r, o.c, o.w, o.vx, o.vy, o.b, o.liquid, o.surftens))
                    objs[i].f = o.f
                }
                for (let i = 0; i < saved.valves.length; i++){
                    const o = saved.valves[i]
                    valves.push({p:o.p,r:o.r,c:o.c,o:o.o})
                }
                lines = saved.lines
                fans = saved.fans
                tcans = saved.tcans
            } else {
                if (parseInt(e.target.result.charAt(0))){
                    decode(e.target.result, 1)
                }
                decode(atob(e.target.result),3)
            }
        }
        reader.readAsText(file)
    } else {
        const reader = new FileReader()
        reader.onload = function (e) {
            console.log(e.target.result)
            testDecode(e.target.result)
        }
        reader.readAsArrayBuffer(file)
    }
}
const objToString = obj => Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(',\n');
function log(text){
    const tt = typeof text
    switch(tt){
        case "string":
            getEl("result").innerText += "\n"+text
            break
        case "number":
            getEl("result").innerText += "\n"+text
            break
        case "object":
            getEl("result").innerText += "\n"+objToString(text)
            break
        case "array":
            getEl("result").innerText += "\n["+text+"]"
            break
        default:
            getEl("result").innerText += "\n"+text
    }
    
}
function clearConsole(){//1000 lines!!!!!!!!!!!!!!!!!!!
    getEl("result").innerText=""
}
function textToHTML(text){
    return text.replace("\n", "<br>")
}
function loadSave(slot){
    const transaction = db.transaction(["saves"], "readonly")
    const objectStore = transaction.objectStore("saves")

    const getRequest = objectStore.get(slot)

    getRequest.onsuccess = function(event) {
        const data = event.target.result
        lines = data.lines
        fans = data.fans
        valves = data.valves
        tcans = data.tcans
    }

    getRequest.onerror = function() {
        console.error("Failed to retrieve data.")
    }
}

function compareArr(arr1, arr2){
    let isMatch = arr1.length===arr2.length
    let i = 0
    arr1.forEach(el => {
        if (el !== arr2[i]){
            isMatch=false
        }
        i++
    });
    return isMatch
}
function pointInBox(x1, y1, x2, y2, p){
    return p.x>x1&&p.y>y1&&p.x<x2&&p.y<y2
}