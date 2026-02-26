export interface Product {
  id: number;
  name: string;
  number: number;
  category: number;
  image: string;
  price: number;
}

export const CATEGORY_NAMES: Record<number, string> = {
  1: '시리즈 1',
  2: '시리즈 2',
  3: '시리즈 3',
  4: '한식 시리즈',
};

export const products: Product[] = [
  { id: 1, name: '11번 기린', number: 11, category: 1, image: '/girin-1-11.png', price: 20000 },
  { id: 2, name: '22번 기린', number: 22, category: 1, image: '/girin-1-22.png', price: 20000 },
  { id: 3, name: '35번 기린', number: 35, category: 1, image: '/girin-1-35.png', price: 20000 },
  { id: 4, name: '51번 기린', number: 51, category: 1, image: '/girin-1-51.png', price: 20000 },
  { id: 5, name: '52번 기린', number: 52, category: 1, image: '/girin-1-52.png', price: 20000 },
  { id: 6, name: '48번 기린', number: 48, category: 2, image: '/girin-2-48.png', price: 20000 },
  { id: 7, name: '50번 기린', number: 50, category: 2, image: '/girin-2-50.png', price: 20000 },
  { id: 8, name: '98번 기린', number: 98, category: 2, image: '/girin-2-98.png', price: 20000 },
  { id: 9, name: '75번 기린', number: 75, category: 3, image: '/girin-3-75.png', price: 20000 },
  { id: 10, name: '108번 기린', number: 108, category: 3, image: '/girin-3-108.png', price: 20000 },
  { id: 11, name: '114번 기린', number: 114, category: 3, image: '/girin-3-114.png', price: 20000 },
  { id: 12, name: '131번 기린', number: 131, category: 3, image: '/girin-3-131.png', price: 20000 },
  { id: 13, name: '155번 기린', number: 155, category: 3, image: '/girin-3-155.png', price: 20000 },
  { id: 14, name: '163번 기린', number: 163, category: 3, image: '/girin-3-163.png', price: 20000 },
  { id: 15, name: '간장게장', number: 0, category: 4, image: '/ganjang-gejang.png', price: 20000 },
  { id: 16, name: '간장치킨', number: 0, category: 4, image: '/ganjang-chicken.png', price: 20000 },
  { id: 17, name: '갈치구이', number: 0, category: 4, image: '/galchi-gui.png', price: 20000 },
  { id: 18, name: '갈치조림', number: 0, category: 4, image: '/galchi-jorim.png', price: 20000 },
  { id: 19, name: '갓김치', number: 0, category: 4, image: '/gat-kimchi.png', price: 20000 },
  { id: 20, name: '계란초밥', number: 0, category: 4, image: '/gyeran-chobap.png', price: 20000 },
  { id: 21, name: '고량주', number: 0, category: 4, image: '/goryangju.png', price: 20000 },
  { id: 22, name: '광어', number: 0, category: 4, image: '/gwangeo.png', price: 20000 },
  { id: 23, name: '구슬아이스크림', number: 0, category: 4, image: '/guseul-icecream.png', price: 20000 },
  { id: 24, name: '굴', number: 0, category: 4, image: '/gul.png', price: 20000 },
  { id: 25, name: '김밥', number: 0, category: 4, image: '/gimbap.png', price: 20000 },
  { id: 26, name: '김치', number: 0, category: 4, image: '/kimchi.png', price: 20000 },
  { id: 27, name: '김치찌개', number: 0, category: 4, image: '/kimchi-jjigae.png', price: 20000 },
  { id: 28, name: '닭가슴살', number: 0, category: 4, image: '/dak-gaseumssal.png', price: 20000 },
  { id: 29, name: '대방어', number: 0, category: 4, image: '/daebangeo.png', price: 20000 },
  { id: 30, name: '데킬라', number: 0, category: 4, image: '/tequila.png', price: 20000 },
  { id: 31, name: '돈까스', number: 0, category: 4, image: '/donkatsu.png', price: 20000 },
  { id: 32, name: '돼지국밥', number: 0, category: 4, image: '/dwaeji-gukbap.png', price: 20000 },
  { id: 33, name: '두바이쫀득쿠키', number: 0, category: 4, image: '/dubai-cookie.png', price: 20000 },
  { id: 34, name: '딸기', number: 0, category: 4, image: '/strawberry.png', price: 20000 },
  { id: 35, name: '딸기모찌', number: 0, category: 4, image: '/strawberry-mochi.png', price: 20000 },
  { id: 36, name: '딸기우유', number: 0, category: 4, image: '/strawberry-milk.png', price: 20000 },
  { id: 37, name: '땅콩막걸리', number: 0, category: 4, image: '/peanut-makgeolli.png', price: 20000 },
];
