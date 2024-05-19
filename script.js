let currSong = new Audio()
async function getSongs(folder) {
    let a = await fetch(`${folder}`)
    let response = await a.text()
    let anotherDiv = document.createElement("div")
    anotherDiv.innerHTML = response
    let x = anotherDiv.querySelector("#wrapper")
    let y = Array.from(x.getElementsByTagName("a"))
    let songs = []
    for (let i = 0; i < y.length; i++) {
        if (y[i].href.endsWith('.mp3')) {
            songs.push(y[i].href)
        }
    }

    return songs
}
async function getFolders() {
    let a = await fetch("http://192.168.43.235:5500/songs/")  //192.168.43.235:5500 //localhost:5500
    let response = await a.text()
    let anotherDiv = document.createElement("div")
    anotherDiv.innerHTML = response
    let x = anotherDiv.querySelector("#wrapper")
    let y = Array.from(x.getElementsByTagName("a"))
    let folder = []
    for (let i = 0; i < y.length; i++) {
        if (!y[i].href.endsWith('/') && !y[i].href.endsWith('/songs')) {
            folder.push(y[i].href)
        }
    }

    return folder
}
function getCurrTime() {

    let interval = setInterval(() => {
        let currentMinutes = Math.floor(currSong.currentTime / 60);
        let currentSeconds = Math.ceil(currSong.currentTime % 60);
        let durationMinutes = Math.floor(currSong.duration / 60);
        let durationSeconds = Math.ceil(currSong.duration % 60);

        // Ensure seconds are two digits
        if (currentSeconds < 10) currentSeconds = '0' + currentSeconds;
        if (durationSeconds < 10) durationSeconds = '0' + durationSeconds;

        document.querySelector(".time").innerHTML = `${currentMinutes}:${currentSeconds}/${durationMinutes}:${durationSeconds}`;

        // Check if the song has ended
        if (currSong.currentTime >= currSong.duration) {
            clearInterval(interval);
        }
    }, 1000);
    currSong.addEventListener('ended', () => {
        clearInterval(interval);
    });
}
function getSongInfo(element) {
    let name = element.split("/")[element.split("/").length - 1].replaceAll("%20", " ").split(".")[0].split(" - ")[0]
    document.querySelector(".songinfo").textContent = name
}
async function getImageUrl(url) {

    let a = await (await fetch(`${url}/`)).text()
    let tempdiv = document.createElement("div")
    tempdiv.innerHTML = a
    let x = tempdiv.querySelector("#wrapper")
    let y = Array.from(x.getElementsByTagName("a"))
    let image
    for (let i = 0; i < y.length; i++) {
        if (y[i].href.endsWith('.jpg')) {
            image = y[i].href
        }
    }
    //  /songs/Arijit/arijitSingh.jpg/
    return image
}
function changeSeekbarByUser() {
    let line = document.querySelector(".line");
    let circle = document.querySelector(".circle");
    line.addEventListener("click", e => {
        let position = e.offsetX / line.offsetWidth * 100;
        circle.style.left = position + "%"
        let currTime = position * currSong.duration / 100
        modifyCurrTime(currTime)
    })
}
function modifyCurrTime(time) {
    if (currSong.paused) {
        currSong.currentTime = time
    }
    else {
        currSong.currentTime = time
        currSong.play()
    }

}
function playSong(url) {
    play.src = "pause.svg"
    currSong.src = url
    currSong.play()
    getCurrTime()
    seekFunc()
}
async function makeCards(arr) {
    let clutter = "";
    for (let element of arr) {
        let name = element.split("/songs/")[1].replaceAll("%20", " ");
        let image = await getImageUrl(element); // Await here to ensure getImageUrl is resolved before proceeding
        // console.log(image.split("5500")[1]);
        clutter += `<div class="card"><div class="play"><img src="play.svg" alt=""></div><img class="art" src="${image.split("5500")[1]}"  alt=""><h3>${name}</h3></div>`;
    }
    return clutter;
}

async function artistUrl(url) {
    let artistSongs = await getSongs(url)
    return artistSongs
}
async function makeTile(url) {
    let artistSongs = await artistUrl(url)
    let clutter = ""
    let tile = document.getElementsByClassName("scroll")
    artistSongs.forEach((value) => {
        let songName = value.split("/")[value.split("/").length - 1].replaceAll("%20", " ").split(".")[0].split(" - ")[0]
        clutter += `<div class="tile"><img src="music.svg" alt=""><p class="music-name">${songName}</p></div>`
    })
    // basic()
    return clutter
}
function seekFunc() {
    let circle = document.querySelector(".circle")
    let interval = setInterval(() => {
        let int = currSong.currentTime
        let total = currSong.duration
        let percent = int / total * 100
        circle.style.left = percent + "%"

        if (percent === 100) {
            circle.style.left = 0
            play.src = "songPlay.svg"
            currSong.currentTime = 0
            currSong.pause()
            clearInterval(interval)
        }
    }, 1);

}
async function main() {
    let currentlyPlaying
    let folder = await getFolders()
    let playlist = document.querySelector(".playlists")
    let card = await makeCards(folder)
    playlist.innerHTML = card
    let uniTile
    let tileArr
    let cardArr = Array.from(playlist.getElementsByClassName("card"))
    let tempArr = Array.from(document.querySelectorAll(".not-clickable"))
    tempArr.forEach((value)=>{
        value.addEventListener("click", ()=>{
            let doc = document.querySelector(".temporary")
            doc.style.opacity = 1
            doc.style.scale = 1
        })
    })
    document.querySelector(".btn").addEventListener("click", ()=>{
        let doc = document.querySelector(".temporary")
            doc.style.opacity = 0
            doc.style.scale = 0
    })
    document.querySelector(".burger").addEventListener("click", () => {
        let left = document.querySelector(".left")
        left.style.translate = 0
        left.style.opacity = 1
    })
    document.querySelector(".close").addEventListener("click", () => {
        let left = document.querySelector(".left")
        left.style.translate = "-105%"
        left.style.opacity = 0
    })
    cardArr.forEach((value, i) => {
        value.addEventListener("click", async () => {
            let left = document.querySelector(".left")
            left.style.translate = 0
            left.style.opacity = 1
            let songs = getFolders()
            let scroll = document.querySelector(".scroll")
            let tile = await makeTile(folder[i])
            scroll.innerHTML = tile
            uniTile = await artistUrl(folder[i])
            tileArr = Array.from(scroll.getElementsByClassName("tile"))
            tileArr.forEach((value, index) => {
                value.addEventListener("click", () => {
                    currentlyPlaying = index
                    playSong(uniTile[index])
                    getSongInfo(uniTile[index])
                })
            })
        })
    })


    let play = document.getElementById("play")
    let prev = document.getElementById("prev")
    let next = document.getElementById("forw")
    next.addEventListener("click", () => {
        if (currSong.src != "") {
            if (currentlyPlaying < uniTile.length - 1) {
                currentlyPlaying++
            }
            else {
                currentlyPlaying = 0
            }

            playSong(uniTile[currentlyPlaying])
            getSongInfo(uniTile[currentlyPlaying])
        }
    })
    prev.addEventListener("click", () => {
        if (currSong.src != "") {
            if (currentlyPlaying > 0) {
                currentlyPlaying--
            }
            else {
                currentlyPlaying = uniTile.length - 1
            }

            playSong(uniTile[currentlyPlaying])
            getSongInfo(uniTile[currentlyPlaying])
        }
    })
    play.addEventListener("click", () => {
        if (currSong.paused && currSong.src != "") {
            play.src = "pause.svg"
            currSong.play()
            seekFunc()
            getCurrTime()
        }
        else {
            play.src = "songPlay.svg"
            currSong.pause()
        }
    })
}
main()
changeSeekbarByUser()
