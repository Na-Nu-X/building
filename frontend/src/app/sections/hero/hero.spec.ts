import { splitTitle } from './hero';

describe('splitTitle', () => {
  it('splits around the highlighted phrase', () => {
    expect(splitTitle('Postavíme dom. Premeníme priestor.', 'Premeníme')).toEqual([
      { text: 'Postavíme dom. ', highlight: false },
      { text: 'Premeníme', highlight: true },
      { text: ' priestor.', highlight: false },
    ]);
  });

  it('returns the whole title when the highlight is missing or not found', () => {
    expect(splitTitle('Titulok')).toEqual([{ text: 'Titulok', highlight: false }]);
    expect(splitTitle('Titulok', 'iné')).toEqual([{ text: 'Titulok', highlight: false }]);
  });
});
