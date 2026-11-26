"use client";
import { Mascot } from "./Mascot";
export function StyleSoon() {
  return (
    <section className="view">
      <div className="card stage happy" style={{ textAlign: "center" }}>
        <div className="mascots"><Mascot kind="panda" mood="wink" /><Mascot kind="cat" mood="happy" /></div>
        <h3 style={{ marginTop: 8 }}>Dress up is moving in</h3>
        <p className="muted small" style={{ fontWeight: 700 }}>Boutique, closet, lookbook and Paw Cards are being ported next.</p>
      </div>
    </section>
  );
}
