export interface PopupStore {
  slug: string;
  name: string;
}

export const POPUP_STORES: PopupStore[] = [
  { slug: 'the-hyundai-daegu', name: '더현대 대구' },
  { slug: 'shinsegae-gangnam', name: '신세계 강남' },
];

export function getStoreBySlug(slug: string): PopupStore | undefined {
  return POPUP_STORES.find((s) => s.slug === slug);
}

export function getStoreNameBySlug(slug: string): string {
  return getStoreBySlug(slug)?.name ?? '';
}
