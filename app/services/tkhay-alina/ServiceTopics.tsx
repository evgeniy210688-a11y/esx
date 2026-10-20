'use client';

import { useState } from 'react';

const topics = ['Айди карта', 'Продление визы', 'Смена статуса', 'Смена адреса', 'Апостиль'];

export default function ServiceTopics() {
  const [selected, setSelected] = useState<string | null>(null);
  return <section className="services-card specialist-topics" aria-label="Вопросы по документам">
    <div className="specialist-topic-buttons" role="group" aria-label="Выберите тему">
      {topics.map(topic => <button type="button" key={topic} aria-pressed={selected === topic}
        onClick={() => setSelected(current => current === topic ? null : topic)}>{topic}</button>)}
    </div>
  </section>;
}
