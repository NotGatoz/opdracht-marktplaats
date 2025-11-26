export function AuthHeader() {
  return (
    <div className="top">
      <div className="bar theme-d2" style={{display: 'flex', justifyContent: 'space-between'}}>
        <div style={{visibility: 'hidden', padding: '0.5rem 0.75rem'}}>
          <button className="button small padding-small">Invisible</button>
        </div>
      </div>
    </div>
  );
}
