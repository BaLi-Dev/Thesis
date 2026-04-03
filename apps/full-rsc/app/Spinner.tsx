export default function Spinner({ size = 24 }: { size?: number }) {
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "3px solid #eee",
        borderTop: "3px solid #e63946",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
    </>
  );
}
