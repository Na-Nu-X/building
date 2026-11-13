import { directionsUrl, formatAddress, initials, mailHref, telHref, yearsSince } from './contact';

describe('contact utils', () => {
  it('builds a dialable tel: link', () => {
    expect(telHref('+421 900 / 123-456')).toBe('tel:+421900123456');
  });

  it('builds mailto links with an encoded subject', () => {
    expect(mailHref('a@b.sk')).toBe('mailto:a@b.sk');
    expect(mailHref('a@b.sk', 'Cenová ponuka')).toBe('mailto:a@b.sk?subject=Cenov%C3%A1%20ponuka');
  });

  it('formats a Slovak address', () => {
    const address = { street: 'Hlavná 1', zip: '917 01', city: 'Trnava', country: 'Slovensko' };
    expect(formatAddress(address)).toBe('Hlavná 1, 917 01 Trnava');
    expect(formatAddress(address, true)).toBe('Hlavná 1, 917 01 Trnava, Slovensko');
  });

  it('builds a directions URL', () => {
    expect(directionsUrl(48.1, 17.2)).toBe('https://www.google.com/maps/dir/?api=1&destination=48.1,17.2');
  });

  it('computes years in business', () => {
    expect(yearsSince(2009, new Date(2026, 0, 1))).toBe(17);
    expect(yearsSince(2030, new Date(2026, 0, 1))).toBe(0);
  });

  it('derives logo initials', () => {
    expect(initials('Stavby Novák')).toBe('SN');
    expect(initials('ďalšia firma s.r.o.')).toBe('ĎF');
  });
});
