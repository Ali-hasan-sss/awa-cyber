export function AdminFooter() {
  return (
    <footer className="md:rounded-full border-t border-white/10 bg-white/[0.02] px-4 py-4 text-center text-xs text-slate-400 backdrop-blur-2xl">
      © {new Date().getFullYear()} AWA Cyber — Admin Panel
    </footer>
  );
}
