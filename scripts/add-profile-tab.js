import { readFileSync, writeFileSync } from 'fs';

let cd = readFileSync('src/components/CompanyDashboard.tsx', 'utf8');

const profileTabJSX = `
        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <div style={{ maxWidth: 560 }}>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
              Din profil i katalogen
            </h2>
            <p className="text-sm mb-6" style={{ color: '#4b5563' }}>
              Fyll i din profil för att synas i vår proffs-katalog. Husägare söker och filtrerar efter region och tjänst.
            </p>

            {profileLoading ? (
              <p style={{ color: '#4b5563' }}>Laddar profil…</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Region */}
                <div>
                  <label htmlFor="prof-region" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Region <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <select
                    id="prof-region"
                    value={profileRegion}
                    onChange={e => setProfileRegion(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14 }}
                  >
                    <option value="">Välj region…</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Categories */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 8 }}>Tjänster du erbjuder</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SERVICE_CATEGORIES.map(cat => {
                      const active = profileCategories.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setProfileCategories(prev =>
                            active ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                          )}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 99,
                            border: active ? '2px solid var(--primary-blue)' : '1px solid #e5e7eb',
                            backgroundColor: active ? '#e8f0fb' : '#fff',
                            color: active ? 'var(--primary-blue)' : 'var(--text-main)',
                            fontWeight: active ? 700 : 400,
                            fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="prof-bio" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Om företaget <span style={{ color: 'var(--accent-red)' }}>*</span>
                  </label>
                  <textarea
                    id="prof-bio"
                    rows={4}
                    value={profileBio}
                    onChange={e => setProfileBio(e.target.value)}
                    placeholder="Berätta kort om ditt företag, erfarenhet och vad ni specialiserar er på…"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="prof-phone" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    Telefon
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="070-123 45 67"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: 'var(--border-radius)', fontSize: 14, boxSizing: 'border-box' }}
                  />
                </div>

                {profileError && <p role="alert" style={{ color: 'var(--accent-red)', fontSize: 13 }}>{profileError}</p>}
                {profileSaved && <p style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>Profil sparad! Du syns nu i katalogen.</p>}

                <button
                  onClick={handleSaveProfile}
                  disabled={!profileRegion || !profileBio || profileSaving}
                  style={{
                    padding: '11px 0',
                    backgroundColor: 'var(--primary-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--border-radius)',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: profileRegion && profileBio && !profileSaving ? 'pointer' : 'not-allowed',
                    opacity: profileRegion && profileBio && !profileSaving ? 1 : 0.5,
                  }}
                >
                  {profileSaving ? 'Sparar…' : 'Spara profil'}
                </button>
              </div>
            )}
          </div>
        )}`;

// Insert before the last closing tags of the content div
const marker = '      </div>\n      </div>\n    </div>\n  );\n}';
if (cd.includes(marker)) {
  cd = cd.replace(marker, profileTabJSX + '\n' + marker);
  writeFileSync('src/components/CompanyDashboard.tsx', cd);
  console.log('Profile tab inserted OK');
} else {
  // Try with LF
  const markerLF = '      </div>\n      </div>\n    </div>\n  );\n}';
  const idx = cd.lastIndexOf('      </div>');
  console.log('Marker not found. Last </div> context:');
  console.log(JSON.stringify(cd.substring(idx - 10, idx + 60)));
}
