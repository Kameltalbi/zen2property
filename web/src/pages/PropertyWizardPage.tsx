import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useI18n } from '../i18n';
import { ConfirmDialog, PageHeader } from '../workspace/ui';

const STEPS = 5;

export function PropertyWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { locale, t } = useI18n();
  const fr = locale === 'fr';
  const [step, setStep] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({
    name: '',
    type: 'apartment',
    usage: 'rental',
    occupancy: 'vacant',
    address: '',
    city: '',
    surface: '',
    rooms: '',
    bedrooms: '',
    yearBuilt: '',
    amenities: '',
    description: '',
    acquiredAt: '',
    purchasePrice: '',
    fees: '',
    financing: 'cash',
    loanAmount: '',
    loanYears: '',
    installment: '',
    estimatedValue: '',
    estimatedAt: '',
    estimateSource: '',
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function saveDraft() {
    localStorage.setItem('rentelyo.propertyDraft', JSON.stringify(form));
    setNotice(fr ? 'Brouillon enregistré sur cet appareil.' : 'Draft saved on this device.');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (step < STEPS) {
      setStep((s) => s + 1);
      return;
    }
    setConfirm(true);
  }

  return (
    <>
      <PageHeader kicker={t.app.properties} title={id ? (fr ? 'Modifier le bien' : 'Edit property') : t.app.addProperty} />
      <div className="ws-progress" aria-hidden>
        <span style={{ width: `${(step / STEPS) * 100}%` }} />
      </div>
      <p className="muted">
        {fr ? 'Étape' : 'Step'} {step} / {STEPS}
      </p>
      {notice && <p className="ok">{notice}</p>}
      <form className="ws-card form" onSubmit={onSubmit}>
        {step === 1 && (
          <>
            <label>
              {fr ? 'Nom du bien' : 'Property name'}
              <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </label>
            <div className="grid-2">
              <label>
                {fr ? 'Type' : 'Type'}
                <select value={form.type} onChange={(e) => set('type', e.target.value)}>
                  <option value="apartment">{fr ? 'Appartement' : 'Apartment'}</option>
                  <option value="house">{fr ? 'Maison' : 'House'}</option>
                  <option value="studio">Studio</option>
                  <option value="other">{fr ? 'Autre' : 'Other'}</option>
                </select>
              </label>
              <label>
                {fr ? 'Usage' : 'Use'}
                <select value={form.usage} onChange={(e) => set('usage', e.target.value)}>
                  <option value="rental">{fr ? 'Locatif' : 'Rental'}</option>
                  <option value="personal">{fr ? 'Personnel' : 'Personal'}</option>
                  <option value="mixed">{fr ? 'Mixte' : 'Mixed'}</option>
                </select>
              </label>
            </div>
            <label>
              {fr ? 'Occupation' : 'Occupancy'}
              <select value={form.occupancy} onChange={(e) => set('occupancy', e.target.value)}>
                <option value="rented">{fr ? 'Loué' : 'Rented'}</option>
                <option value="vacant">{fr ? 'Vacant' : 'Vacant'}</option>
                <option value="personal">{fr ? 'Usage perso' : 'Personal use'}</option>
              </select>
            </label>
            <label>
              {fr ? 'Adresse' : 'Address'}
              <input value={form.address} onChange={(e) => set('address', e.target.value)} required />
            </label>
            <label>
              {fr ? 'Ville' : 'City'}
              <input value={form.city} onChange={(e) => set('city', e.target.value)} required />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <div className="grid-2">
              <label>
                {fr ? 'Surface (m²)' : 'Area (m²)'}
                <input type="number" min="0" value={form.surface} onChange={(e) => set('surface', e.target.value)} />
              </label>
              <label>
                {fr ? 'Pièces' : 'Rooms'}
                <input type="number" min="0" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} />
              </label>
            </div>
            <div className="grid-2">
              <label>
                {fr ? 'Chambres' : 'Bedrooms'}
                <input type="number" min="0" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} />
              </label>
              <label>
                {fr ? 'Année de construction' : 'Year built'}
                <input type="number" min="1800" value={form.yearBuilt} onChange={(e) => set('yearBuilt', e.target.value)} />
              </label>
            </div>
            <label>
              {fr ? 'Équipements' : 'Amenities'}
              <input value={form.amenities} onChange={(e) => set('amenities', e.target.value)} />
            </label>
            <label>
              Description
              <textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
            </label>
          </>
        )}
        {step === 3 && (
          <>
            <label>
              {fr ? 'Date d’acquisition' : 'Acquisition date'}
              <input type="date" value={form.acquiredAt} onChange={(e) => set('acquiredAt', e.target.value)} />
            </label>
            <div className="grid-2">
              <label>
                {fr ? 'Prix d’achat' : 'Purchase price'}
                <input type="number" min="0" value={form.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} />
              </label>
              <label>
                {fr ? 'Frais d’acquisition' : 'Acquisition costs'}
                <input type="number" min="0" value={form.fees} onChange={(e) => set('fees', e.target.value)} />
              </label>
            </div>
            <label>
              {fr ? 'Financement' : 'Financing'}
              <select value={form.financing} onChange={(e) => set('financing', e.target.value)}>
                <option value="cash">{fr ? 'Comptant' : 'Cash'}</option>
                <option value="loan">{fr ? 'Crédit' : 'Mortgage'}</option>
                <option value="mixed">{fr ? 'Mixte' : 'Mixed'}</option>
              </select>
            </label>
            <div className="grid-2">
              <label>
                {fr ? 'Montant du crédit' : 'Loan amount'}
                <input type="number" min="0" value={form.loanAmount} onChange={(e) => set('loanAmount', e.target.value)} />
              </label>
              <label>
                {fr ? 'Durée (années)' : 'Term (years)'}
                <input type="number" min="0" value={form.loanYears} onChange={(e) => set('loanYears', e.target.value)} />
              </label>
            </div>
            <label>
              {fr ? 'Mensualité' : 'Monthly payment'}
              <input type="number" min="0" value={form.installment} onChange={(e) => set('installment', e.target.value)} />
            </label>
          </>
        )}
        {step === 4 && (
          <>
            <label>
              {fr ? 'Valeur estimée' : 'Estimated value'}
              <input type="number" min="0" value={form.estimatedValue} onChange={(e) => set('estimatedValue', e.target.value)} />
            </label>
            <label>
              {fr ? 'Date de l’estimation' : 'Valuation date'}
              <input type="date" value={form.estimatedAt} onChange={(e) => set('estimatedAt', e.target.value)} />
            </label>
            <label>
              {fr ? 'Méthode / source' : 'Method / source'}
              <input value={form.estimateSource} onChange={(e) => set('estimateSource', e.target.value)} />
            </label>
          </>
        )}
        {step === 5 && (
          <>
            <p className="muted">
              {fr
                ? 'Photos et pièces (titre, acte, plans, assurances, diagnostics). Le stockage serveur sera branché après validation du schéma.'
                : 'Photos and files (title, deed, plans, insurance, diagnostics). Server storage will be wired after the schema is approved.'}
            </p>
            <label>
              {fr ? 'Photo principale' : 'Cover photo'}
              <input type="file" accept="image/*" />
            </label>
            <label>
              {fr ? 'Galerie' : 'Gallery'}
              <input type="file" accept="image/*" multiple />
            </label>
            <label>
              {fr ? 'Documents' : 'Documents'}
              <input type="file" multiple />
            </label>
          </>
        )}
        <div className="ws-actions">
          {step > 1 && (
            <button className="btn secondary" type="button" onClick={() => setStep((s) => s - 1)}>
              {fr ? 'Retour' : 'Back'}
            </button>
          )}
          <button className="btn ghost" type="button" onClick={saveDraft}>
            {fr ? 'Enregistrer le brouillon' : 'Save draft'}
          </button>
          <button className="btn" type="submit">
            {step < STEPS ? (fr ? 'Continuer' : 'Continue') : fr ? 'Enregistrer' : 'Save'}
          </button>
        </div>
      </form>
      <ConfirmDialog
        open={confirm}
        title={fr ? 'Confirmer l’enregistrement ?' : 'Confirm save?'}
        body={fr ? 'Le bien sera ajouté à la démonstration locale (hors base pour l’instant).' : 'The property will be added to the local demo (not the database yet).'}
        confirmLabel={fr ? 'Confirmer' : 'Confirm'}
        onCancel={() => setConfirm(false)}
        onConfirm={() => navigate('/app/properties')}
      />
    </>
  );
}
