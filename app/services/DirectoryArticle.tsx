import Image from 'next/image';
import { Fragment } from 'react';
import copy from './directory-article-copy.json';
import type { InterfaceLanguage } from './serviceLabels';
import './directory-article.css';

export default function DirectoryArticle({ language }: { language: InterfaceLanguage }) {
  if (language !== 'ru' && language !== 'en' && language !== 'ko') return null;
  const text = copy[language];
  const renderImage = (index: number) => <figure>
    <Image src={index === 0 ? '/services/article/korea-specialists-comic.webp' : '/services/article/korea-everyday-comic.webp'} alt={text.images[index].alt} width={1536} height={1024} sizes="(max-width: 760px) 100vw, 960px" />
    <figcaption>{text.images[index].caption}</figcaption>
  </figure>;

  return <>
    <p className="directory-article-intro" lang={language} onCopy={event => event.preventDefault()} onCut={event => event.preventDefault()}>{text.intro}</p>
    <article className="directory-article" lang={language} aria-labelledby="directory-guide-title" onCopy={event => event.preventDefault()} onCut={event => event.preventDefault()}>
      <header>
        <p className="directory-article-kicker">{text.kicker}</p>
        <h2 id="directory-guide-title">{text.title}</h2>
        <p className="directory-article-lead">{text.lead}</p>
      </header>
      <p>{text.opening}</p>
      {renderImage(0)}
      {text.sections.map((section, index) => <Fragment key={index}>
        {index === 3 && renderImage(1)}
        <section className={index === text.sections.length - 1 ? 'directory-article-summary' : undefined}>
          <h3>{section.title}</h3>
          {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
        </section>
      </Fragment>)}
    </article>
  </>;
}
