/**
 * Tek düzenlenebilir işletme yapılandırması.
 * Yayına almadan önce yalnızca doğrulanmış gerçek bilgileri girin.
 * Boş alanlar özellikle boş bırakılmıştır; örnek iletişim bilgisi değildir.
 */
export const businessConfig = {
  name: '',
  phone: '',
  whatsapp: '',
  address: '',
  city: '',
  district: '',
  serviceAreas: [] as string[],
  openingHours: '',
  directionsUrl: '',
  canonicalBaseUrl: '',
  /** LocalBusiness şeması için işletme bilgileri doğrulanmış olmalıdır. */
  verifiedBusinessDetails: false,
};
