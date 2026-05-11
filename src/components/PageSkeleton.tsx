export default function PageSkeleton({ title = "Caricamento" }: { title?: string }) {
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">{title}</div>
        <div className="topbar-right">
          <div className="skel-dot" />
        </div>
      </div>
      <div className="content">
        <div className="page-header">
          <div style={{ width: "100%" }}>
            <div className="skel skel-h2" />
            <div className="skel skel-text" style={{ width: "60%", marginTop: 8 }} />
          </div>
        </div>
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="kpi-card blue">
              <div className="skel skel-circle" />
              <div className="skel skel-text" style={{ width: "60%", marginTop: 10 }} />
              <div className="skel skel-text" style={{ width: "40%", marginTop: 8, height: 26 }} />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="skel skel-text" style={{ width: 180 }} />
          </div>
          <div style={{ padding: 16 }}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="skel skel-row"
                style={{ marginBottom: 10 }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
