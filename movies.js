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
    title: "Spider-Man Brand New Day Hindi (2026)",
    poster: "images/spider.jpg",
    driveLink: "https://drive.google.com/file/d/1QDHRH80Q6dbAh19kzcunn5MMXv1DiNZu/preview"
  },
  {
    id: 4,
    title: "Evil Dead Burn (Hindi)",
    poster: "images/evil.jpeg",
    driveLink: "https://drive.google.com/file/d/1BL6cnGlXBWis7oIIxKH-X2UqiiqgYKjS/preview"
  },
  {
    id: 5,
    title: "96 Movie (Hindi)",
    poster: "images/96.jpeg",
    driveLink: "https://youtu.be/63F9Pv4k4wk?si=TcTdO8yj8yfzJ0Mw"
  },
   {
    id: 6,
    title: "Middle Class Love (2022)",
    poster: "images/middle.jpeg",
    driveLink: "https://youtu.be/FjjxAiJLR7M?si=alQ1um_yqy1nF3oF"
  },
  {
    id: 7,
    title: "STAY TUNED",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 8,
    title: "STAY TUNED",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 9,
    title: "STAY TUNED",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  },
  {
    id: 10,
    title: "STAY TUNED",
    poster: "images/coming.png",
    driveLink: "https://drive.google.com/drive/u/0/my-drive"
  }
];

export { movies };
