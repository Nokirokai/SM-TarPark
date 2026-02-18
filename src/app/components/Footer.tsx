export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">SM</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">
                © 2026 SM Tarlac. All rights reserved.
              </p>
              <h3 className="text-xs text-primary font-black uppercase tracking-wide">
                Website by Angel Bitangcol
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-primary transition-colors">Contact Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
