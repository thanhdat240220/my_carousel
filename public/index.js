import FakeCarousel from '../dist/fake-carousel.js'
//
const fakeCarousel = new FakeCarousel({
    id: "fake-carousel",
    carouselPageSize: 3,
    spaceItems: 10,
});
document
    .querySelector(".next")
    .addEventListener("click", () => fakeCarousel.next());
document
    .querySelector(".previous")
    .addEventListener("click", () => fakeCarousel.previous());