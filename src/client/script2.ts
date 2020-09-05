const container = document.querySelector("#main") as HTMLDivElement;

interface Song {
  title: string;
  uri: string;
  image: string;
}
interface GenericElement extends HTMLElement {
  href?: string;
  target?: string;
}
let songs = (window as Window & typeof globalThis & { songs: Array<Song> })
  .songs;
if (container) {
  const Child = function (
    parent: Element,
    nodeType: string,
    content: string,
    className: string
  ) {
    const node: GenericElement = document.createElement(nodeType);
    className && node.classList.add(className);
    if (content) {
      if (className === "button") {
        node.innerText = "Play";
      } else if (className !== "card-front") {
        node.innerText = content;
      } else {
        const p = document.createElement("h2");
        p.classList.add("title");
        p.innerText = content;
        node.appendChild(p);
      }
    }
    parent.appendChild(node);
    return node;
  };

  const Card = function (data: Song) {
    const cardContainer = Child(container, "div", "", "card-container");

    const card = Child(cardContainer, "div", "", "card");
    const cardFront = Child(card, "div", data.title, "card-front");
    const cardBack = Child(card, "div", "", "card-back");
    const back = `url(${data.image}) no-repeat center/cover`;

    cardBack.style.background = back;
    cardFront.style.background = back;

    Child(cardBack, "h1", data.title, "title");
    const button = Child(cardBack, "button", data.uri, "button");
    button.onclick = () => {
      fetchSong(data.uri.replace(/(.*)watch\?v=/, ""));
      selectedSong = data;
    };
  };

  songs.forEach((card: Song) => Card(card));
}

const submito = (event: any) => {
  event.preventDefault();

  const {
    target: { title, uri, image },
  } = event;
  if (uri.value === "") {
    return;
  }
  const newSong = {
    title: title.value,
    uri: uri.value.replace(/&list.*/, ""),
    image: image.value,
  };

  songs.push(newSong);
  title.value = "";
  uri.value = "";
  image.value = "";
  console.log(JSON.stringify(songs, null, 2));
};
