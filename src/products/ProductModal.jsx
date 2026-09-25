export default function ProductModal({ product, onClose, onSave }) {
  const submit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave({ ...(product || {}), name: data.get('name').trim(), acronym: data.get('acronym').trim().toUpperCase() });
  };

  return <div className="modal-backdrop" onClick={event => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="productModalTitle"><div className="modal-header"><div><p className="eyebrow">PRODUCT CONFIGURATION</p><h2 id="productModalTitle">{product ? 'Edit product' : 'Add product'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form onSubmit={submit}><label>Full product name<input name="name" required defaultValue={product?.name || ''} placeholder="e.g. Credit Platform" autoFocus /></label><label>Acronym<input name="acronym" required maxLength="10" defaultValue={product?.acronym || ''} placeholder="e.g. CP" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">Save product</button></div></form></div></div>;
}
