let currentsong = new Audio();
let songs;
let currfolder;
//secont to minue
function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);

  // agar seconds ya minutes 0-9 hai to aage 0 lagaye
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (remainingSeconds < 10) {
    remainingSeconds = "0" + remainingSeconds;
  }

  return `${minutes}:${remainingSeconds}`;
}


async function getsongs(folder) {
  currfolder = folder
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
  }
  //show all the songs in the playlist
  let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                    <div class="songinfo">
                    <div>${song.replaceAll("%20", " ")}</div>
                    <div>mirza</div>
                    </div>
                    <div class="playnow">
                        <span>play now</span>
                        <img class="invert"src="img/playnow.svg" alt="">
                     </div>
                </li>`;

  }
  // attach an eventlistner to each song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playmusic(e.querySelector(".songinfo").firstElementChild.innerHTML.trim())
    })
  })
  return songs
}


const playmusic = (track, pause = false) => {
  // let audio=new Audio("/songs/"+track)
  currentsong.src = `/${currfolder}/` + encodeURIComponent(track);
  if (!pause) {
    currentsong.play();
    play.src = "img/paused.svg"
  }


 document.getElementById("currentsonginfo").innerHTML = `<div class="scrolling-text">${decodeURI(track.replace(".mp3", ""))}</div>`;

  document.querySelector(".time").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let anchors = div.getElementsByTagName("a")
  let cardcontainer = document.querySelector(".cardcontainer")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];


    if (e.href.includes("/songs")) {

      let folder = e.href.split("/").slice(-2)[0]
      //get the meta data of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
      let response = await a.json();
      let artistHTML = response.description
        .split(",")
        .map(artist => `<span>${artist}</span>`)
        .join(", ");

      cardcontainer.innerHTML = cardcontainer.innerHTML + `   <div  data-folder="${folder}" class="card ">
                        <div class="playbutton">
                            <svg class="play-button" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="50" fill="#1ed760" />
                                <polygon points="40,30 70,50 40,70" fill="#000" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="image">
                        <h3>${response.title}</h3>
                        <p>${artistHTML}</p>
                    </div>`
    }
  }
  //load the playlist whenever it clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)

    })
  })
}

//artist album displya
async function displayArtists() {
  let a = await fetch(`http://127.0.0.1:3000/artists/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response
  let anchors = div.getElementsByTagName("a")
  let roundcontainer = document.querySelector(".roundcontainer")
  let array = Array.from(anchors)

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/artists")) {
      let folder = e.href.split("/").slice(-2)[0]
      // get metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/artists/${folder}/info.json`)
      let response = await a.json();

      roundcontainer.innerHTML += ` 
      <div data-folder="${folder}" class="card2">
          <div class="playbutton">
              <svg class="play-button" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#1ed760" />
                  <polygon points="40,30 70,50 40,70" fill="#000" />
              </svg>
          </div>
          <img src="/artists/${folder}/cover.jpg" alt="">
          <h3>${response.name}</h3>
          <p>${response.description}</p>
      </div>`
    }
  }

  // Load playlist whene artist click card 
  Array.from(document.getElementsByClassName("card2")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(`artists/${item.currentTarget.dataset.folder}`)
    })
  })
}


//get the list of all the songs
async function main() {
  //display all album on the page
  displayAlbums()
  displayArtists()

  //attached  an event listner to play 
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = "img/paused.svg"
    }
    else {
      currentsong.pause()
      play.src = "img/play.svg"
    }
  })


  //listen for time update event
  currentsong.addEventListener("timeupdate", () => {
    //console.log( currentsong.duration,currentsong.currentTime);
    document.querySelector(".time").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

  })
  //addd and even listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100
  })
  //add event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })
  //add event listner for close btn
  document.querySelector(".cross").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%"
  })
  //add event listner to previous song
  previous.addEventListener("click", () => {
    currentsong.pause()
    let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0])
    let index = songs.indexOf(currentTrack)
    if (index > 0) {
      playmusic(songs[index - 1])
    } else {
      // pehle song se peechhe jayega to last wala chale
      playmusic(songs[songs.length - 1])
    }
  })
  //add event listner to next 
  Next.addEventListener("click", () => {
    currentsong.pause()
    let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0])
    let index = songs.indexOf(currentTrack)
    if (index < songs.length - 1) {
      playmusic(songs[index + 1])
    } else {
      // last song ke baad first wala chale
      playmusic(songs[0])
    }
  })

  // rigth-left scrolll 
let cardContainer = document.querySelector(".cardcontainer");
let leftArrow = document.querySelector(".left-arrow");
let rightArrow = document.querySelector(".right-arrow");

// Function to check and toggle arrow visibility
function toggleArrows() {
  if (cardContainer.scrollLeft > 0) {
    leftArrow.style.display = "block";
  } else {
    leftArrow.style.display = "none";
  }

  if (cardContainer.scrollLeft + cardContainer.clientWidth < cardContainer.scrollWidth) {
    rightArrow.style.display = "block";
  } else {
    rightArrow.style.display = "none";
  }
}

// Call once on load
toggleArrows();

// Call every time you scroll
cardContainer.addEventListener("scroll", toggleArrows);

// (optional) call on hover if you need too:
cardContainer.addEventListener("mouseenter", toggleArrows);

// ✅ Yeh line add kiya: hide on mouseleave — but only if mouse not over arrows
cardContainer.addEventListener("mouseleave", (e) => {
  if (
    e.relatedTarget !== leftArrow &&
    e.relatedTarget !== rightArrow
  ) {
    leftArrow.style.display = "none";
    rightArrow.style.display = "none";
  }
});

rightArrow.addEventListener('click', () => {
  cardContainer.scrollBy({
    left: 300,
    behavior: 'smooth'
  });
});

leftArrow.addEventListener('click', () => {
  cardContainer.scrollBy({
    left: -300,
    behavior: 'smooth'
  });
});



  //artists scroll
 // Artist card horizontal scroll
let artistContainer = document.querySelector(".roundcontainer");
let artistLeftArrow = document.querySelector(".artist-left-arrow");
let artistRightArrow = document.querySelector(".artist-next-arrow");

// Function to check and toggle arrow visibility for artist cards
function toggleArtistArrows() {
  if (artistContainer.scrollLeft > 0) {
    artistLeftArrow.style.display = "block";
  } else {
    artistLeftArrow.style.display = "none";
  }

  if (artistContainer.scrollLeft + artistContainer.clientWidth < artistContainer.scrollWidth) {
    artistRightArrow.style.display = "block";
  } else {
    artistRightArrow.style.display = "none";
  }
}

// Call once on load
toggleArtistArrows();

// Call every time you scroll
artistContainer.addEventListener("scroll", toggleArtistArrows);

// call on hover if needed
artistContainer.addEventListener("mouseenter", toggleArtistArrows);

// hide on mouseleave — but only if mouse not over arrows
artistContainer.addEventListener("mouseleave", (e) => {
  if (
    e.relatedTarget !== artistLeftArrow &&
    e.relatedTarget !== artistRightArrow
  ) {
    artistLeftArrow.style.display = "none";
    artistRightArrow.style.display = "none";
  }
});

// Arrow button click actions
artistRightArrow.addEventListener("click", () => {
  artistContainer.scrollBy({
    left: 300,
    behavior: 'smooth'
  });
});

artistLeftArrow.addEventListener("click", () => {
  artistContainer.scrollBy({
    left: -300,
    behavior: 'smooth'
  });
});



}
main()

