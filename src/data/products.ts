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
];
