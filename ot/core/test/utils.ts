export function shuffle(array: unknown[]): void {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    const current = array[currentIndex];

    array[currentIndex] = array[randomIndex];
    array[randomIndex] = current;
  }
}

export function shuffleFor(array: unknown[], times: number) {
  for (let i = 0; i < times; i++) {
    shuffle(array);
  }
}
