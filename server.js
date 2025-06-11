function mostrarRegistro() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registerContainer").style.display = "block";
}

function mostrarLogin() {
  document.getElementById("registerContainer").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
}
// En server.js, añade esto después de las funciones de mostrar/ocultar:
document.getElementById("registerBtn").addEventListener("click", async () => {
  const newUsername = document.getElementById("newUsername").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const message = document.getElementById("registerMessage");

  if (!newUsername || !newPassword) {
    message.textContent = "Completa todos los campos.";
    return;
  }

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: newUsername,
        password: newPassword
      })
    });

    const result = await response.text();
    
    if (!response.ok) {
      message.textContent = result;
      return;
    }

    message.textContent = "¡Cuenta creada! Ahora podés iniciar sesión.";
    setTimeout(mostrarLogin, 2000);
    
  } catch (err) {
    message.textContent = "Error de conexión";
    console.error(err);
  }
});
let currentUser = null;
let songs = [];
let currentIndex = 0;
let playedCount = 0;
let audio = document.getElementById("audio");

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

const isLoggedIn = getCookie("isLoggedIn");
if (isLoggedIn === "true") {
  currentUser = {
    username: getCookie("username"),
    premium: getCookie("premium") === "true"
  };
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("app").style.display = "block";
  document.getElementById("registerToggle").style.display = "none";
  document.getElementById("menuUser").textContent = currentUser.username;

  if (currentUser.premium) {
    document.getElementById("searchContainer").style.display = "block";
    document.getElementById("like").style.display = "inline-block";
    document.getElementById("dislike").style.display = "inline-block";
  }
  loadGenres();
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const acceptTerms = document.getElementById("acceptTerms").checked;
  const error = document.getElementById("loginError");

  if (!username || !password) {
    error.textContent = "Completa todos los campos.";
    return;
  }

  if (!acceptTerms) {
    error.textContent = "Debes aceptar los Términos y Condiciones.";
    return;
  }

  try {
    const res = await fetch("/users.json");
    const users = await res.json();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      error.textContent = "Usuario o contraseña incorrectos.";
      return;
    }

    currentUser = user;
    document.cookie = `username=${user.username}; path=/`;
    document.cookie = `premium=${user.premium}; path=/`;
    document.cookie = `isLoggedIn=true; path=/`;

    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("registerToggle").style.display = "none";
    document.getElementById("menuUser").textContent = user.username;

    if (user.premium) {
      document.getElementById("searchContainer").style.display = "block";
      document.getElementById("like").style.display = "inline-block";
      document.getElementById("dislike").style.display = "inline-block";
    } else {
      document.getElementById("searchContainer").style.display = "none";
      document.getElementById("like").style.display = "none";
      document.getElementById("dislike").style.display = "none";
    }

    loadGenres();
  } catch (err) {
    error.textContent = "Error al cargar usuarios.";
    console.error(err);
  }
});

async function loadGenres() {
  const genres = ["Rock", "Pop", "Electronic", "HipHop", "Jazz", "Classical", "Reguetón", "Salsa", "Funk"];
  const container = document.getElementById("genreScroll");
  container.innerHTML = "";
  genres.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.onclick = () => {
  document.querySelectorAll("#genreScroll button").forEach(b => b.classList.remove("active-genre"));
  btn.classList.add("active-genre");
  loadSongs(g);
};
    container.appendChild(btn);
  });
}

const playBtn = document.getElementById("play");

// Función principal que actualiza el reproductor
function updatePlayer() {
  const song = songs[currentIndex];
  if (!song) return;

  audio.src = song.audio;
  document.getElementById("title").textContent = song.name;
  document.getElementById("artist").textContent = song.artist_name;
  document.getElementById("cover").src = song.image || "https://qu.ax/bieni.png";

  playBtn.textContent = "▶️"; // Espera que comience a sonar

  audio.play().catch(() => {
    console.warn("Reproducción automática bloqueada");
  });
}

// Evento del botón play/pause
playBtn.onclick = () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
};

// Estos eventos mantienen el ícono sincronizado
audio.addEventListener("play", () => {
  playBtn.textContent = "⏸️";
});

audio.addEventListener("pause", () => {
  playBtn.textContent = "▶️";
});

// Botón anterior
document.getElementById("prev").onclick = () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  updatePlayer();
};

// Botón siguiente con lógica de borrado
document.getElementById("next").onclick = () => {
  playedCount++;
  if (playedCount >= 6) {
    songs.splice(0, 4);
    playedCount = 2;
    currentIndex = 0;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  updatePlayer();
};
async function loadSongs(genre) {
  const client_id = "6c8a2737";
  const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${client_id}&format=json&limit=10&tags=${genre}&audioformat=mp32`);
  const data = await res.json();
  songs = data.results;
  currentIndex = 0;
  playedCount = 0;
  updatePlayer();
}

function updatePlayer() {
  const song = songs[currentIndex];
  if (!song) return;
  audio.src = song.audio;
  document.getElementById("title").textContent = song.name;
  document.getElementById("artist").textContent = song.artist_name;
  document.getElementById("cover").src = song.image || "https://qu.ax/bieni.png";
  audio.play();
}

document.getElementById("prev").onclick = () => {
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  updatePlayer();
};

document.getElementById("play").onclick = () => {
  if (audio.paused) {
    audio.play();
    document.getElementById("play").textContent = "⏸️";
  } else {
    audio.pause();
    document.getElementById("play").textContent = "▶️";
  }
};

document.getElementById("next").onclick = () => {
  playedCount++;
  if (playedCount >= 6) {
    songs.splice(0, 4);
    playedCount = 2;
    currentIndex = 0;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  updatePlayer();
};

document.getElementById("like").addEventListener("click", () => {
  if (isPremiumUser()) {
    savePreference("like");
  } else {
    alert("Función disponible solo para usuarios premium");
  }
});

document.getElementById("dislike").addEventListener("click", () => {
  if (isPremiumUser()) {
    savePreference("dislike");
  } else {
    alert("Función disponible solo para usuarios premium");
  }
});

function isPremiumUser() {
  return currentUser?.premium === true;
}

function savePreference(type) {
  const currentSong = songs[currentIndex];
  if (!currentSong || type !== "like") return;

  let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];

  if (!likedSongs.some(s => s.id === currentSong.id)) {
    likedSongs.push(currentSong);
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    alert("¡Canción añadida a favoritos!");
  } else {
    alert("Esta canción ya está en favoritos.");
  }
}

document.getElementById("search")?.addEventListener("keydown", async e => {
  if (e.key === "Enter") {
    const query = e.target.value;
    if (!query) return;
    const client_id = "6c8a2737";
    const res = await fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=${client_id}&format=json&limit=10&namesearch=${encodeURIComponent(query)}&audioformat=mp32`);
    const data = await res.json();
    songs = data.results;
    currentIndex = 0;
    playedCount = 0;
    updatePlayer();
  }
});

document.getElementById("menuToggle").onclick = () => {
  document.getElementById("sideMenu").style.display = "flex";
};

document.getElementById("closeMenu").onclick = () => {
  document.getElementById("sideMenu").style.display = "none";
};

document.getElementById("funcion2")?.addEventListener("click", () => {
  const liked = JSON.parse(localStorage.getItem("likedSongs")) || [];
  if (liked.length === 0) {
    alert("No tenés canciones favoritas todavía.");
    return;
  }
  songs = liked;
  currentIndex = 0;
  playedCount = 0;
  updatePlayer();
});
const volumeSlider = document.getElementById("volume");

if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });
}
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationTimeEl = document.getElementById("durationTime");

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const progress = (audio.currentTime / audio.duration) * 100;
  progressBar.value = progress;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationTimeEl.textContent = formatTime(audio.duration);
});

progressBar.addEventListener("input", () => {
  if (!audio.duration) return;
  if (!isPremiumUser()) {
    alert("Función exclusiva para usuarios premium");
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    return;
  }
  const time = (progressBar.value / 100) * audio.duration;
  audio.currentTime = time;
});

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}
document.getElementById("downloadBtn").addEventListener("click", () => {
  const song = songs[currentIndex];
  if (!song || !song.audio) return alert("No hay canción para descargar.");

  if (!isPremiumUser()) {
    const now = Date.now();
    const limit = 4;
    const windowMs = 30 * 60 * 1000;

    let downloads = JSON.parse(localStorage.getItem("downloads")) || [];
    downloads = downloads.filter(d => now - d < windowMs);

    if (downloads.length >= limit) {
      alert("Límite de 4 descargas cada 30 minutos alcanzado.");
      return;
    }

    downloads.push(now);
    localStorage.setItem("downloads", JSON.stringify(downloads));
  }

  const a = document.createElement("a");
  a.href = song.audio;
  a.download = `${song.artist_name} - ${song.name}.mp3`;
  a.target = "_blank";
  a.click();
});
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Faltan datos");
  }

  const usersPath = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));

  if (users.find(u => u.username === username)) {
    return res.status(409).send("El usuario ya existe");
  }

  const newUser = { username, password, premium: false };
  users.push(newUser);
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  res.send("¡Usuario registrado con éxito!");
});