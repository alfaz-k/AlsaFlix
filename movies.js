// ============================================================
// MOVIES.JS
// All movie data lives here. dashboard.js reads this array and
// generates every card dynamically — no hardcoded movie HTML.
//
// To add a movie: copy an object below, give it a unique id,
// and fill in title / poster / driveLink. poster can be a local
// path (images/yourfile.jpg) or a hosted image URL.
// ============================================================

const movies = [
  {
    id: 1,
    title: "Obsession",
    poster: "images/obsession.jpg",
    driveLink: "https://drive.google.com/file/d/1amOq64r94rrkgFu76_58siP7yZ1vA169/preview"
  },
  {
    id: 2,
    title: "Mein Vapaas Aunga",
    poster: "images/wapis.jpg",
    driveLink: "https://drive.google.com/file/d/1n8TgLHzwCak_WVLAnDBD1z6uJQkNSdv5/preview"
  },
  {
    id: 3,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 4,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 5,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 6,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 7,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 8,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 9,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 10,
    title: "STAY TONE",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  }
];

export { movies };