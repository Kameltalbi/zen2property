import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <article className="container legal-page">
      <h1>404</h1>
      <p>Cette page n’existe pas.</p>
      <p>
        <Link to="/">Retour à l’accueil</Link>
      </p>
    </article>
  );
}
