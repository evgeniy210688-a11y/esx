'use client';

import { useState } from 'react';

const countries = ['Узбекистан', 'Казахстан', 'Россия', 'Украина', 'Кыргызстан'];

export default function CitizenshipPicker() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return <section className="citizenship-picker">
    <button type="button" className="citizenship-toggle" aria-expanded={open} aria-controls="citizenship-options" onClick={() => setOpen(!open)}>
      Гражданином какой страны вы являетесь?
      <span aria-hidden="true">{open ? '▴' : '▾'}</span>
    </button>
    <div id="citizenship-options" hidden={!open}>
      <div className="citizenship-options" role="group" aria-label="Выберите страну гражданства">
        {countries.map(country => <button type="button" key={country} aria-pressed={selected === country} onClick={() => setSelected(country)}>
          {country}{selected === country && <span aria-hidden="true"> ✓</span>}
        </button>)}
      </div>
    </div>
    {selected && <p className="citizenship-selected" role="status">Выбрана страна: {selected}</p>}
  </section>;
}
