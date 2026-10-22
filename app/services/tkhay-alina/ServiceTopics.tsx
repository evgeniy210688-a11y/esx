'use client';

import { useState } from 'react';

const topics = ['Айди карта', 'Продление визы', 'Смена визы', 'Смена адреса', 'Апостиль'];

export default function ServiceTopics() {
  const [selected, setSelected] = useState<string | null>(null);
  const visaOpen = selected === 'Смена визы';
  return <section className="services-card specialist-topics" aria-label="Вопросы по документам">
    <div className="specialist-topic-buttons" role="group" aria-label="Выберите тему">
      {topics.map(topic => <button type="button" key={topic} aria-pressed={selected === topic}
        id={topic === 'Смена визы' ? 'visa-change-button' : undefined}
        aria-expanded={topic === 'Смена визы' ? visaOpen : undefined}
        aria-controls={topic === 'Смена визы' ? 'visa-change-details' : undefined}
        onClick={() => setSelected(current => current === topic ? null : topic)}>{topic}</button>)}
    </div>
    <div className="visa-change-panel" data-open={visaOpen} aria-hidden={!visaOpen} inert={!visaOpen}
      id="visa-change-details" role="region" aria-labelledby="visa-change-button">
      <div className="visa-change-inner"><div className="visa-change-content">
        <h2>Смена визы с H2 на F4</h2>
        <h3>Необходимые документы</h3>
        <ul>
          <li>Справка о 3- или 5-часовой учёбе</li>
          <li>Айди с двух сторон</li>
          <li>Паспорт</li>
          <li>Новое фото</li>
          <li>Свидетельство о рождении</li>
          <li>Договор аренды жилья (+ айди квартиросъёмщика)</li>
        </ul>
        <h3>Стоимость</h3>
        <ul>
          <li>Госпошлина — 39 000 (наличными)</li>
          <li>Работа юриста — 100 000</li>
          <li>Новое фото — 10 000</li>
          <li>Поиск учёбы — 10 000</li>
          <li>1 перевод — 30 000</li>
        </ul>
        <h3>Сроки</h3>
        <p>Ориентировочно 1–3 месяца.</p>
      </div></div>
    </div>
  </section>;
}
