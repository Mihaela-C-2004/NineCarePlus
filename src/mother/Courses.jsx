import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Icon, Segmented } from '../components/ui.jsx';
import { ArticleView } from './Assistant.jsx';

export default function Courses({ data, content, refresh, intent, clearIntent }) {
  const [view, setView] = useState('courses');
  const [courseId, setCourseId] = useState(null);
  const [lessonId, setLessonId] = useState(null);
  const [articleId, setArticleId] = useState(null);
  const done = new Set(data.progress);
  useEffect(() => {
    if (!intent) return;
    setArticleId(intent.articleId || null);
    setCourseId(intent.courseId || null);
    setLessonId(intent.lessonId || null);
    if (intent.articleId) setView('guides');
    clearIntent();
  }, [intent, clearIntent]);

  const course = content.courses.find((c) => c.id === courseId);
  const lesson = course?.lectii.find((l) => l.id === lessonId);
  const article = content.articles.find((a) => a.id === articleId);

  if (lesson) {
    const idx = course.lectii.indexOf(lesson);
    const next = course.lectii[idx + 1];
    const finished = done.has(lesson.id);
    return (
      <section className="stack">
        <button className="link-btn" onClick={() => setLessonId(null)}>‹ {course.titlu}</button>
        <article className="card article">
          <span className="tag">Lecția {idx + 1} din {course.lectii.length}</span>
          <h2>{lesson.titlu}</h2>
          <p>{lesson.text}</p>
        </article>
        <button className={`btn btn-wide ${finished ? 'btn-soft' : 'btn-primary'}`} onClick={async () => { await api.toggleLesson(lesson.id); refresh(); }}>
          {finished ? '✓ Lecție terminată' : 'Am terminat lecția'}
        </button>
        {next && <button className="btn btn-soft btn-wide" onClick={() => setLessonId(next.id)}>Lecția următoare: {next.titlu}</button>}
      </section>
    );
  }

  if (course) {
    const n = course.lectii.filter((l) => done.has(l.id)).length;
    return (
      <section className="stack">
        <button className="link-btn" onClick={() => setCourseId(null)}>‹ Toate cursurile</button>
        <div className="card">
          <span className="tag">{course.categorie}</span>
          <h2 className="card-title">{course.titlu}</h2>
          <Progress value={n} total={course.lectii.length} />
          <p className="fine-print">Autor: {course.autor}. Verificarea medicală e în așteptare.</p>
        </div>
        <ol className="lesson-list">
          {course.lectii.map((l, i) => (
            <li key={l.id}>
              <button className="lesson" onClick={() => setLessonId(l.id)}>
                <span className={`lesson-num ${done.has(l.id) ? 'done' : ''}`}>{done.has(l.id) ? <Icon name="check" size={16} /> : i + 1}</span>
                {l.titlu}
              </button>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (article) {
    return (
      <section className="stack">
        <button className="link-btn" onClick={() => setArticleId(null)}>‹ Toate ghidurile</button>
        <ArticleView article={article} />
      </section>
    );
  }

  const categories = [...new Set(content.articles.map((a) => a.categorie))];
  return (
    <section className="stack">
      <h1 className="screen-title">Cursuri și ghiduri</h1>
      <Segmented label="Tip" value={view} onChange={setView} options={[['courses', 'Cursuri'], ['guides', 'Ghiduri']]} />
      {view === 'courses' ? (
        content.courses.map((c) => {
          const n = c.lectii.filter((l) => done.has(l.id)).length;
          return (
            <button key={c.id} className="card course-card" onClick={() => setCourseId(c.id)}>
              <span className="tag">{c.categorie}</span>
              <strong>{c.titlu}</strong>
              <Progress value={n} total={c.lectii.length} />
            </button>
          );
        })
      ) : (
        categories.map((cat) => (
          <div key={cat} className="guide-group">
            <h2 className="group-title">{cat}</h2>
            {content.articles.filter((a) => a.categorie === cat).map((a) => (
              <button key={a.id} className="guide-row" onClick={() => setArticleId(a.id)}>{a.titlu}<span aria-hidden="true">›</span></button>
            ))}
          </div>
        ))
      )}
    </section>
  );
}

function Progress({ value, total }) {
  return (
    <div className="progress">
      <div className="progress-bar"><span style={{ width: `${(value / total) * 100}%` }} /></div>
      <small className="muted">{value} din {total} lecții</small>
    </div>
  );
}
